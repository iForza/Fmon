<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Навигация -->
    <AppHeader />
    
    <!-- Уведомления о новой технике -->
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <div
        v-for="vehicleId in mqtt.newVehicleNotifications.value"
        :key="vehicleId"
        class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse"
      >
        <div class="w-2 h-2 bg-green-300 rounded-full"></div>
        <span class="font-medium">Подключена новая техника: {{ vehicleId }}</span>
      </div>
    </div>
    
    <!-- Основной контент -->
    <main class="flex h-[calc(100vh-4rem)]">
      <!-- Левая панель (30%) -->
      <div class="w-[30%] bg-gray-800 border-r border-gray-700">
        <!-- Встроенная боковая панель -->
        <div class="h-full flex flex-col">
          <!-- Заголовок панели -->
          <div class="p-4 border-b border-gray-700">
            <h2 class="text-lg font-semibold text-white">Панель управления</h2>
          </div>

          <!-- Вкладки панели -->
          <div class="flex border-b border-gray-700">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-gray-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              ]"
            >
              <span class="mr-2">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>

          <!-- Содержимое панели -->
          <div class="flex-1 overflow-y-auto">
            <!-- Вкладка техники -->
            <div v-if="activeTab === 'vehicles'" class="p-4">
              <div class="space-y-4">
                <!-- Статистика -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-gray-700 rounded-lg p-3">
                    <div class="text-sm text-gray-400">Всего техники</div>
                    <div class="text-xl font-bold text-white">{{ allVehicles.length }}</div>
                  </div>
                  <div class="bg-gray-700 rounded-lg p-3">
                    <div class="text-sm text-gray-400">Активна</div>
                    <div class="text-xl font-bold text-green-500">{{ activeVehicles }}</div>
                  </div>
                </div>

                <!-- Список техники -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Список техники</h3>
                    <div class="text-xs text-gray-500">
                      {{ mqtt.isConnected.value ? '📡 MQTT' : '🔧 Демо' }}
                    </div>
                  </div>
                  
                  <div
                    v-for="vehicle in allVehicles"
                    :key="vehicle.id"
                    :class="[
                      'bg-gray-700 rounded-lg p-3 cursor-pointer transition-colors',
                      selectedVehicleId === vehicle.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'
                    ]"
                    @click="selectVehicle(vehicle)"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-white font-medium">{{ vehicle.name }}</span>
                      <div class="flex items-center space-x-2">
                        <!-- Индикатор подключения -->
                        <div
                          :class="[
                            'w-2 h-2 rounded-full',
                            getConnectionStatus(vehicle.lastUpdate) === 'online' ? 'bg-blue-500' : 
                            getConnectionStatus(vehicle.lastUpdate) === 'offline' ? 'bg-gray-500' : 'bg-yellow-500'
                          ]"
                          :title="getConnectionStatus(vehicle.lastUpdate) === 'online' ? 'Онлайн' : 
                                  getConnectionStatus(vehicle.lastUpdate) === 'offline' ? 'Офлайн' : 'Неизвестно'"
                        />
                        <!-- Индикатор активности -->
                        <div
                          :class="[
                            'w-2 h-2 rounded-full',
                            vehicle.status === 'active' ? 'bg-green-500' : 
                            vehicle.status === 'offline' ? 'bg-gray-500' : 'bg-red-500'
                          ]"
                          :title="vehicle.status === 'active' ? 'Активна' : 
                                  vehicle.status === 'offline' ? 'Офлайн' : 'Остановлена'"
                        />
                      </div>
                    </div>
                    
                    <div class="text-sm text-gray-400">
                      Скорость: {{ vehicle.speed }} км/ч
                    </div>
                    
                    <!-- Дополнительная информация для MQTT техники -->
                    <div v-if="mqtt.isConnected.value && (vehicle.battery || vehicle.temperature || vehicle.rpm)" class="text-xs text-gray-500 mt-1 space-y-1">
                      <div v-if="vehicle.battery" class="flex items-center">
                        🔋 {{ vehicle.battery.toFixed(1) }}%
                      </div>
                      <div v-if="vehicle.temperature" class="flex items-center">
                        🌡️ {{ vehicle.temperature.toFixed(1) }}°C
                      </div>
                      <div v-if="vehicle.rpm" class="flex items-center">
                        ⚙️ {{ vehicle.rpm }} RPM
                      </div>
                    </div>
                    
                    <div class="text-xs text-gray-500 mt-1 flex items-center justify-between">
                      <span>{{ getRelativeTime(vehicle.lastUpdate) }}</span>
                      <span class="text-xs">{{ formatTime(vehicle.lastUpdate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Вкладка настроек MQTT -->
            <div v-if="activeTab === 'mqtt'" class="p-4">
              <div class="space-y-4">
                <!-- Статус подключения -->
                <div class="bg-gray-700 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-white font-medium">Статус MQTT</span>
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        mqtt.isConnected.value ? 'bg-green-500' : 
                        mqtt.isConnecting.value ? 'bg-yellow-500' : 'bg-red-500'
                      ]"
                    />
                  </div>
                  <div class="text-sm text-gray-400">
                    {{ mqtt.isConnected.value ? 'Подключен' : 
                       mqtt.isConnecting.value ? 'Подключение...' : 'Отключен' }}
                  </div>
                  <div v-if="mqtt.connectionError.value" class="text-sm text-red-400 mt-1">
                    Ошибка: {{ mqtt.connectionError.value }}
                  </div>
                </div>

                <!-- Настройки подключения -->
                <div class="space-y-3">
                  <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Настройки подключения</h3>
                  
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">URL сервера</label>
                    <input
                      v-model="mqttSettings.url"
                      placeholder="wss://test.mosquitto.org:8081"
                      class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Имя пользователя</label>
                    <input
                      v-model="mqttSettings.username"
                      placeholder="iforza"
                      class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Пароль</label>
                    <input
                      v-model="mqttSettings.password"
                      type="password"
                      placeholder="Введите пароль"
                      class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Client ID</label>
                    <input
                      v-model="mqttSettings.clientId"
                      placeholder="iforza"
                      class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Топики (через запятую)</label>
                    <input
                      v-model="mqttSettings.topics"
                      placeholder="car, vehicles/+/telemetry"
                      class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Кнопки управления -->
                  <div class="flex space-x-2 pt-2">
                    <button
                      v-if="!mqtt.isConnected.value"
                      @click="connectMqtt"
                      :disabled="mqtt.isConnecting.value"
                      class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-md transition-colors"
                    >
                      {{ mqtt.isConnecting.value ? 'Подключение...' : 'Подключиться' }}
                    </button>
                    
                    <button
                      v-else
                      @click="disconnectMqtt"
                      class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                      Отключиться
                    </button>
                    
                    <!-- Убрана кнопка тестирования -->
                  </div>
                </div>

                <!-- Лог сообщений -->
                <div class="space-y-2">
                  <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Последние сообщения</h3>
                  
                  <div class="bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div
                      v-for="(message, index) in mqtt.messages.value"
                      :key="index"
                      class="text-xs text-gray-300 mb-1 font-mono"
                    >
                      <span class="text-gray-500">{{ formatTime(message.timestamp) }}</span>
                      <span class="text-blue-400 ml-2">{{ message.topic }}</span>
                      <div class="text-gray-300 ml-4">{{ message.payload }}</div>
                    </div>
                    
                    <div v-if="mqtt.messages.value.length === 0" class="text-gray-500 text-center">
                      Нет сообщений
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Правая панель с картой (70%) -->
      <div class="flex-1 relative">
        <NuxtPage 
          :vehicles="allVehicles"
          :selectedVehicleId="selectedVehicleId"
          @vehicle-selected="selectVehicle"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Установка темы приложения
useColorMode().value = 'dark'

// Состояние панели
const activeTab = ref('vehicles')
const selectedVehicleId = ref(null)
const connecting = ref(false)
// Убрана переменная testing

// Вкладки
const tabs = [
  { id: 'vehicles', label: 'Техника', icon: '🚜' },
  { id: 'mqtt', label: 'MQTT', icon: '📡' }
]

// Убраны демо данные - используем только реальные ESP32 устройства

// MQTT интеграция
const mqtt = useMqtt()

// Настройки MQTT
const mqttSettings = ref({
  url: mqtt.defaultConfig.value.url,
  username: mqtt.defaultConfig.value.username,
  password: '',
  clientId: mqtt.defaultConfig.value.clientId,
  topics: mqtt.defaultConfig.value.topics.join(', ')
})

// Кэш для сохранения данных ESP32 при разрывах связи
const esp32DataCache = ref([])

// Используем только реальные ESP32 устройства
const allVehicles = computed(() => {
  const mqttVehicles = mqtt.vehicles.value
  
  // Проверяем есть ли реальные ESP32 устройства в MQTT
  const realDevices = mqttVehicles.filter(v => v.id && v.id.startsWith('ESP32_'))
  
  if (realDevices.length > 0) {
    // Если есть реальные ESP32 устройства, обновляем кэш и показываем их
    esp32DataCache.value = [...realDevices]
    console.log('App: Используем только реальные ESP32 данные:', realDevices)
    return realDevices
  }
  
  // Если нет данных в MQTT, но есть в кэше - используем кэш
  if (esp32DataCache.value.length > 0) {
    console.log('App: Используем кэшированные ESP32 данные:', esp32DataCache.value)
    return esp32DataCache.value
  }
  
  // Если нет реальных устройств - возвращаем пустой массив
  if (mqtt.isConnected.value) {
    console.log('App: MQTT подключен, ждем данные ESP32...')
  } else {
    console.log('App: MQTT не подключен, ждем подключения...')
  }
  return []
})

// Вычисляемые свойства
const activeVehicles = computed(() => {
  return allVehicles.value.filter(v => v.status === 'active').length
})

// Функции
const selectVehicle = (vehicle) => {
  if (typeof vehicle === 'string') {
    // Если передан ID техники
    selectedVehicleId.value = vehicle
    const vehicleObj = allVehicles.value.find(v => v.id === vehicle)
    console.log('Выбрана техника:', vehicleObj?.name || vehicle)
  } else {
    // Если передан объект техники
    selectedVehicleId.value = vehicle.id
    console.log('Выбрана техника:', vehicle.name)
  }
}

const connectMqtt = async () => {
  try {
    await mqtt.connect({
      url: mqttSettings.value.url,
      username: mqttSettings.value.username,
      password: mqttSettings.value.password,
      clientId: mqttSettings.value.clientId,
      topics: mqttSettings.value.topics.split(',').map(t => t.trim())
    })
  } catch (error) {
    console.error('Ошибка подключения MQTT:', error)
  }
}

const disconnectMqtt = () => {
  mqtt.disconnect()
}

// Убрана функция тестирования - используем только реальные ESP32 данные

// Используем новый composable для работы с временем
const { formatTime, getRelativeTime, getConnectionStatus } = useTime()

// Метаданные страницы
useHead({
  title: 'Fleet Monitor - Мониторинг техники',
  meta: [
    { name: 'description', content: 'Система мониторинга сельскохозяйственной техники с GPS трекингом' }
  ]
})
</script>

<style>
/* Глобальные стили для темной темы */
html {
  background-color: #111827;
  color: #ffffff;
}

/* Убираем стандартные отступы */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Стили для скроллбара в темной теме */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style> 