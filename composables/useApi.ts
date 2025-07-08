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
  
  // Хранение интервалов для очистки
  let pollingInterval: NodeJS.Timeout | null = null
  let reconnectTimeout: NodeJS.Timeout | null = null

  // API базовый URL
  const apiBase = '/api'

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

  // Получение последней телеметрии
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

        // Принудительно обновляем реактивность
        vehicles.value = new Map(vehicles.value)
        
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

  // Автоматическое обновление данных каждые 5 секунд
  const startPolling = () => {
    // Останавливаем предыдущий polling если он существует
    stopPolling()
    
    pollingInterval = setInterval(async () => {
      if (isConnected.value) {
        await fetchTelemetry()
      }
    }, 5000)

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

  // Остановка polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
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