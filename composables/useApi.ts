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
      const response = await $fetch<any[]>(`${apiBase}/telemetry/latest`)
      
      if (Array.isArray(response)) {
        // Обновляем данные техники с новой телеметрией
        response.forEach(item => {
          if (item.vehicle_id) {
            const existing = vehicles.value.get(item.vehicle_id) || {
              id: item.vehicle_id,
              name: item.vehicle_name || `Техника ${item.vehicle_id}`,
              status: 'active'
            }

            const updated: VehicleData = {
              ...existing,
              lat: item.lat,
              lng: item.lng,
              speed: item.speed || 0,
              battery: item.battery,
              timestamp: new Date(item.timestamp),
              lastUpdate: new Date(item.timestamp)
            }

            vehicles.value.set(item.vehicle_id, updated)
          }
        })

        // Принудительно обновляем реактивность
        vehicles.value = new Map(vehicles.value)
      }
      
      return response
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
          // Переподключение через 5 секунд
          setTimeout(connectWebSocket, 5000)
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
  }

  // Инициализация - получение данных
  const initialize = async () => {
    console.log('🔄 Инициализация API клиента...')
    
    // Проверяем статус API
    await checkApiStatus()
    
    if (isConnected.value) {
      // Получаем начальные данные
      await fetchVehicles()
      await fetchTelemetry()
      
      // Подключаем WebSocket для real-time обновлений
      connectWebSocket()
      
      console.log('✅ API клиент инициализирован')
    } else {
      console.error('❌ API недоступен')
    }
  }

  // Автоматическое обновление данных каждые 5 секунд
  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      if (isConnected.value) {
        await fetchTelemetry()
      }
    }, 5000)

    // Очистка при размонтировании компонента
    onUnmounted(() => {
      clearInterval(pollInterval)
      disconnectWebSocket()
    })
  }

  // Вычисляемые свойства
  const allVehicles = computed(() => Array.from(vehicles.value.values()))
  const activeVehicles = computed(() => 
    allVehicles.value.filter(v => v.status === 'active' || v.speed > 0).length
  )

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
    connectWebSocket,
    disconnectWebSocket,
    
    // Вычисляемые свойства
    allVehicles,
    activeVehicles
  }
} 