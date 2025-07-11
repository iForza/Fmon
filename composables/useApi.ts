import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'

// API клиент для работы с серверными данными вместо браузерного MQTT
interface VehicleData {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  status: string
  timestamp: Date
  lastUpdate: Date
  battery?: number
  temperature?: number
  rpm?: number
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  count?: number
  status?: string
  database?: string
}

export const useApi = () => {
  const vehicles = ref<Map<string, VehicleData>>(new Map())
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const wsConnection = ref<WebSocket | null>(null)
  
  // Хранение интервалов для очистки и состояния polling
  let pollingInterval: NodeJS.Timeout | null = null
  let reconnectTimeout: NodeJS.Timeout | null = null
  let lastTimestamp = ref<number>(0)
  let pollingSpeed = ref<number>(5000) // Начальная скорость 5 секунд
  let consecutiveEmptyResponses = ref<number>(0) // Счетчик пустых ответов
  let hasActiveVehicles = ref<boolean>(false) // Флаг активности техники

  // API базовый URL - используем правильный сервер с БД на порту 3001
  const getApiBase = () => {
    if (process.client) {
      // В браузере используем текущий хост с портом 3001
      return `${window.location.protocol}//${window.location.hostname}:3001/api`
    } else {
      // На сервере используем localhost
      return 'http://127.0.0.1:3001/api'
    }
  }
  const apiBase = getApiBase()

  // Получение всех транспортных средств
  const fetchVehicles = async (): Promise<VehicleData[]> => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<ApiResponse<VehicleData[]>>(`${apiBase}/vehicles`)
      
      if (response.data) {
        // Обновляем локальное хранилище
        vehicles.value.clear()
        response.data.forEach(vehicle => {
          vehicles.value.set(vehicle.id, {
            ...vehicle,
            timestamp: new Date(vehicle.timestamp),
            lastUpdate: new Date(vehicle.lastUpdate || vehicle.timestamp)
          })
        })
        return response.data
      }
      return []
    } catch (err: any) {
      error.value = err.message || 'Ошибка получения данных о технике'
      console.error('API Error (vehicles):', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Получение новых данных телеметрии (delta-запрос)
  const fetchTelemetryDelta = async () => {
    try {
      const response = await $fetch<ApiResponse<any[]> & { lastTimestamp?: number }>(`${apiBase}/telemetry/delta?since=${lastTimestamp.value}`)
      const telemetryData = response.data || []
      
      // Обновляем lastTimestamp для следующего запроса
      if (response.lastTimestamp) {
        lastTimestamp.value = response.lastTimestamp
      }
      
      return { data: telemetryData, count: telemetryData.length }
    } catch (err: any) {
      error.value = err.message || 'Ошибка получения delta телеметрии'
      console.error('API Error (delta telemetry):', err)
      return { data: [], count: 0 }
    }
  }

  // Получение последней телеметрии (полный запрос как fallback)
  const fetchTelemetry = async () => {
    try {
      const response = await $fetch<ApiResponse<any[]>>(`${apiBase}/telemetry/latest`)
      const telemetryData = response.data || []
      
      if (Array.isArray(telemetryData)) {
        console.log(`📡 Обработка ${telemetryData.length} записей телеметрии`)
        
        // Обновляем данные техники с новой телеметрией
        telemetryData.forEach(item => {
          if (item.vehicle_id) {
            console.log(`🔧 Обновление техники ${item.vehicle_id}:`, {
              lat: item.lat,
              lng: item.lng, 
              speed: item.speed,
              status: (item.speed > 0) ? 'active' : 'stopped',
              battery: item.battery,
              temperature: item.temperature
            })
            
            const existing = vehicles.value.get(item.vehicle_id) || {
              id: item.vehicle_id,
              name: item.vehicle_name || `ESP32 ${item.vehicle_id}`,
              status: 'stopped'
            }

            const updated: VehicleData = {
              ...existing,
              id: item.vehicle_id,
              name: item.vehicle_name || existing.name,
              lat: parseFloat(item.lat) || 0,
              lng: parseFloat(item.lng) || 0,
              speed: parseFloat(item.speed) || 0,
              battery: item.battery ? parseFloat(item.battery) : undefined,
              temperature: item.temperature ? parseFloat(item.temperature) : undefined,
              rpm: item.rpm ? parseInt(item.rpm) : undefined,
              // Определяем статус на основе скорости (как делает ESP32)
              status: (parseFloat(item.speed) || 0) > 0 ? 'active' : 'stopped',
              timestamp: new Date(item.timestamp),
              lastUpdate: new Date(item.timestamp)
            }

            vehicles.value.set(item.vehicle_id, updated)
          }
        })

        // Умное обновление реактивности - только если есть изменения
        const updatedVehicles = new Map(vehicles.value)
        if (updatedVehicles.size !== vehicles.value.size || telemetryData.length > 0) {
          vehicles.value = updatedVehicles
        }
        
        console.log(`✅ Обновлено техники: ${vehicles.value?.size || 0}`)
      }
      
      return telemetryData
    } catch (err: any) {
      error.value = err.message || 'Ошибка получения телеметрии'
      console.error('API Error (telemetry):', err)
      return []
    }
  }

  // Проверка статуса API
  const checkApiStatus = async () => {
    try {
      const response = await $fetch<ApiResponse<any>>(`${apiBase}/status`)
      isConnected.value = response.status === 'API Server running with SQLite'
      return response
    } catch (err: any) {
      isConnected.value = false
      error.value = err.message || 'API недоступен'
      return null
    }
  }

  // Подключение WebSocket для real-time обновлений (опционально)
  const connectWebSocket = () => {
    if (process.client) {
      try {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
        wsConnection.value = new WebSocket(wsUrl)

        wsConnection.value.onopen = () => {
          console.log('✅ WebSocket connected')
        }

        wsConnection.value.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📡 WebSocket data:', data)
            
            if (data.type === 'vehicle_update' && data.data) {
              const vehicle = data.data
              vehicles.value.set(vehicle.id, {
                ...vehicle,
                timestamp: new Date(vehicle.timestamp),
                lastUpdate: new Date()
              })
              vehicles.value = new Map(vehicles.value)
            }
          } catch (err) {
            console.error('WebSocket message error:', err)
          }
        }

        wsConnection.value.onclose = () => {
          console.log('❌ WebSocket disconnected')
          // Очищаем предыдущий timeout переподключения
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout)
          }
          // Переподключение через 5 секунд
          reconnectTimeout = setTimeout(connectWebSocket, 5000)
        }

        wsConnection.value.onerror = (err) => {
          console.error('WebSocket error:', err)
        }
      } catch (err) {
        console.error('WebSocket connection failed:', err)
      }
    }
  }

  // Отключение WebSocket
  const disconnectWebSocket = () => {
    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
    }
    
    // Очищаем timeout переподключения
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  }

  // Инициализация - получение данных
  const initialize = async () => {
    console.log('🔄 Инициализация API клиента...')
    
    // Проверяем статус API
    await checkApiStatus()
    
    if (isConnected.value) {
      // Сначала получаем список техники из SQLite
      console.log('📋 Получение списка техники из SQLite...')
      await fetchVehicles()
      
      // Затем получаем телеметрию и объединяем данные
      console.log('📡 Получение телеметрии ESP32...')
      await fetchTelemetry()
      
      console.log(`✅ API клиент инициализирован. Техники: ${vehicles.value?.size || 0}`)
    } else {
      console.error('❌ API недоступен')
    }
  }

  // Функция для расчета адаптивной скорости polling
  const calculatePollingSpeed = (dataCount: number, hasActive: boolean) => {
    if (dataCount === 0) {
      consecutiveEmptyResponses.value++
      // Если нет данных, постепенно увеличиваем интервал
      if (consecutiveEmptyResponses.value > 3) {
        return Math.min(15000, pollingSpeed.value * 1.5) // Максимум 15 секунд
      }
    } else {
      consecutiveEmptyResponses.value = 0
      // Если есть активная техника - частые запросы, иначе - реже
      return hasActive ? 2000 : 8000
    }
    return pollingSpeed.value
  }

  // Автоматическое обновление данных с адаптивной скоростью
  const startPolling = () => {
    // Останавливаем предыдущий polling если он существует
    stopPolling()
    
    const performPolling = async () => {
      if (!isConnected.value) return
      
      try {
        // Используем delta-запрос для оптимизации
        const deltaResult = await fetchTelemetryDelta()
        
        // Анализируем активность техники
        hasActiveVehicles.value = Array.from(vehicles.value.values()).some(v => 
          v.status === 'active' || (v.speed || 0) > 0
        )
        
        // Рассчитываем новую скорость polling
        const newSpeed = calculatePollingSpeed(deltaResult.count, hasActiveVehicles.value)
        
        if (newSpeed !== pollingSpeed.value) {
          pollingSpeed.value = newSpeed
          console.log(`🔄 Скорость polling изменена на ${pollingSpeed.value}ms`)
          
          // Перезапускаем polling с новой скоростью
          stopPolling()
          pollingInterval = setTimeout(performPolling, pollingSpeed.value)
          return
        }
        
      } catch (err) {
        console.error('Polling error:', err)
        // При ошибке используем fallback - полный запрос
        await fetchTelemetry()
      }
      
      // Планируем следующий запрос
      pollingInterval = setTimeout(performPolling, pollingSpeed.value)
    }
    
    // Запускаем первый запрос
    performPolling()

    // Очистка при размонтировании компонента (только если есть активный компонент)
    if (getCurrentInstance()) {
      onUnmounted(() => {
        stopPolling()
        disconnectWebSocket()
      })
    }

    // Возвращаем функцию для ручной очистки
    return stopPolling
  }

  // Остановка polling (теперь работает с setTimeout)
  const stopPolling = () => {
    if (pollingInterval) {
      clearTimeout(pollingInterval)
      pollingInterval = null
    }
  }

  // Полная очистка ресурсов
  const cleanup = () => {
    stopPolling()
    disconnectWebSocket()
  }

  // Вычисляемые свойства
  const allVehicles = computed(() => Array.from(vehicles.value.values()))
  const activeVehicles = computed(() => {
    const now = Date.now()
    return allVehicles.value.filter(v => {
      // Считаем технику активной если:
      // 1. Статус явно 'active' (ESP32 передаёт это поле)
      // 2. ИЛИ скорость больше 0
      // 3. И последнее обновление было менее 60 секунд назад (техника онлайн)
      const hasActiveStatus = v.status === 'active'
      const isMoving = (v.speed || 0) > 0
      const isOnline = v.lastUpdate && (now - new Date(v.lastUpdate).getTime()) < 60000 // 1 минута
      
      console.log(`🚜 ${v.id}: status=${v.status}, speed=${v.speed}, online=${isOnline}, active=${hasActiveStatus || isMoving}`)
      
      return (hasActiveStatus || isMoving) && isOnline
    }).length
  })

  return {
    // Состояние
    vehicles,
    isConnected,
    isLoading,
    error,
    
    // Методы
    fetchVehicles,
    fetchTelemetry,
    fetchTelemetryDelta,
    checkApiStatus,
    initialize,
    startPolling,
    stopPolling,
    connectWebSocket,
    disconnectWebSocket,
    cleanup,
    
    // Вычисляемые свойства
    allVehicles,
    activeVehicles
  }
} 