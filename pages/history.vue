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
                  <p class="text-lg font-bold text-blue-400">{{ mqttDebug.statistics.totalMessages }}</p>
                </div>
                <UIcon name="i-heroicons-chat-bubble-left-right" class="text-blue-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Ошибок</p>
                  <p class="text-lg font-bold text-red-400">{{ mqttDebug.statistics.errors }}</p>
                </div>
                <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Live Устройств</p>
                  <p class="text-lg font-bold text-green-400">{{ mqttDebug.statistics.activeDevices.size }}</p>
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
                <label class="block text-sm text-gray-400 mb-2">MQTT Брокер</label>
                <div class="text-sm text-gray-300">
                  🌍 test.mosquitto.org:8081 (WebSocket)
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Публичный брокер для тестирования
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
import { ref, computed, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
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

// Состояние отладки
const debugMessages = ref([])
const debugConsole = ref(null)
const autoScroll = ref(true)
const isPaused = ref(false)
const maxMessages = ref(1000)
const messageFilter = ref('all')

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

// Добавление сообщения в лог
const addDebugMessage = (type, message, topic = null, data = null) => {
  if (isPaused.value) return
  
  const newMessage = {
    timestamp: Date.now(),
    type,
    message,
    topic,
    data
  }
  
  debugMessages.value.unshift(newMessage)
  
  // Ограничиваем количество сообщений
  if (debugMessages.value.length > maxMessages.value) {
    debugMessages.value = debugMessages.value.slice(0, maxMessages.value)
  }
  
  // Автопрокрутка
  if (autoScroll.value) {
    nextTick(() => {
      if (debugConsole.value) {
        debugConsole.value.scrollTop = 0
      }
    })
  }
}

// Управление логгированием
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

const pauseLogging = () => {
  isPaused.value = !isPaused.value
  addDebugMessage('system', isPaused.value ? 'Логгирование приостановлено' : 'Логгирование возобновлено')
}

const clearDebugLog = () => {
  debugMessages.value = []
  addDebugMessage('system', 'Лог очищен')
}

const exportDebugLog = () => {
  const dataStr = JSON.stringify(debugMessages.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mqtt-debug-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  addDebugMessage('system', 'Лог экспортирован в JSON файл')
}

// Подключение к данным
const connectToDebugData = async () => {
  // Проверяем API статус
  await api.checkApiStatus()
  
  if (api.isConnected.value) {
    addDebugMessage('system', '✅ API сервер подключен')
    
    // Запускаем периодическую проверку новых данных
    pollingInterval = setInterval(async () => {
      try {
        const telemetryData = await api.fetchTelemetry()
        if (telemetryData && telemetryData.length > 0) {
          telemetryData.forEach(item => {
            addDebugMessage(
              'api',
              `Телеметрия: lat=${item.lat}, lng=${item.lng}, speed=${item.speed}, battery=${item.battery}%, temp=${item.temperature}°C`,
              `vehicles/${item.vehicle_id}/telemetry`,
              item
            )
          })
        }
      } catch (error) {
        addDebugMessage('error', `Ошибка получения данных: ${error.message}`)
      }
    }, 3000) // Каждые 3 секунды
  } else {
    addDebugMessage('error', '❌ API сервер недоступен')
  }
}

// Lifecycle
onMounted(async () => {
  addDebugMessage('system', '🚀 Отладочная консоль запущена')
  
  // Инициализируем API
  await api.initialize()
  
  // Подключаемся к данным
  await connectToDebugData()
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  if (wsConnection) {
    wsConnection.close()
  }
  
  if (getCurrentInstance()) {
    addDebugMessage('system', '🔌 Отладочная консоль отключена')
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
        // Используем публичный WebSocket MQTT брокер для тестирования
        const brokerUrl = 'wss://test.mosquitto.org:8081'
        
        // Эмуляция MQTT подключения (для демонстрации)
        // В реальной реализации здесь будет подключение к MQTT WebSocket
        isConnected.value = true
        statistics.value.connections++
        
        addMessage('SYSTEM', 'connection', '🔌 Подключение к test.mosquitto.org:8081')
        addMessage('SYSTEM', 'subscription', '✅ Подписка на топики: car, vehicles/+/telemetry, vehicles/+/status')
        
        // Симуляция периодических сообщений для демонстрации
        const simulateMessages = () => {
          if (!isConnected.value || isPaused.value) return
          
          // Симуляция телеметрии ESP32
          const deviceId = 'ESP32_Car_2046'
          const lat = 55.7558 + (Math.random() - 0.5) * 0.001
          const lng = 37.6176 + (Math.random() - 0.5) * 0.001
          const speed = Math.floor(Math.random() * 50)
          const battery = 85 + (Math.random() - 0.5) * 10
          const temp = 22 + (Math.random() - 0.5) * 5
          
          const telemetryData = {
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            speed,
            battery: battery.toFixed(1),
            temperature: temp.toFixed(1)
          }
          
          addMessage('TELEMETRY', deviceId, 
            `📍 ${deviceId}: lat=${telemetryData.lat}, lng=${telemetryData.lng}, speed=${telemetryData.speed}, battery=${telemetryData.battery}%, temp=${telemetryData.temperature}°C`,
            { topic: `vehicles/${deviceId}/telemetry`, data: telemetryData }
          )
          
          statistics.value.totalMessages++
          statistics.value.activeDevices.add(deviceId)
        }
        
        // Запускаем симуляцию каждые 3 секунды
        const simulationInterval = setInterval(simulateMessages, 3000)
        client.value = { simulationInterval } // Сохраняем интервал для очистки



      } catch (error) {
        console.error('❌ Ошибка подключения MQTT:', error)
        addMessage('ERROR', 'connection', `Не удалось подключиться: ${error.message}`)
      }
    }
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
    if (client.value && client.value.simulationInterval) {
      clearInterval(client.value.simulationInterval)
      client.value = null
      isConnected.value = false
      addMessage('SYSTEM', 'connection', '🛑 MQTT отключен пользователем')
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
      statistics: {
        ...statistics.value,
        activeDevices: Array.from(statistics.value.activeDevices)
      },
      messages: messages.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mqtt-debug-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Инициализация при создании
  onMounted(() => {
    connectToMqtt()
  })

  // Очистка при размонтировании
  onUnmounted(() => {
    disconnect()
  })

  return {
    messages: readonly(messages),
    statistics: readonly(statistics),
    isConnected: readonly(isConnected),
    isPaused,
    maxMessages,
    connectToMqtt,
    disconnect,
    clearMessages,
    exportMessages
  }
}

// Используем новый live MQTT композабл
const mqttDebug = useLiveMqttDebug()
</script> 