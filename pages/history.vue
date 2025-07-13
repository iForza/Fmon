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
                  <p class="text-sm text-gray-400">WQTT.RU MQTT</p>
                  <p class="text-lg font-bold" :class="unifiedMqtt.isConnected.value ? 'text-green-500' : 'text-red-500'">
                    {{ unifiedMqtt.isConnected.value ? '🟢 Online' : (unifiedMqtt.isConnecting.value ? '🟡 Connecting' : '🔴 Offline') }}
                  </p>
                </div>
                <UIcon name="i-heroicons-wifi" :class="unifiedMqtt.isConnected.value ? 'text-green-500' : 'text-red-500'" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Live Сообщений</p>
                  <p class="text-lg font-bold text-blue-400">{{ unifiedMqtt.statistics.value.totalMessages || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-chat-bubble-left-right" class="text-blue-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">Ошибок</p>
                  <p class="text-lg font-bold text-red-400">{{ unifiedMqtt.statistics.value.errors || 0 }}</p>
                </div>
                <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400" />
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-400">ESP32 Устройств</p>
                  <p class="text-lg font-bold text-green-400">{{ unifiedMqtt.connectedDevices.value.length || 0 }}</p>
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
              <!-- Объединенные сообщения: MQTT + SQLite + API -->
              <div
                v-for="(message, index) in combinedMessages"
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
                  {{ message.source || message.device_id || message.topic }}
                </span>
                <!-- Сообщение -->
                <span class="flex-1 text-xs break-all">
                  {{ formatMessage(message) }}
                </span>
              </div>
              
              <!-- Заглушка если нет сообщений -->
              <div v-if="combinedMessages.length === 0" class="text-center text-gray-500 mt-8">
                <UIcon name="i-heroicons-signal-slash" class="text-4xl mb-4" />
                <p>Ожидание сообщений от WQTT.RU и SQLite...</p>
                <p class="text-xs mt-2">{{ unifiedMqtt.isConnected.value ? 'ESP32 → WQTT.RU → SQLite' : 'Подключение к WQTT.RU...' }}</p>
              </div>
            </div>
          </div>

          <!-- SQLite База данных информация -->
          <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 class="text-md font-semibold text-white mb-4">📊 SQLite База данных</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Статистика базы данных -->
              <div class="bg-gray-700 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <h5 class="text-sm font-medium text-gray-300">Статистика БД</h5>
                  <UIcon name="i-heroicons-circle-stack" class="text-blue-400" />
                </div>
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Последних записей:</span>
                    <span class="text-white font-mono">{{ sqliteDebugInfo.totalRecords }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Последнее обновление:</span>
                    <span class="text-white font-mono">{{ formatTime(sqliteDebugInfo.lastUpdate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Активных устройств:</span>
                    <span class="text-green-400 font-mono">{{ sqliteDebugInfo.activeDevices }}</span>
                  </div>
                </div>
              </div>

              <!-- Последние временные метки -->
              <div class="bg-gray-700 rounded-lg p-3">
                <div class="flex items-center justify-between mb-3">
                  <h5 class="text-sm font-medium text-gray-300">Временные метки</h5>
                  <UIcon name="i-heroicons-clock" class="text-yellow-400" />
                </div>
                <div class="space-y-1">
                  <div v-if="sqliteDebugInfo.recentTimestamps.length === 0" class="text-xs text-gray-500 text-center py-2">
                    Нет данных
                  </div>
                  <div v-for="(ts, index) in sqliteDebugInfo.recentTimestamps.slice(0, 4)" :key="index" 
                       class="flex justify-between text-xs">
                    <span class="text-gray-400">{{ ts.device }}:</span>
                    <span class="text-blue-300 font-mono">{{ formatTime(ts.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Последние записи SQLite -->
            <div class="mt-4 bg-gray-700 rounded-lg p-3">
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-sm font-medium text-gray-300">🗂️ Последние записи из SQLite</h5>
                <button @click="refreshSqliteData" 
                        class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                  <UIcon name="i-heroicons-arrow-path" class="mr-1" />
                  Обновить
                </button>
              </div>
              <div class="max-h-32 overflow-y-auto space-y-1">
                <div v-if="sqliteDebugInfo.recentRecords.length === 0" 
                     class="text-xs text-gray-500 text-center py-4">
                  📭 Записи не найдены в SQLite
                </div>
                <div v-for="(record, index) in sqliteDebugInfo.recentRecords" :key="index"
                     class="flex items-center space-x-2 text-xs bg-gray-600 rounded p-2">
                  <span class="text-yellow-400 min-w-[60px] font-mono">{{ formatTime(record.timestamp) }}</span>
                  <span class="text-blue-400 min-w-[80px]">{{ record.vehicle_id }}</span>
                  <span class="text-green-400 flex-1">
                    📍 lat: {{ record.lat?.toFixed(4) || 'N/A' }}, lng: {{ record.lng?.toFixed(4) || 'N/A' }}
                  </span>
                  <span class="text-cyan-400">🚗 {{ record.speed || 0 }}км/ч</span>
                </div>
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
                  🌍 m9.wqtt.ru:20264 (WQTT.RU)
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  TCP/WebSocket | Единый MQTT брокер для всего проекта
                </div>
                <div class="text-xs text-green-400 mt-1">
                  📡 mapmon/vehicles/+/data/*, car, vehicles/+/*
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">Управление MQTT</label>
                <div class="flex space-x-2">
                  <button
                    @click="connectUnifiedMqtt"
                    :disabled="unifiedMqtt.isConnected.value || unifiedMqtt.isConnecting.value"
                    class="px-3 py-2 rounded text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {{ unifiedMqtt.isConnected.value ? 'WQTT Подключен' : (unifiedMqtt.isConnecting.value ? 'Подключение...' : 'Подключить WQTT') }}
                  </button>
                  <button
                    @click="disconnectUnifiedMqtt"
                    :disabled="!unifiedMqtt.isConnected.value"
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
import { useMqttClient } from '~/composables/useMqttClient'

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
    case 'SQLITE': return 'text-orange-300'
    default: return 'text-gray-300'
  }
}

// Форматирование времени
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU')
}

// Функция форматирования сообщений для консоли
const formatMessage = (message) => {
  if (message.type === 'MQTT') {
    // Форматирование MQTT сообщений из единого клиента
    const payload = message.payload || message.raw
    if (typeof payload === 'object' && payload !== null) {
      if (payload.lat && payload.lng) {
        return `📍 GPS: ${payload.lat}, ${payload.lng} | Скорость: ${payload.speed || 0}км/ч`
      }
      return `📡 ${JSON.stringify(payload).substring(0, 100)}`
    }
    return `📡 ${payload || message.text || 'данные получены'}`
  }
  
  if (message.type === 'SQLITE') {
    return message.text || `📊 Запись БД: ${message.source}`
  }
  
  if (message.type === 'SYSTEM') {
    return `🔧 ${message.text || message.source}`
  }
  
  if (message.type === 'ERROR') {
    return `❌ ${message.text || message.source}`
  }
  
  // Для остальных типов
  return message.text || message.source || 'неизвестное сообщение'
}

// Объединяем сообщения из всех источников
const combinedMessages = computed(() => {
  const allMessages = []
  
  // Добавляем сообщения из единого MQTT клиента
  const mqttMessages = unifiedMqtt.messages.value.map(msg => ({
    id: msg.id,
    timestamp: msg.timestamp,
    type: 'MQTT',
    source: msg.device_id || msg.topic,
    topic: msg.topic,
    payload: msg.payload,
    device_id: msg.device_id
  }))
  
  // Добавляем сообщения из API отладчика
  const apiMessages = mqttDebug.messages.value.map(msg => ({
    id: msg.id,
    timestamp: msg.timestamp,
    type: msg.type,
    source: msg.source,
    text: msg.text,
    raw: msg.raw
  }))
  
  allMessages.push(...mqttMessages, ...apiMessages)
  
  // Сортируем по времени (новые сверху)
  return allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Переменная для хранения функции очистки API
let apiCleanup = null

// Lifecycle
onMounted(async () => {
  // Инициализируем API для получения истории
  await api.initialize()
  
  // Запускаем опрос данных для вкладки "История" и сохраняем функцию очистки
  apiCleanup = api.startPolling()
  
  // Автоматически подключаем единый MQTT клиент
  if (!unifiedMqtt.isConnected.value && !unifiedMqtt.isConnecting.value) {
    console.log('🔄 Автоподключение к WQTT.RU MQTT...')
    await unifiedMqtt.connect()
  }
})

onUnmounted(() => {
  console.log('🧹 Очистка ресурсов history.vue')
  
  // Останавливаем API polling
  if (apiCleanup) {
    apiCleanup()
  }
  
  // Останавливаем SQLite обновления
  stopSqliteUpdates()
  
  // Дополнительно вызываем общую очистку
  api.cleanup()
  
  // НЕ отключаем единый MQTT клиент, так как он может использоваться другими компонентами
  console.log('🔄 Единый MQTT клиент остается активным для других компонентов')
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
    addMessage,
    init,
    cleanup
  }
}

// Используем единый MQTT клиент для всего проекта
const unifiedMqtt = useMqttClient()

// Используем композабл для ESP32 MQTT отладчика (интегрируем с единым клиентом)
const mqttDebug = useLiveMqttDebug()

// Реактивные данные для отображения SQLite информации
const sqliteDebugInfo = ref({
  totalRecords: 0,
  lastUpdate: new Date(),
  activeDevices: 0,
  recentTimestamps: [],
  recentRecords: []
})

// Функция для получения данных из SQLite через API
const fetchSqliteDebugData = async () => {
  try {
    // Получаем последние записи телеметрии
    const telemetryResponse = await $fetch('/api/telemetry/latest?limit=20')
    const telemetryData = telemetryResponse.data || []
    
    if (Array.isArray(telemetryData) && telemetryData.length > 0) {
      // Обновляем статистику
      sqliteDebugInfo.value.totalRecords = telemetryData.length
      sqliteDebugInfo.value.lastUpdate = new Date()
      
      // Подсчитываем уникальные устройства
      const uniqueDevices = new Set(telemetryData.map(item => item.vehicle_id))
      sqliteDebugInfo.value.activeDevices = uniqueDevices.size
      
      // Извлекаем временные метки для каждого устройства
      const timestampsByDevice = {}
      telemetryData.forEach(item => {
        if (item.vehicle_id && item.timestamp) {
          if (!timestampsByDevice[item.vehicle_id] || 
              new Date(item.timestamp) > new Date(timestampsByDevice[item.vehicle_id])) {
            timestampsByDevice[item.vehicle_id] = item.timestamp
          }
        }
      })
      
      // Преобразуем в массив временных меток для отображения
      sqliteDebugInfo.value.recentTimestamps = Object.entries(timestampsByDevice)
        .map(([device, timestamp]) => ({ device, timestamp: new Date(timestamp) }))
        .sort((a, b) => b.timestamp - a.timestamp)
      
      // Сохраняем записи для детального отображения (последние 10)
      sqliteDebugInfo.value.recentRecords = telemetryData
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      
      // Добавляем сообщение в MQTT лог о полученных данных
      mqttDebug.addMessage('SQLITE', 'database', 
        `📊 Получено ${telemetryData.length} записей из SQLite, устройств: ${uniqueDevices.size}`)
      
    } else {
      sqliteDebugInfo.value.recentRecords = []
      sqliteDebugInfo.value.recentTimestamps = []
      mqttDebug.addMessage('SQLITE', 'database', '📭 SQLite база данных пуста')
    }
    
  } catch (error) {
    console.error('Ошибка получения SQLite данных:', error)
    mqttDebug.addMessage('ERROR', 'sqlite', `❌ Ошибка чтения SQLite: ${error.message}`)
  }
}

// Функция для ручного обновления SQLite данных
const refreshSqliteData = async () => {
  mqttDebug.addMessage('SYSTEM', 'sqlite', '🔄 Обновление данных SQLite...')
  await fetchSqliteDebugData()
}

// Автоматическое обновление SQLite данных каждые 30 секунд при активной отладке
let sqliteUpdateInterval = null

const startSqliteUpdates = () => {
  if (sqliteUpdateInterval) return
  
  sqliteUpdateInterval = setInterval(async () => {
    if (activeTab.value === 'debug' && mqttDebug.isConnected.value) {
      await fetchSqliteDebugData()
    }
  }, 30000) // Каждые 30 секунд
}

const stopSqliteUpdates = () => {
  if (sqliteUpdateInterval) {
    clearInterval(sqliteUpdateInterval)
    sqliteUpdateInterval = null
  }
}

// Управление lifecycle для MQTT отладчика
watch(activeTab, (newTab) => {
  if (newTab === 'debug') {
    // Активируем MQTT отладчик при переключении на вкладку
    mqttDebug.init()
    nextTick(async () => {
      await mqttDebug.connectToApi()
      // Также загружаем SQLite данные при активации отладки
      await fetchSqliteDebugData()
      // Запускаем автоматическое обновление SQLite
      startSqliteUpdates()
      
      // Убеждаемся что единый MQTT клиент подключен
      if (!unifiedMqtt.isConnected.value && !unifiedMqtt.isConnecting.value) {
        console.log('🔄 Подключение единого MQTT клиента на вкладке отладки...')
        await unifiedMqtt.connect()
      }
    })
  } else {
    // Отключаем MQTT отладчик при переключении на другую вкладку
    mqttDebug.cleanup()
    stopSqliteUpdates()
  }
}, { immediate: true })

// Автопрокрутка для MQTT консоли (следим за объединенными сообщениями)
watch(() => combinedMessages.value, () => {
  if (autoScroll.value && activeTab.value === 'debug') {
    nextTick(() => {
      if (debugConsole.value) {
        debugConsole.value.scrollTop = 0
      }
    })
  }
}, { deep: true })

// Дополнительное отслеживание сообщений MQTT клиента
watch(() => unifiedMqtt.messages.value, (newMessages) => {
  if (newMessages.length > 0 && activeTab.value === 'debug') {
    const latestMessage = newMessages[0]
    // Добавляем сообщение в API отладчик для единообразного логирования
    mqttDebug.addMessage('MQTT', latestMessage.device_id || latestMessage.topic, 
      `📡 WQTT.RU: ${latestMessage.topic} | ${JSON.stringify(latestMessage.payload).substring(0, 50)}...`)
  }
}, { deep: true })

// Функции управления единым MQTT клиентом
const connectUnifiedMqtt = async () => {
  if (!unifiedMqtt.isConnected.value && !unifiedMqtt.isConnecting.value) {
    mqttDebug.addMessage('SYSTEM', 'mqtt', '🔄 Ручное подключение к WQTT.RU...')
    await unifiedMqtt.connect()
  }
}

const disconnectUnifiedMqtt = () => {
  if (unifiedMqtt.isConnected.value) {
    mqttDebug.addMessage('SYSTEM', 'mqtt', '🛑 Отключение от WQTT.RU по требованию пользователя')
    unifiedMqtt.disconnect()
  }
}
</script> 