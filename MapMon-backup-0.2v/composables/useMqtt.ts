import mqtt, { type MqttClient, type IClientOptions } from 'mqtt'

interface MqttMessage {
  topic: string
  payload: string
  timestamp: Date
}

interface VehicleData {
  id: string
  lat: number
  lng: number
  speed: number
  status: string
  timestamp: Date
  lastSeen: Date
  battery?: number
  temperature?: number
  rpm?: number
}

// Интерфейс для хранения валидных данных с таймерами
interface ValidVehicleData {
  id: string
  lat: number
  lng: number
  speed: number
  status: string
  timestamp: Date
  lastSeen: Date
  // Валидные данные с таймерами
  validBattery?: number
  validTemperature?: number
  validRpm?: number
  // Таймеры для отслеживания времени последних валидных данных
  batteryTimer?: Date
  temperatureTimer?: Date
  rpmTimer?: Date
}

interface MqttConfig {
  url: string
  username: string
  password: string
  clientId: string
  topics: string[]
}

export const useMqtt = () => {
  const client = ref<MqttClient | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const messages = ref<MqttMessage[]>([])
  const vehicleData = ref<Map<string, ValidVehicleData>>(new Map())
  const connectionError = ref<string | null>(null)
  const newVehicleNotifications = ref<string[]>([])

  // Константы для фильтрации данных
  const ZERO_VALUE_TIMEOUT = 30000 // 30 секунд до принятия нулевых значений
  const MIN_VALID_TEMPERATURE = 5 // Минимальная валидная температура
  const MIN_VALID_BATTERY = 1 // Минимальный валидный заряд батареи
  const MIN_VALID_RPM = 100 // Минимальные валидные обороты

  // Конфигурация EMQX Cloud с паролем по умолчанию
  const defaultConfig: MqttConfig = {
    url: 'wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt',
    username: 'iforza',
    password: 'iforza', // Устанавливаем пароль по умолчанию
    clientId: 'iforza',
    topics: ['car', 'vehicles/+/telemetry', 'vehicles/+/status', 'vehicles/+/heartbeat']
  }

  // Таймер для проверки статуса техники (каждые 5 секунд)
  const statusCheckInterval = ref<NodeJS.Timeout | null>(null)
  const OFFLINE_TIMEOUT = 10000 // 10 секунд

  const startStatusCheck = () => {
    if (statusCheckInterval.value) {
      clearInterval(statusCheckInterval.value)
    }
    
    statusCheckInterval.value = setInterval(() => {
      const now = new Date()
      let hasChanges = false
      
      vehicleData.value.forEach((vehicle, id) => {
        const timeSinceLastSeen = now.getTime() - vehicle.lastSeen.getTime()
        const shouldBeOffline = timeSinceLastSeen > OFFLINE_TIMEOUT
        
        if (shouldBeOffline && vehicle.status !== 'offline') {
          vehicle.status = 'offline'
          vehicle.speed = 0
          hasChanges = true
          console.log(`MQTT: Техника ${id} помечена как офлайн (${Math.round(timeSinceLastSeen/1000)}с без сообщений)`)
        }
      })
      
      // Принудительно обновляем реактивность если были изменения
      if (hasChanges) {
        vehicleData.value = new Map(vehicleData.value)
      }
    }, 5000)
  }

  const stopStatusCheck = () => {
    if (statusCheckInterval.value) {
      clearInterval(statusCheckInterval.value)
      statusCheckInterval.value = null
    }
  }

  const connect = async (config: Partial<MqttConfig> = {}) => {
    if (isConnecting.value || isConnected.value) {
      console.log('MQTT: Уже подключен или подключается')
      return
    }

    const finalConfig = { ...defaultConfig, ...config }
    isConnecting.value = true
    connectionError.value = null

    try {
      console.log('MQTT: Подключение к', finalConfig.url)

      const options: IClientOptions = {
        clientId: finalConfig.clientId,
        username: finalConfig.username,
        password: finalConfig.password,
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
        keepalive: 60,
        protocolVersion: 4,
        rejectUnauthorized: false // Для WebSocket подключения
      }

      client.value = mqtt.connect(finalConfig.url, options)

      client.value.on('connect', () => {
        console.log('MQTT: Успешно подключен')
        isConnected.value = true
        isConnecting.value = false
        connectionError.value = null

        // Запускаем проверку статуса техники
        startStatusCheck()

        // Подписываемся на топики
        finalConfig.topics.forEach(topic => {
          client.value?.subscribe(topic, (err) => {
            if (err) {
              console.error(`MQTT: Ошибка подписки на топик ${topic}:`, err)
            } else {
              console.log(`MQTT: Подписан на топик: ${topic}`)
            }
          })
        })
      })

      client.value.on('message', (topic, message) => {
        const payload = message.toString()
        console.log(`MQTT: Получено сообщение из ${topic}:`, payload)

        // Добавляем сообщение в историю
        const mqttMessage: MqttMessage = {
          topic,
          payload,
          timestamp: new Date()
        }
        messages.value.unshift(mqttMessage)

        // Ограничиваем количество сообщений в истории
        if (messages.value.length > 100) {
          messages.value = messages.value.slice(0, 100)
        }

        // Обрабатываем данные техники
        processVehicleMessage(topic, payload)
      })

      client.value.on('error', (error) => {
        console.error('MQTT: Ошибка подключения:', error)
        connectionError.value = error.message
        isConnecting.value = false
        isConnected.value = false
      })

      client.value.on('close', () => {
        console.log('MQTT: Соединение закрыто')
        isConnected.value = false
        isConnecting.value = false
        // НЕ останавливаем проверку статуса - данные техники должны сохраняться
        // stopStatusCheck() 
      })

      client.value.on('offline', () => {
        console.log('MQTT: Клиент офлайн')
        isConnected.value = false
        // НЕ останавливаем проверку статуса - данные техники должны сохраняться
        // stopStatusCheck()
      })

      client.value.on('reconnect', () => {
        console.log('MQTT: Переподключение...')
        isConnecting.value = true
      })

    } catch (error) {
      console.error('MQTT: Ошибка при создании подключения:', error)
      connectionError.value = error instanceof Error ? error.message : 'Неизвестная ошибка'
      isConnecting.value = false
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (client.value) {
      console.log('MQTT: Отключение...')
      stopStatusCheck() // Останавливаем проверку статуса
      client.value.end()
      client.value = null
      isConnected.value = false
      isConnecting.value = false
    }
  }

  const publish = (topic: string, message: string) => {
    if (client.value && isConnected.value) {
      client.value.publish(topic, message, (err) => {
        if (err) {
          console.error('MQTT: Ошибка публикации:', err)
        } else {
          console.log(`MQTT: Сообщение опубликовано в ${topic}:`, message)
        }
      })
    } else {
      console.warn('MQTT: Клиент не подключен')
    }
  }

  // Функция для фильтрации и валидации данных
  const filterValidData = (existingVehicle: ValidVehicleData | undefined, newData: any): Partial<ValidVehicleData> => {
    const now = new Date()
    const result: Partial<ValidVehicleData> = {}

    // Обработка температуры
    if (newData.temperature !== undefined) {
      if (newData.temperature >= MIN_VALID_TEMPERATURE) {
        // Получили валидную температуру - обновляем
        result.validTemperature = newData.temperature
        result.temperatureTimer = now
        console.log(`MQTT: Валидная температура: ${newData.temperature}°C`)
      } else if (newData.temperature === 0 && existingVehicle?.validTemperature !== undefined) {
        // Получили 0, но у нас есть валидное значение
        const timeSinceValid = existingVehicle.temperatureTimer ? 
          now.getTime() - existingVehicle.temperatureTimer.getTime() : 0
        
        if (timeSinceValid < ZERO_VALUE_TIMEOUT) {
          // Таймер не истек - оставляем старое значение
          result.validTemperature = existingVehicle.validTemperature
          result.temperatureTimer = existingVehicle.temperatureTimer
          console.log(`MQTT: Игнорируем нулевую температуру, оставляем ${existingVehicle.validTemperature}°C (${Math.round(timeSinceValid/1000)}с)`)
        } else {
          // Таймер истек - принимаем нулевое значение
          result.validTemperature = 0
          result.temperatureTimer = now
          console.log(`MQTT: Принимаем нулевую температуру после таймаута (${Math.round(timeSinceValid/1000)}с)`)
        }
      } else {
        // Первое значение или нет предыдущего валидного
        result.validTemperature = newData.temperature
        result.temperatureTimer = now
      }
    } else if (existingVehicle?.validTemperature !== undefined) {
      // Данные не пришли - сохраняем старые
      result.validTemperature = existingVehicle.validTemperature
      result.temperatureTimer = existingVehicle.temperatureTimer
    }

    // Обработка батареи
    if (newData.battery !== undefined) {
      if (newData.battery >= MIN_VALID_BATTERY) {
        result.validBattery = newData.battery
        result.batteryTimer = now
        console.log(`MQTT: Валидная батарея: ${newData.battery}%`)
      } else if (newData.battery === 0 && existingVehicle?.validBattery !== undefined) {
        const timeSinceValid = existingVehicle.batteryTimer ? 
          now.getTime() - existingVehicle.batteryTimer.getTime() : 0
        
        if (timeSinceValid < ZERO_VALUE_TIMEOUT) {
          result.validBattery = existingVehicle.validBattery
          result.batteryTimer = existingVehicle.batteryTimer
          console.log(`MQTT: Игнорируем нулевую батарею, оставляем ${existingVehicle.validBattery}% (${Math.round(timeSinceValid/1000)}с)`)
        } else {
          result.validBattery = 0
          result.batteryTimer = now
          console.log(`MQTT: Принимаем нулевую батарею после таймаута (${Math.round(timeSinceValid/1000)}с)`)
        }
      } else {
        result.validBattery = newData.battery
        result.batteryTimer = now
      }
    } else if (existingVehicle?.validBattery !== undefined) {
      result.validBattery = existingVehicle.validBattery
      result.batteryTimer = existingVehicle.batteryTimer
    }

    // Обработка RPM
    if (newData.rpm !== undefined) {
      if (newData.rpm >= MIN_VALID_RPM) {
        result.validRpm = newData.rpm
        result.rpmTimer = now
        console.log(`MQTT: Валидные обороты: ${newData.rpm} RPM`)
      } else if (newData.rpm === 0 && existingVehicle?.validRpm !== undefined) {
        const timeSinceValid = existingVehicle.rpmTimer ? 
          now.getTime() - existingVehicle.rpmTimer.getTime() : 0
        
        if (timeSinceValid < ZERO_VALUE_TIMEOUT) {
          result.validRpm = existingVehicle.validRpm
          result.rpmTimer = existingVehicle.rpmTimer
          console.log(`MQTT: Игнорируем нулевые обороты, оставляем ${existingVehicle.validRpm} RPM (${Math.round(timeSinceValid/1000)}с)`)
        } else {
          result.validRpm = 0
          result.rpmTimer = now
          console.log(`MQTT: Принимаем нулевые обороты после таймаута (${Math.round(timeSinceValid/1000)}с)`)
        }
      } else {
        result.validRpm = newData.rpm
        result.rpmTimer = now
      }
    } else if (existingVehicle?.validRpm !== undefined) {
      result.validRpm = existingVehicle.validRpm
      result.rpmTimer = existingVehicle.rpmTimer
    }

    return result
  }

  const processVehicleMessage = (topic: string, payload: string) => {
    try {
      // Обрабатываем разные форматы топиков
      if (topic === 'car' || topic.startsWith('vehicles/')) {
        const data = JSON.parse(payload)
        
        // Извлекаем ID техники из топика или данных
        let vehicleId = 'unknown'
        if (topic.startsWith('vehicles/')) {
          const parts = topic.split('/')
          if (parts.length >= 2) {
            vehicleId = parts[1]
          }
        } else if (data.id) {
          vehicleId = data.id
        } else if (data.device_id) {
          vehicleId = data.device_id
        }

        const now = new Date()

        // Обрабатываем heartbeat сообщения отдельно
        if (topic.includes('/heartbeat') || data.type === 'heartbeat') {
          // Для heartbeat только обновляем время последнего сообщения
          const existingVehicle = vehicleData.value.get(vehicleId)
          if (existingVehicle) {
            existingVehicle.lastSeen = now
            console.log(`MQTT: Heartbeat от ${vehicleId}`)
          }
          return
        }

        // Получаем существующие данные техники
        const existingVehicle = vehicleData.value.get(vehicleId)
        
        // Применяем фильтрацию данных
        const filteredData = filterValidData(existingVehicle, data)

        // Создаем объект данных техники с отфильтрованными значениями
        const vehicleInfo: ValidVehicleData = {
          id: vehicleId,
          lat: data.lat || data.latitude || 0,
          lng: data.lng || data.longitude || 0,
          speed: data.speed || 0,
          status: data.status || (data.speed > 0 ? 'active' : 'stopped'),
          timestamp: now,
          lastSeen: now,
          // Используем отфильтрованные данные
          validBattery: filteredData.validBattery,
          validTemperature: filteredData.validTemperature,
          validRpm: filteredData.validRpm,
          batteryTimer: filteredData.batteryTimer,
          temperatureTimer: filteredData.temperatureTimer,
          rpmTimer: filteredData.rpmTimer
        }

        // Проверяем, новая ли это техника
        const isNewVehicle = !vehicleData.value.has(vehicleId)
        
        // Обновляем данные техники
        vehicleData.value.set(vehicleId, vehicleInfo)
        console.log(`MQTT: Обновлены данные техники ${vehicleId}:`, {
          id: vehicleInfo.id,
          speed: vehicleInfo.speed,
          battery: vehicleInfo.validBattery,
          temperature: vehicleInfo.validTemperature,
          rpm: vehicleInfo.validRpm
        })
        
        // Уведомляем о новой технике
        if (isNewVehicle) {
          newVehicleNotifications.value.push(vehicleId)
          console.log(`MQTT: Подключена новая техника: ${vehicleId}`)
          
          // Убираем уведомление через 5 секунд
          setTimeout(() => {
            const index = newVehicleNotifications.value.indexOf(vehicleId)
            if (index > -1) {
              newVehicleNotifications.value.splice(index, 1)
            }
          }, 5000)
        }
      }
    } catch (error) {
      console.error('MQTT: Ошибка обработки сообщения:', error, 'Payload:', payload)
    }
  }

  // Получение списка техники из MQTT данных
  const getVehicles = computed(() => {
    return Array.from(vehicleData.value.values()).map(vehicle => {
      // Определяем название техники на основе ID
      let name = vehicle.id
      if (vehicle.id.includes('ESP32_Car')) {
        name = `ESP32 Автомобиль ${vehicle.id.split('_').pop()}`
      } else if (vehicle.id.includes('tractor')) {
        name = `Трактор ${vehicle.id.split('_').pop()}`
      } else if (vehicle.id.includes('combine')) {
        name = `Комбайн ${vehicle.id.split('_').pop()}`
      } else if (vehicle.id === 'test_vehicle') {
        name = 'Тестовая техника'
      }
      
      return {
        id: vehicle.id,
        name: name,
        lat: vehicle.lat,
        lng: vehicle.lng,
        speed: vehicle.speed,
        status: vehicle.status,
        lastUpdate: vehicle.timestamp,
        battery: vehicle.validBattery,
        temperature: vehicle.validTemperature,
        rpm: vehicle.validRpm
      }
    })
  })

  // Очистка при размонтировании компонента
  onUnmounted(() => {
    stopStatusCheck()
    disconnect()
  })

  return {
    // Состояние
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    connectionError: readonly(connectionError),
    messages: readonly(messages),
    vehicles: getVehicles,
    newVehicleNotifications: readonly(newVehicleNotifications),
    
    // Методы
    connect,
    disconnect,
    publish,
    
    // Конфигурация
    defaultConfig: readonly(ref(defaultConfig))
  }
} 