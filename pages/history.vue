<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Основной контент -->
    <main class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок страницы -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">🕒 История и Отладка</h1>
          <p class="text-gray-400">Исторические данные и мониторинг сырых MQTT данных от ESP32</p>
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
                  <p class="text-sm text-gray-400">ESP32 Устройств</p>
                  <p class="text-lg font-bold text-green-400">{{ mqttDebug.statistics.activeDevices?.size || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-cpu-chip" class="text-green-400" />
              </div>
            </div>
          </div>

          <!-- Управление -->
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-white">Сырые MQTT данные от ESP32</h3>
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
                <p>Ожидание реальных MQTT сообщений от ESP32...</p>
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
                  WebSocket для браузера | Только реальные данные ESP32
                </div>
                <div class="text-xs text-green-400 mt-1">
                  📡 car, vehicles/+/status, vehicles/+/heartbeat
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Подключение</label>
                <div class="flex space-x-2">
                  <button
                    @click="mqttDebug.connectToApi"
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

// Функция переключения автопрокрутки
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

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

// Переменная для хранения функции очистки API
let apiCleanup = null

// Lifecycle
onMounted(async () => {
  // Инициализируем API для получения истории
  await api.initialize()
  
  // Запускаем опрос данных для вкладки "История" и сохраняем функцию очистки
  apiCleanup = api.startPolling()
})

onUnmounted(() => {
  console.log('🧹 Очистка ресурсов history.vue')
  
  // Останавливаем API polling
  if (apiCleanup) {
    apiCleanup()
  }
  
  // Дополнительно вызываем общую очистку
  api.cleanup()
})

// Composable для Live MQTT мониторинга ESP32
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
  const pollingInterval = ref(null)

  // Подключение к API серверу для получения данных от MQTT коллектора
  const connectToApi = async () => {
    if (process.client && typeof window !== 'undefined') {
      try {
        addMessage('SYSTEM', 'connection', '🔄 Подключение к API серверу...')
        
        // Проверяем доступность API
        const response = await $fetch('/api/status')
        if (response.status === 'API Server running with SQLite') {
          isConnected.value = true
          statistics.value.connections++
          addMessage('SYSTEM', 'connection', '✅ Подключен к API серверу')
          
          // Запускаем polling для получения новых данных
          startApiPolling()
        } else {
          throw new Error('API сервер недоступен')
        }
      } catch (error) {
          console.error('❌ Ошибка подключения к API:', error)
          isConnected.value = false
          statistics.value.errors++
          addMessage('ERROR', 'connection', `❌ Не удалось подключиться к API: ${error.message}`)
        }
      }
  }

  // Polling для получения новых данных из SQLite через API
  const startApiPolling = () => {
    const pollInterval = setInterval(async () => {
      if (!isPaused.value && isConnected.value) {
        try {
          // Получаем последние данные телеметрии
          const response = await $fetch('/api/telemetry/latest?limit=10')
          const telemetryData = response.data || []
          
          telemetryData.forEach(item => {
            if (item && item.vehicle_id) {
              const deviceId = item.vehicle_id
              
              // Обновляем статистику
              statistics.value.totalMessages++
              statistics.value.activeDevices.add(deviceId)
              
              // Определяем тип сообщения
              let messageType = 'TELEMETRY'
              let displayText = ''
              
              if (item.lat && item.lng) {
                // Телеметрия с координатами
                displayText = `📍 ${deviceId}: lat=${item.lat}, lng=${item.lng}`
                if (item.speed !== undefined) displayText += `, speed=${item.speed}км/ч`
                if (item.battery !== undefined) displayText += `, battery=${item.battery}%`
                if (item.temperature !== undefined) displayText += `, temp=${item.temperature}°C`
                if (item.rpm !== undefined) displayText += `, rpm=${item.rpm}`
              } else {
                displayText = `📡 ${deviceId}: данные обновлены`
              }
              
              addMessage(messageType, deviceId, displayText, { 
                topic: 'api/telemetry', 
                data: item 
              })
            }
          })
          
        } catch (error) {
          console.error('API polling error:', error)
          statistics.value.errors++
          addMessage('ERROR', 'api', `❌ Ошибка получения данных: ${error.message}`)
        }
      }
    }, 3000) // Опрос каждые 3 секунды
    
    // Сохраняем интервал для остановки
    pollingInterval.value = pollInterval
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

  // Отключение от API
  const disconnect = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      addMessage('SYSTEM', 'connection', '🛑 API polling остановлен пользователем')
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
      source: 'API Server SQLite',
      description: 'ESP32 Telemetry Data Log - MapMon v0.5',
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
    a.download = `esp32-mqtt-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Инициализация отладчика
  const init = () => {
    addMessage('SYSTEM', 'init', '🚀 ESP32 Telemetry Monitor запущен')
    addMessage('SYSTEM', 'init', 'ℹ️ Данные от ESP32 через MQTT коллектор и SQLite')
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
    connectToApi,
    disconnect,
    clearMessages,
    exportMessages,
    init,
    cleanup
  }
}

// Используем композабл для ESP32 MQTT отладчика
const mqttDebug = useLiveMqttDebug()

// Управление lifecycle для MQTT отладчика
watch(activeTab, (newTab) => {
  if (newTab === 'debug') {
    // Активируем MQTT отладчик при переключении на вкладку
    mqttDebug.init()
    nextTick(() => {
      mqttDebug.connectToApi()
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