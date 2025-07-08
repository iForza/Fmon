<template>
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
        <UIcon :name="tab.icon" class="mr-2" />
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
              <div class="text-xl font-bold text-white">{{ vehicles.length }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-3">
              <div class="text-sm text-gray-400">Активна</div>
              <div class="text-xl font-bold text-green-500">{{ activeVehicles }}</div>
            </div>
          </div>

          <!-- Список техники -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Список техники</h3>
            
            <div
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :class="[
                'bg-gray-700 rounded-lg p-3 cursor-pointer transition-colors',
                selectedVehicleId === vehicle.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'
              ]"
              @click="selectVehicle(vehicle)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-medium">{{ vehicle.name }}</span>
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  ]"
                />
              </div>
              
              <div class="text-sm text-gray-400">
                Скорость: {{ vehicle.speed }} км/ч
              </div>
              
              <div class="text-xs text-gray-500 mt-1">
                {{ formatTime(vehicle.lastUpdate) }}
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
                  mqttSettings.connected ? 'bg-green-500' : 'bg-red-500'
                ]"
              />
            </div>
            <div class="text-sm text-gray-400">
              {{ mqttSettings.connected ? 'Подключен' : 'Отключен' }}
            </div>
          </div>

          <!-- Настройки подключения -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Настройки подключения</h3>
            
            <div>
              <label class="block text-sm text-gray-400 mb-1">URL сервера</label>
              <UInput
                v-model="mqttSettings.url"
                placeholder="ws://test.mosquitto.org:8080/mqtt"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Топик</label>
              <UInput
                v-model="mqttSettings.topic"
                placeholder="vehicles/+/telemetry"
                class="w-full"
              />
            </div>

            <!-- Кнопки управления -->
            <div class="flex space-x-2 pt-2">
              <UButton
                v-if="!mqttSettings.connected"
                @click="connectMqtt"
                color="green"
                class="flex-1"
                :loading="connecting"
              >
                Подключиться
              </UButton>
              
              <UButton
                v-else
                @click="disconnectMqtt"
                color="red"
                class="flex-1"
              >
                Отключиться
              </UButton>
              
              <!-- Убрана кнопка тестирования -->
            </div>
          </div>

          <!-- Лог сообщений -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Последние сообщения</h3>
            
            <div class="bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div
                v-for="(message, index) in mqttMessages"
                :key="index"
                class="text-xs text-gray-300 mb-1 font-mono"
              >
                <span class="text-gray-500">{{ formatTime(message.timestamp) }}</span>
                <span class="text-blue-400 ml-2">{{ message.topic }}</span>
                <div class="text-gray-300 ml-4">{{ message.payload }}</div>
              </div>
              
              <div v-if="mqttMessages.length === 0" class="text-gray-500 text-center">
                Нет сообщений
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Состояние панели
const activeTab = ref('vehicles')
const selectedVehicleId = ref(null)
const connecting = ref(false)
// Убрана переменная testing

// Вкладки
const tabs = [
  { id: 'vehicles', label: 'Техника', icon: 'i-heroicons-truck' },
  { id: 'mqtt', label: 'MQTT', icon: 'i-heroicons-signal' }
]

// Убраны демо данные - используем только реальные ESP32 устройства

// Настройки MQTT - используем Eclipse Mosquitto брокер
const mqttSettings = ref({
  url: 'ws://test.mosquitto.org:8080/mqtt',
  topic: 'car',
  connected: false
})

// Сообщения MQTT - пустой массив, заполняется реальными данными
const mqttMessages = ref([])

// Убраны вычисляемые свойства для демо данных

// Функции
const selectVehicle = (vehicle) => {
  selectedVehicleId.value = vehicle.id
  console.log('Выбрана техника:', vehicle.name)
}

const connectMqtt = async () => {
  connecting.value = true
  
  try {
    // Имитация подключения
    await new Promise(resolve => setTimeout(resolve, 2000))
    mqttSettings.value.connected = true
    
    // Добавляем сообщение о подключении
    mqttMessages.value.unshift({
      timestamp: new Date(),
      topic: 'system',
      payload: 'Подключение установлено'
    })
  } catch (error) {
    console.error('Ошибка подключения MQTT:', error)
  } finally {
    connecting.value = false
  }
}

const disconnectMqtt = () => {
  mqttSettings.value.connected = false
  mqttMessages.value.unshift({
    timestamp: new Date(),
    topic: 'system',
    payload: 'Соединение разорвано'
  })
}

// Убрана функция тестирования - используем только реальные ESP32 данные

// Используем новый composable для работы с временем
const { formatTime, getRelativeTime, getConnectionStatus } = useTime()
</script> 