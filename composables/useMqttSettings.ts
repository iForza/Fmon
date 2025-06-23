import { ref } from 'vue'

interface MqttSettings {
  url: string
  port: string
  username: string
  password: string
  clientId: string
  topics: string[]
}

interface ApiResponse {
  success: boolean
  error?: string
  connected?: boolean
  lastMessage?: string
  activeDevices?: number
}

export const useMqttSettings = () => {
  // Состояние подключения
  const connectionStatus = ref<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected')
  const lastMessageTime = ref<string | null>(null)
  const activeDevices = ref(0)
  const isInitialized = ref(false)

  // Настройки по умолчанию (совместимые с ESP32)
  const defaultSettings: MqttSettings = {
    url: 'wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt', // WebSocket для браузера
    port: '8084', // WebSocket port для браузера  
    username: 'iforza', // Те же учетные данные что у ESP32
    password: 'iforza',
    clientId: 'mapmon-web-' + Date.now(),
    topics: [
      'car', // Основной топик для совместимости
      'vehicles/+/telemetry', // Стандартный формат
      'vehicles/+/status',
      'esp32/+/telemetry', // Дополнительные форматы ESP32
      'fleet/+/data' // Альтернативный формат
    ]
  }

  // Ключ для localStorage
  const STORAGE_KEY = 'mapmon_mqtt_settings'

  // Загрузка настроек из localStorage
  const loadSettings = (): MqttSettings | null => {
    if (!process.client) return null
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...defaultSettings, ...parsed }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек MQTT:', error)
    }
    
    return null
  }

  // Сохранение настроек в localStorage
  const saveSettings = async (settings: MqttSettings): Promise<void> => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      
      // Отправляем настройки на сервер для применения
      await $fetch<ApiResponse>('/api/mqtt/config', {
        method: 'POST',
        body: settings
      })

      console.log('✅ Настройки MQTT сохранены')
    } catch (error) {
      console.error('❌ Ошибка сохранения настроек MQTT:', error)
      throw error
    }
  }

  // Тестирование подключения
  const testConnection = async (settings: MqttSettings): Promise<{ success: boolean; message: string }> => {
    try {
      connectionStatus.value = 'connecting'
      
      // Отправляем запрос на тестирование подключения
      const response = await $fetch<ApiResponse>('/api/mqtt/test', {
        method: 'POST',
        body: settings
      })

      if (response.success) {
        connectionStatus.value = 'connected'
        return {
          success: true,
          message: 'Подключение к MQTT брокеру успешно установлено'
        }
      } else {
        connectionStatus.value = 'error'
        return {
          success: false,
          message: response.error || 'Неизвестная ошибка подключения'
        }
      }
    } catch (error: any) {
      connectionStatus.value = 'error'
      return {
        success: false,
        message: error.message || 'Ошибка сети при тестировании подключения'
      }
    }
  }

  // Получение текущего статуса MQTT
  const getStatus = async () => {
    try {
      const response = await $fetch<ApiResponse>('/api/mqtt/status')
      
      if (response.success) {
        connectionStatus.value = response.connected ? 'connected' : 'disconnected'
        lastMessageTime.value = response.lastMessage || null
        activeDevices.value = response.activeDevices || 0
      }
      
      return response
    } catch (error) {
      console.error('Ошибка получения статуса MQTT:', error)
      connectionStatus.value = 'error'
    }
  }

  // Перезапуск MQTT соединения
  const restartConnection = async (): Promise<boolean> => {
    try {
      const response = await $fetch<ApiResponse>('/api/mqtt/restart', {
        method: 'POST'
      })
      
      if (response.success) {
        connectionStatus.value = 'connecting'
        
        // Ждем несколько секунд и проверяем статус
        setTimeout(async () => {
          await getStatus()
        }, 3000)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Ошибка перезапуска MQTT:', error)
      return false
    }
  }

  // Инициализация
  const initialize = async () => {
    if (isInitialized.value) return
    
    // Загружаем сохраненные настройки
    const saved = loadSettings()
    if (saved) {
      console.log('📋 Загружены настройки MQTT из localStorage')
    }
    
    // Получаем текущий статус
    await getStatus()
    
    // Запускаем периодическое обновление статуса
    if (process.client) {
      setInterval(getStatus, 10000) // Каждые 10 секунд
    }
    
    isInitialized.value = true
  }

  // Получение настроек (сохраненные или по умолчанию)
  const getCurrentSettings = (): MqttSettings => {
    return loadSettings() || defaultSettings
  }

  return {
    // Состояние
    connectionStatus: readonly(connectionStatus),
    lastMessageTime: readonly(lastMessageTime),
    activeDevices: readonly(activeDevices),
    isInitialized: readonly(isInitialized),
    
    // Методы
    loadSettings,
    saveSettings,
    testConnection,
    getStatus,
    restartConnection,
    initialize,
    getCurrentSettings,
    
    // Константы
    defaultSettings: readonly(defaultSettings)
  }
} 