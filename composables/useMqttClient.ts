// Единый MQTT клиент для MapMon с WQTT.RU брокером
import { ref, computed, onMounted, onUnmounted } from 'vue'
import mqtt from 'mqtt'

// Интерфейсы
interface MqttMessage {
  id: string
  timestamp: Date
  topic: string
  payload: any
  device_id?: string
  type: 'telemetry' | 'status' | 'heartbeat' | 'debug' | 'error'
}

interface MqttSettings {
  host: string
  port: number
  username: string
  password: string
  clientId: string
  topics: string[]
  useWebSocket: boolean
}

interface MqttStatistics {
  totalMessages: number
  connected: boolean
  lastMessageTime: Date | null
  activeDevices: Set<string>
  errors: number
  reconnectAttempts: number
}

// Состояние MQTT клиента (singleton)
let mqttClientInstance: any = null
let isInitializing = false

export const useMqttClient = () => {
  // Возвращаем существующий экземпляр если есть
  if (mqttClientInstance) {
    return mqttClientInstance
  }

  // Реактивные переменные
  const client = ref<mqtt.MqttClient | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)
  const messages = ref<MqttMessage[]>([])
  const statistics = ref<MqttStatistics>({
    totalMessages: 0,
    connected: false,
    lastMessageTime: null,
    activeDevices: new Set(),
    errors: 0,
    reconnectAttempts: 0
  })

  // WQTT.RU настройки по умолчанию (единые для всего проекта)
  const defaultSettings = ref<MqttSettings>({
    host: 'm9.wqtt.ru',
    port: 20264,
    username: 'u_MZEPA5',
    password: 'L3YAUTS6',
    clientId: 'mapmon-web-' + Date.now(),
    topics: [
      'mapmon/vehicles/+/data/telemetry',
      'mapmon/vehicles/+/data/gps', 
      'mapmon/vehicles/+/data/sensors',
      'mapmon/vehicles/+/status/connection',
      'mapmon/vehicles/+/status/health',
      'car', // Legacy топик для обратной совместимости
      'vehicles/+/telemetry',
      'vehicles/+/status',
      'vehicles/+/heartbeat'
    ],
    useWebSocket: process.client // WebSocket только в браузере
  })

  const settings = ref<MqttSettings>({ ...defaultSettings.value })

  // Подключение к MQTT брокеру
  const connect = async (customSettings?: Partial<MqttSettings>) => {
    if (isConnecting.value || isConnected.value) {
      console.log('⚠️ MQTT уже подключается или подключен')
      return
    }

    // Предотвращаем множественную инициализацию
    if (isInitializing) {
      console.log('⚠️ MQTT клиент уже инициализируется')
      return
    }

    isInitializing = true
    isConnecting.value = true
    error.value = null

    try {
      // Объединяем настройки
      if (customSettings) {
        Object.assign(settings.value, customSettings)
      }

      console.log('🔌 Подключение к WQTT.RU MQTT:', {
        host: settings.value.host,
        port: settings.value.port,
        clientId: settings.value.clientId,
        useWebSocket: settings.value.useWebSocket
      })

      // Определяем протокол
      const protocol = settings.value.useWebSocket ? 'wss' : 'mqtt'
      const brokerUrl = `${protocol}://${settings.value.host}:${settings.value.port}`

      // Параметры подключения
      const connectOptions: mqtt.IClientOptions = {
        clientId: settings.value.clientId,
        username: settings.value.username,
        password: settings.value.password,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 15000,
        clean: true,
        protocolVersion: 4
      }

      // WebSocket специфичные опции
      if (settings.value.useWebSocket && process.client) {
        connectOptions.wsOptions = {
          headers: {
            'User-Agent': 'MapMon-WebClient/1.0'
          }
        }
      }

      // Создаем подключение
      client.value = mqtt.connect(brokerUrl, connectOptions)

      // События подключения
      client.value.on('connect', () => {
        console.log('✅ MQTT подключен к WQTT.RU')
        isConnected.value = true
        isConnecting.value = false
        statistics.value.connected = true
        error.value = null

        // Подписываемся на топики
        subscribeToTopics()
      })

      client.value.on('message', handleMessage)

      client.value.on('error', (err) => {
        console.error('❌ MQTT ошибка:', err.message)
        error.value = err.message
        statistics.value.errors++
        isConnecting.value = false
      })

      client.value.on('disconnect', () => {
        console.log('📡 MQTT отключен')
        isConnected.value = false
        statistics.value.connected = false
      })

      client.value.on('reconnect', () => {
        console.log('🔄 MQTT переподключение...')
        statistics.value.reconnectAttempts++
      })

      client.value.on('close', () => {
        console.log('🔌 MQTT соединение закрыто')
        isConnected.value = false
        statistics.value.connected = false
      })

    } catch (err: any) {
      console.error('❌ Ошибка подключения MQTT:', err.message)
      error.value = err.message
      isConnecting.value = false
    } finally {
      isInitializing = false
    }
  }

  // Подписка на топики
  const subscribeToTopics = () => {
    if (!client.value || !isConnected.value) return

    settings.value.topics.forEach(topic => {
      client.value!.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
          console.error(`❌ Ошибка подписки на ${topic}:`, err.message)
        } else {
          console.log(`📡 Подписка на топик: ${topic}`)
        }
      })
    })
  }

  // Обработка входящих сообщений
  const handleMessage = (topic: string, payload: Buffer) => {
    try {
      const messageStr = payload.toString()
      console.log(`📨 MQTT сообщение [${topic}]:`, messageStr)

      let data: any
      try {
        data = JSON.parse(messageStr)
      } catch {
        // Если не JSON, создаем объект
        data = { value: messageStr }
      }

      // Определяем device_id из топика или данных
      let deviceId = data.id || data.device_id || data.vehicle_id
      if (!deviceId && topic.includes('/')) {
        const parts = topic.split('/')
        if (parts.length >= 3 && parts[0] === 'mapmon' && parts[1] === 'vehicles') {
          deviceId = parts[2] // mapmon/vehicles/esp32_001/data/telemetry -> esp32_001
        } else if (parts.length >= 2 && parts[0] === 'vehicles') {
          deviceId = parts[1] // vehicles/esp32_001/telemetry -> esp32_001
        } else {
          deviceId = 'unknown'
        }
      }

      // Определяем тип сообщения
      let messageType: MqttMessage['type'] = 'debug'
      if (topic.includes('telemetry') || topic.includes('gps') || topic.includes('sensors')) {
        messageType = 'telemetry'
      } else if (topic.includes('status') || topic.includes('health') || topic.includes('connection')) {
        messageType = 'status'
      } else if (topic.includes('heartbeat')) {
        messageType = 'heartbeat'
      } else if (topic.includes('error') || topic.includes('alert')) {
        messageType = 'error'
      }

      // Создаем сообщение
      const message: MqttMessage = {
        id: Date.now() + Math.random().toString(),
        timestamp: new Date(),
        topic,
        payload: data,
        device_id: deviceId,
        type: messageType
      }

      // Добавляем в коллекцию (ограничиваем до 1000 сообщений)
      messages.value.unshift(message)
      if (messages.value.length > 1000) {
        messages.value = messages.value.slice(0, 1000)
      }

      // Обновляем статистику
      statistics.value.totalMessages++
      statistics.value.lastMessageTime = new Date()
      if (deviceId && deviceId !== 'unknown') {
        statistics.value.activeDevices.add(deviceId)
      }

    } catch (err: any) {
      console.error('❌ Ошибка обработки MQTT сообщения:', err.message)
      statistics.value.errors++
    }
  }

  // Публикация сообщения
  const publish = async (topic: string, payload: any, options: mqtt.IClientPublishOptions = {}) => {
    if (!client.value || !isConnected.value) {
      throw new Error('MQTT клиент не подключен')
    }

    const message = typeof payload === 'string' ? payload : JSON.stringify(payload)
    
    return new Promise<void>((resolve, reject) => {
      client.value!.publish(topic, message, options, (err) => {
        if (err) {
          console.error(`❌ Ошибка публикации в ${topic}:`, err.message)
          reject(err)
        } else {
          console.log(`📤 Опубликовано в ${topic}:`, message)
          resolve()
        }
      })
    })
  }

  // Отключение
  const disconnect = () => {
    if (client.value) {
      console.log('🔌 Отключение MQTT клиента...')
      client.value.end()
      client.value = null
      isConnected.value = false
      statistics.value.connected = false
    }
  }

  // Очистка сообщений
  const clearMessages = () => {
    messages.value = []
    statistics.value.totalMessages = 0
    statistics.value.activeDevices.clear()
  }

  // Обновление настроек
  const updateSettings = (newSettings: Partial<MqttSettings>) => {
    Object.assign(settings.value, newSettings)
    
    // Переподключаемся с новыми настройками
    if (isConnected.value) {
      disconnect()
      setTimeout(() => connect(), 1000)
    }
  }

  // Получение статистики по устройствам
  const getDeviceMessages = (deviceId: string) => {
    return messages.value.filter(msg => msg.device_id === deviceId)
  }

  // Получение последних сообщений по типу
  const getMessagesByType = (type: MqttMessage['type'], limit = 100) => {
    return messages.value
      .filter(msg => msg.type === type)
      .slice(0, limit)
  }

  // Очистка ресурсов
  const cleanup = () => {
    disconnect()
    clearMessages()
  }

  // Computed свойства
  const connectedDevices = computed(() => Array.from(statistics.value.activeDevices))
  const isHealthy = computed(() => isConnected.value && !error.value)
  const lastActivity = computed(() => statistics.value.lastMessageTime)

  // Создаем экземпляр
  mqttClientInstance = {
    // Состояние
    client,
    isConnected,
    isConnecting, 
    error,
    messages,
    statistics,
    settings,
    
    // Методы
    connect,
    disconnect,
    publish,
    clearMessages,
    updateSettings,
    getDeviceMessages,
    getMessagesByType,
    cleanup,
    
    // Computed
    connectedDevices,
    isHealthy,
    lastActivity,
    
    // Константы
    defaultSettings
  }

  return mqttClientInstance
}

// Автоочистка при размонтировании (только если есть активный компонент)
export const useMqttClientWithCleanup = () => {
  const mqtt = useMqttClient()
  
  onUnmounted(() => {
    console.log('🧹 Очистка MQTT ресурсов при размонтировании')
    mqtt.cleanup()
  })
  
  return mqtt
}