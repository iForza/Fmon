<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Основной контент -->
    <main class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок страницы -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">🕒 История и Отладка</h1>
          <p class="text-gray-400">Исторические данные и мониторинг сырых MQTT данных</p>
        </div>

        <!-- Вкладки -->
        <div class="flex border-b border-gray-700 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-blue-500 border-b-2 border-blue-500 bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            ]"
          >
            <UIcon :name="tab.icon" class="mr-2" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Вкладка: История (заглушка) -->
        <div v-if="activeTab === 'history'" class="bg-gray-800 rounded-lg p-12 text-center">
          <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-heroicons-clock" class="text-4xl text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-4">Страница в разработке</h3>
          <p class="text-gray-400 mb-6">
            Функционал истории будет доступен в следующих версиях MapMon.
            <br />
            Здесь будут отображаться исторические данные, отчеты и аналитика за прошлые периоды.
          </p>
          <div class="text-sm text-gray-500">
            Планируется в версии 0.5v
          </div>
        </div>

        <!-- Вкладка: MQTT Отладка -->
        <div v-if="activeTab === 'debug'" class="space-y-6">
          <!-- Статистика Live MQTT отладки -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Live MQTT</p>
                  <p class="text-lg font-bold" :class="mqttDebug.isConnected ? 'text-green-500' : 'text-red-500'">
                    {{ mqttDebug.isConnected ? '🟢 Online' : '🔴 Offline' }}
                  </p>
                </div>
                <UIcon name="i-heroicons-wifi" :class="mqttDebug.isConnected ? 'text-green-500' : 'text-red-500'" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Live Сообщений</p>
                  <p class="text-lg font-bold text-blue-400">{{ mqttDebug.statistics.totalMessages || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-chat-bubble-left-right" class="text-blue-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Ошибок</p>
                  <p class="text-lg font-bold text-red-400">{{ mqttDebug.statistics.errors || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Live Устройств</p>
                  <p class="text-lg font-bold text-green-400">{{ mqttDebug.statistics.activeDevices?.size || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-cpu-chip" class="text-green-400" />
              </div>
            </div>
          </div>

          <!-- Управление -->
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-white">Сырые MQTT данные</h3>
            <div class="flex space-x-3">
              <button
                @click="toggleAutoScroll"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  autoScroll ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                ]"
              >
                <UIcon name="i-heroicons-arrow-down" class="mr-2" />
                {{ autoScroll ? 'Авто-прокрутка ВКЛ' : 'Авто-прокрутка ВЫКЛ' }}
              </button>
              <button
                @click="mqttDebug.clearMessages"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <UIcon name="i-heroicons-trash" class="mr-2" />
                Очистить
              </button>
              <button
                @click="mqttDebug.exportMessages"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
                Экспорт
              </button>
              <button
                @click="mqttDebug.isPaused = !mqttDebug.isPaused"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  mqttDebug.isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                ]"
              >
                <UIcon :name="mqttDebug.isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'" class="mr-2" />
                {{ mqttDebug.isPaused ? 'Возобновить' : 'Пауза' }}
              </button>
            </div>
          </div>

          <!-- Окно отладки (консоль) -->
          <div class="bg-black rounded-lg p-4 h-96 overflow-hidden border border-gray-700">
            <div 
              ref="debugConsole"
              class="h-full overflow-y-auto font-mono text-sm space-y-1"
              :class="{ 'scroll-smooth': autoScroll }"
            >
              <div
                v-for="(message, index) in mqttDebug.messages"
                :key="`${message.id}-${index}`"
                class="flex items-start space-x-2 py-1"
                :class="getLiveMessageClass(message.type)"
              >
                <!-- Время -->
                <span class="text-gray-500 min-w-[80px] text-xs">
                  {{ formatTime(message.timestamp) }}
                </span>
                <!-- Тип -->
                <span class="min-w-[80px] text-xs font-medium">
                  {{ message.type }}
                </span>
                <!-- Источник -->
                <span class="text-blue-400 min-w-[120px] text-xs truncate">
                  {{ message.source }}
                </span>
                <!-- Сообщение -->
                <span class="flex-1 text-xs break-all">
                  {{ message.text }}
                </span>
              </div>
              
              <!-- Заглушка если нет сообщений -->
              <div v-if="mqttDebug.messages.length === 0" class="text-center text-gray-500 mt-8">
                <UIcon name="i-heroicons-signal-slash" class="text-4xl mb-4" />
                <p>Ожидание Live MQTT сообщений...</p>
                <p class="text-xs mt-2">{{ mqttDebug.isConnected ? 'Подключите ESP32 устройство' : 'Подключение к MQTT брокеру...' }}</p>
              </div>
            </div>
          </div>

          <!-- Фильтры и настройки -->
          <div class="bg-gray-800 rounded-lg p-4">
            <h4 class="text-md font-semibold text-white mb-4">Настройки отладки</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-2">Максимум сообщений</label>
                <select 
                  v-model="mqttDebug.maxMessages" 
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                  <option :value="500">500</option>
                  <option :value="1000">1000</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Live MQTT Брокер</label>
                <div class="text-sm text-gray-300">
                  🌍 test.mosquitto.org:8081/mqtt
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  WebSocket TLS | Демо режим при ошибке подключения
                </div>
                <div class="text-xs text-green-400 mt-1">
                  📡 car, vehicles/+/status, vehicles/+/heartbeat
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Подключение</label>
                <div class="flex space-x-2">
                  <button
                    @click="mqttDebug.connectToMqtt"
                    :disabled="mqttDebug.isConnected"
                    class="px-3 py-2 rounded text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {{ mqttDebug.isConnected ? 'Подключен' : 'Подключить' }}
                  </button>
                  <button
                    @click="mqttDebug.disconnect"
                    :disabled="!mqttDebug.isConnected"
                    class="px-3 py-2 rounded text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Отключить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, getCurrentInstance, watch, readonly } from 'vue'
import { useApi } from '~/composables/useApi'

// Установка темы приложения
useColorMode().value = 'dark'

// API для мониторинга данных
const api = useApi()

// Состояние вкладок
const activeTab = ref('debug') // Начинаем с отладки для удобства

const tabs = [
  { id: 'history', label: 'История', icon: 'i-heroicons-clock' },
  { id: 'debug', label: 'MQTT Отладка', icon: 'i-heroicons-bug-ant' }
]

// Состояние для MQTT отладки
const debugConsole = ref(null)
const autoScroll = ref(true)

// Стилизация live MQTT сообщений
const getLiveMessageClass = (type) => {
  switch (type) {
    case 'TELEMETRY': return 'text-green-300'
    case 'HEARTBEAT': return 'text-blue-300'
    case 'STATUS': return 'text-cyan-300'
    case 'DEBUG': return 'text-purple-300'
    case 'ERROR': return 'text-red-300'
    case 'SYSTEM': return 'text-yellow-300'
    case 'MQTT': return 'text-gray-300'
    default: return 'text-gray-300'
  }
}

// Форматирование времени
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU')
}

// Переменные для отслеживания соединений
let pollingInterval = null
let wsConnection = null

// Lifecycle
onMounted(async () => {
  // Инициализируем API для получения истории
  await api.initialize()
  
  // Запускаем опрос данных для вкладки "История"
  api.startPolling()
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  if (wsConnection) {
    wsConnection.close()
  }
})

// Новый composable для Live MQTT мониторинга
const useLiveMqttDebug = () => {
  const messages = ref([])
  const statistics = ref({
    totalMessages: 0,
    activeDevices: new Set(),
    errors: 0,
    connections: 0
  })
  const isConnected = ref(false)
  const isPaused = ref(false)
  const maxMessages = ref(100)
  const client = ref(null)

  // Подключение к MQTT брокеру для live данных
  const connectToMqtt = () => {
    if (process.client && typeof window !== 'undefined') {
      try {
        addMessage('SYSTEM', 'connection', '🔄 Подключение к test.mosquitto.org:8081...')
        
        // Проверяем наличие MQTT библиотеки
        import('mqtt').then((mqttModule) => {
          const mqtt = mqttModule.default || mqttModule
          
          if (!mqtt || !mqtt.connect) {
            throw new Error('MQTT библиотека загружена неправильно')
          }
          
          const brokerUrl = 'wss://test.mosquitto.org:8081/mqtt'
          client.value = mqtt.connect(brokerUrl, {
            clientId: 'mapmon-debug-web-' + Date.now(),
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
            keepalive: 60
          })

          client.value.on('connect', () => {
            console.log('✅ MQTT WebSocket подключен к test.mosquitto.org')
            isConnected.value = true
            statistics.value.connections++
            
            addMessage('SYSTEM', 'connection', '✅ Подключен к test.mosquitto.org:8081')
            
            // Подписываемся на те же топики что использует ESP32
            const topics = [
              'car',                                    // Основная телеметрия ESP32
              'vehicles/+/telemetry',                   // Стандартный формат
              'vehicles/+/status',                      // Статусы устройств
              'vehicles/+/heartbeat',                   // Heartbeat от ESP32
              'vehicles/ESP32_Car_2046/status',         // Конкретный статус
              'vehicles/ESP32_Car_2046/heartbeat'       // Конкретный heartbeat
            ]
            
            topics.forEach(topic => {
              client.value.subscribe(topic, (err) => {
                if (err) {
                  addMessage('ERROR', 'subscription', `❌ Ошибка подписки на ${topic}: ${err.message}`)
                  statistics.value.errors++
                } else {
                  addMessage('SYSTEM', 'subscription', `📡 Подписка на: ${topic}`)
                }
              })
            })
          })

          client.value.on('message', (topic, message) => {
            if (!isPaused.value) {
              try {
                const messageStr = message.toString()
                console.log(`📡 MQTT Live: [${topic}] ${messageStr}`)
                
                let data
                try {
                  data = JSON.parse(messageStr)
                } catch {
                  // Если не JSON, показываем как есть
                  data = { raw: messageStr }
                }
                
                // Определяем device_id из данных или топика
                let deviceId = data.id || data.device_id || data.vehicle_id || 'unknown'
                if (deviceId === 'unknown' && topic.includes('vehicles/')) {
                  const parts = topic.split('/')
                  if (parts.length >= 2) {
                    deviceId = parts[1]
                  }
                }
                
                // Обновляем статистику
                statistics.value.totalMessages++
                if (deviceId !== 'unknown') {
                  statistics.value.activeDevices.add(deviceId)
                }
                
                // Определяем тип сообщения по топику
                let messageType = 'MQTT'
                if (topic === 'car') {
                  messageType = 'TELEMETRY'
                } else if (topic.includes('status')) {
                  messageType = 'STATUS'
                } else if (topic.includes('heartbeat')) {
                  messageType = 'HEARTBEAT'
                } else if (topic.includes('telemetry')) {
                  messageType = 'TELEMETRY'
                }
                
                // Форматируем сообщение для отображения
                let displayText = ''
                
                if (messageType === 'TELEMETRY' && data.lat && data.lng) {
                  // Телеметрия с координатами
                  displayText = `📍 ${deviceId}: lat=${data.lat}, lng=${data.lng}, speed=${data.speed || 0}км/ч, battery=${data.battery || 'null'}%, temp=${data.temperature || 'null'}°C, rpm=${data.rpm || 0}`
                  if (data.messageCount) {
                    displayText += `, msg#${data.messageCount}`
                  }
                } else if (messageType === 'HEARTBEAT') {
                  // Heartbeat сообщения
                  displayText = `💓 ${deviceId}: heartbeat, uptime=${data.uptime || 0}s, rssi=${data.rssi || 'null'}dBm, heap=${data.freeHeap || 'null'}`
                } else if (messageType === 'STATUS') {
                  // Статус сообщения
                  displayText = `📊 ${deviceId}: status=${data.status}, rssi=${data.rssi || 'null'}dBm`
                } else {
                  // Любые другие данные
                  displayText = `📡 ${deviceId}: ${messageStr.substring(0, 100)}${messageStr.length > 100 ? '...' : ''}`
                }
                
                addMessage(messageType, deviceId, displayText, { topic, data })
                
              } catch (error) {
                statistics.value.errors++
                addMessage('ERROR', 'mqtt', `❌ Ошибка обработки сообщения: ${error.message}`)
                console.error('MQTT message processing error:', error)
              }
            }
          })

          client.value.on('error', (error) => {
            console.error('❌ MQTT WebSocket ошибка:', error)
            isConnected.value = false
            statistics.value.errors++
            addMessage('ERROR', 'connection', `❌ Ошибка MQTT: ${error.message}`)
          })

          client.value.on('close', () => {
            console.log('🔌 MQTT WebSocket отключен')
            isConnected.value = false
            addMessage('SYSTEM', 'connection', '🔌 WebSocket соединение закрыто')
          })

          client.value.on('reconnect', () => {
            console.log('🔄 MQTT WebSocket переподключение...')
            addMessage('SYSTEM', 'connection', '🔄 Переподключение к MQTT...')
          })

          client.value.on('offline', () => {
            console.log('📡 MQTT WebSocket offline')
            isConnected.value = false
            addMessage('SYSTEM', 'connection', '📡 MQTT соединение offline')
          })

        }).catch((error) => {
          console.error('❌ Ошибка загрузки MQTT библиотеки:', error)
          addMessage('ERROR', 'connection', `❌ Не удалось загрузить MQTT: ${error.message}`)
          addMessage('SYSTEM', 'connection', '🔄 Переключение в демо режим...')
          startDemoMode()
        })

      } catch (error) {
        console.error('❌ Ошибка подключения MQTT:', error)
        addMessage('ERROR', 'connection', `❌ Не удалось подключиться: ${error.message}`)
        addMessage('SYSTEM', 'connection', '🔄 Переключение в демо режим...')
        startDemoMode()
      }
    }
  }

  // Демо режим с симуляцией ESP32 данных
  const startDemoMode = () => {
    isConnected.value = true
    addMessage('SYSTEM', 'demo', '🎭 Демо режим активирован - симуляция ESP32 данных')
    
    // Симуляция подключения ESP32_Car_2046
    setTimeout(() => {
      addMessage('STATUS', 'ESP32_Car_2046', '📊 ESP32_Car_2046: status=active, rssi=-45dBm')
      statistics.value.activeDevices.add('ESP32_Car_2046')
    }, 1000)
    
    // Периодическая симуляция данных каждые 3-5 секунд
    const demoInterval = setInterval(() => {
      if (!isPaused.value && isConnected.value) {
        const messageTypes = ['TELEMETRY', 'HEARTBEAT']
        const type = messageTypes[Math.floor(Math.random() * messageTypes.length)]
        
        if (type === 'TELEMETRY') {
          // Симуляция телеметрии
          const lat = (55.7558 + (Math.random() - 0.5) * 0.01).toFixed(6)
          const lng = (37.6176 + (Math.random() - 0.5) * 0.01).toFixed(6)
          const speed = Math.floor(Math.random() * 60)
          const battery = (80 + Math.random() * 20).toFixed(2)
          const temp = (20 + Math.random() * 15).toFixed(1)
          const rpm = Math.floor(Math.random() * 3000)
          const msgCount = statistics.value.totalMessages + 1
          
          addMessage('TELEMETRY', 'ESP32_Car_2046', 
            `📍 ESP32_Car_2046: lat=${lat}, lng=${lng}, speed=${speed}км/ч, battery=${battery}%, temp=${temp}°C, rpm=${rpm}, msg#${msgCount}`)
        } else {
          // Симуляция heartbeat
          const uptime = Math.floor(Date.now() / 1000)
          const rssi = -40 - Math.floor(Math.random() * 20)
          const heap = 150000 + Math.floor(Math.random() * 50000)
          
          addMessage('HEARTBEAT', 'ESP32_Car_2046', 
            `💓 ESP32_Car_2046: heartbeat, uptime=${uptime}s, rssi=${rssi}dBm, heap=${heap}`)
        }
        
        statistics.value.totalMessages++
      }
    }, 3000 + Math.random() * 2000) // 3-5 секунд
    
    // Сохраняем интервал для очистки
    client.value = { demoInterval, isDemo: true }
  }

  // Добавление сообщения в лог
  const addMessage = (type, source, text, raw = null) => {
    const message = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      type,
      source,
      text,
      raw
    }
    
    messages.value.unshift(message)
    
    // Ограничиваем количество сообщений
    if (messages.value.length > maxMessages.value) {
      messages.value = messages.value.slice(0, maxMessages.value)
    }
  }

  // Отключение MQTT
  const disconnect = () => {
    if (client.value) {
      if (client.value.isDemo) {
        // Демо режим - очищаем интервал
        clearInterval(client.value.demoInterval)
        addMessage('SYSTEM', 'demo', '🛑 Демо режим отключен')
      } else {
        // Реальное MQTT соединение
        client.value.end(true)
        addMessage('SYSTEM', 'connection', '🛑 MQTT отключен пользователем')
      }
      client.value = null
      isConnected.value = false
    }
  }

  // Очистка сообщений
  const clearMessages = () => {
    messages.value = []
    statistics.value = {
      totalMessages: 0,
      activeDevices: new Set(),
      errors: 0,
      connections: statistics.value.connections
    }
  }

  // Экспорт данных
  const exportMessages = () => {
    const data = {
      timestamp: new Date().toISOString(),
      broker: 'test.mosquitto.org:8081',
      statistics: {
        ...statistics.value,
        activeDevices: Array.from(statistics.value.activeDevices)
      },
      messages: messages.value.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mqtt-live-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Инициализация при создании
  const init = () => {
    addMessage('SYSTEM', 'init', '🚀 Live MQTT отладчик запущен')
  }

  // Очистка соединения
  const cleanup = () => {
    disconnect()
  }

  return {
    messages: readonly(messages),
    statistics: readonly(statistics),
    isConnected: readonly(isConnected),
    isPaused,
    maxMessages,
    connectToMqtt,
    disconnect,
    clearMessages,
    exportMessages,
    init,
    cleanup
  }
}

// Используем новый live MQTT композабл
const mqttDebug = useLiveMqttDebug()

// Управление lifecycle для MQTT отладчика
watch(activeTab, (newTab) => {
  if (newTab === 'debug') {
    // Активируем MQTT отладчик при переключении на вкладку
    mqttDebug.init()
    nextTick(() => {
      mqttDebug.connectToMqtt()
    })
  } else {
    // Отключаем MQTT при переключении на другую вкладку
    mqttDebug.cleanup()
  }
}, { immediate: true })

// Автопрокрутка для MQTT консоли
watch(() => mqttDebug.messages, () => {
  if (autoScroll.value && activeTab.value === 'debug') {
    nextTick(() => {
      if (debugConsole.value) {
        debugConsole.value.scrollTop = 0
      }
    })
  }
}, { deep: true })
</script> 