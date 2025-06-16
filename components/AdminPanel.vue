<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full max-w-6xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">
            <UIcon name="i-heroicons-cog-6-tooth" class="mr-2" />
            Админ-панель MapMon
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closePanel"
          />
        </div>
      </template>

      <!-- Вкладки админ-панели -->
      <div class="space-y-6">
        <!-- Навигация по вкладкам -->
        <div class="flex border-b border-gray-700">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            <UIcon :name="tab.icon" class="mr-2" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Содержимое вкладок -->
        <div class="min-h-[400px]">
          <!-- Вкладка: Обзор системы -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Статистика MQTT -->
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-400">MQTT Статус</p>
                    <p class="text-xl font-bold" :class="mqttConnected ? 'text-green-500' : 'text-red-500'">
                      {{ mqttConnected ? 'Подключен' : 'Отключен' }}
                    </p>
                  </div>
                  <UIcon name="i-heroicons-signal" :class="mqttConnected ? 'text-green-500' : 'text-red-500'" class="text-2xl" />
                </div>
              </div>

              <!-- Количество техники -->
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-400">Всего техники</p>
                    <p class="text-xl font-bold text-white">{{ totalVehicles }}</p>
                  </div>
                  <UIcon name="i-heroicons-truck" class="text-blue-500 text-2xl" />
                </div>
              </div>

              <!-- Активная техника -->
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-400">Активна</p>
                    <p class="text-xl font-bold text-green-500">{{ activeVehicles }}</p>
                  </div>
                  <UIcon name="i-heroicons-play" class="text-green-500 text-2xl" />
                </div>
              </div>

              <!-- Сообщения MQTT -->
              <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-400">Сообщений</p>
                    <p class="text-xl font-bold text-white">{{ totalMessages }}</p>
                  </div>
                  <UIcon name="i-heroicons-chat-bubble-left-right" class="text-purple-500 text-2xl" />
                </div>
              </div>
            </div>

            <!-- График активности (заглушка) -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-white mb-4">Активность системы</h4>
              <div class="h-32 bg-gray-700 rounded flex items-center justify-center">
                <p class="text-gray-400">График активности (в разработке)</p>
              </div>
            </div>
          </div>

          <!-- Вкладка: Управление техникой -->
          <div v-if="activeTab === 'vehicles'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-semibold text-white">Список техники</h4>
              <UButton color="green" @click="refreshVehicles">
                <UIcon name="i-heroicons-arrow-path" class="mr-2" />
                Обновить
              </UButton>
            </div>

            <!-- Таблица техники -->
            <div class="bg-gray-800 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-700">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Название</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Статус</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Скорость</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Батарея</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Последнее обновление</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                  <tr v-for="vehicle in vehicles" :key="vehicle.id" class="hover:bg-gray-700">
                    <td class="px-4 py-3 text-sm text-gray-300 font-mono">{{ vehicle.id }}</td>
                    <td class="px-4 py-3 text-sm text-white">{{ vehicle.name }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="getStatusColor(vehicle.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ getStatusText(vehicle.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">{{ vehicle.speed }} км/ч</td>
                    <td class="px-4 py-3 text-sm text-gray-300">
                      {{ vehicle.battery ? `${vehicle.battery}%` : 'N/A' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-300">{{ formatTime(vehicle.lastUpdate) }}</td>
                    <td class="px-4 py-3 text-sm">
                      <UButton size="xs" color="blue" @click="viewVehicleDetails(vehicle)">
                        Детали
                      </UButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Вкладка: MQTT Логи -->
          <div v-if="activeTab === 'mqtt'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-semibold text-white">MQTT Сообщения</h4>
              <div class="flex space-x-2">
                <UButton color="gray" @click="clearLogs">
                  <UIcon name="i-heroicons-trash" class="mr-2" />
                  Очистить
                </UButton>
                <UButton color="green" @click="exportLogs">
                  <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
                  Экспорт
                </UButton>
              </div>
            </div>

            <!-- Лог сообщений -->
            <div class="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto">
              <div v-for="(message, index) in messages" :key="index" class="mb-2 text-xs font-mono">
                <div class="flex items-start space-x-2">
                  <span class="text-gray-500 min-w-[80px]">{{ formatTime(message.timestamp) }}</span>
                  <span class="text-blue-400 min-w-[100px]">{{ message.topic }}</span>
                  <span class="text-gray-300 flex-1">{{ message.payload }}</span>
                </div>
              </div>
              <div v-if="messages.length === 0" class="text-center text-gray-500 mt-8">
                Нет сообщений для отображения
              </div>
            </div>
          </div>

          <!-- Вкладка: Настройки -->
          <div v-if="activeTab === 'settings'" class="space-y-6">
            <h4 class="text-lg font-semibold text-white">Системные настройки</h4>
            
            <!-- MQTT Настройки -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h5 class="text-md font-medium text-white mb-4">MQTT Конфигурация</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">URL сервера</label>
                  <UInput v-model="mqttConfig.url" readonly class="bg-gray-700" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">Пользователь</label>
                  <UInput v-model="mqttConfig.username" readonly class="bg-gray-700" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">Client ID</label>
                  <UInput v-model="mqttConfig.clientId" readonly class="bg-gray-700" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">Топики</label>
                  <UInput :value="mqttConfig.topics.join(', ')" readonly class="bg-gray-700" />
                </div>
              </div>
            </div>

            <!-- Системная информация -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h5 class="text-md font-medium text-white mb-4">Информация о системе</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">Версия MapMon:</span>
                  <span class="text-white ml-2">v0.5.0</span>
                </div>
                <div>
                  <span class="text-gray-400">Время работы:</span>
                  <span class="text-white ml-2">{{ uptime }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Последний перезапуск:</span>
                  <span class="text-white ml-2">{{ lastRestart }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Статус API:</span>
                  <span class="text-green-500 ml-2">Активен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Пропсы
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  vehicles: {
    type: Array,
    default: () => []
  },
  messages: {
    type: Array,
    default: () => []
  },
  mqttConnected: {
    type: Boolean,
    default: false
  },
  mqttConfig: {
    type: Object,
    default: () => ({})
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue', 'refresh-vehicles', 'clear-logs', 'export-logs'])

// Состояние
const activeTab = ref('overview')
const startTime = ref(new Date())

// Вычисляемые свойства
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const totalVehicles = computed(() => props.vehicles.length)
const activeVehicles = computed(() => props.vehicles.filter(v => v.status === 'active').length)
const totalMessages = computed(() => props.messages.length)

const uptime = computed(() => {
  const now = new Date()
  const diff = now - startTime.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}ч ${minutes}м`
})

const lastRestart = computed(() => {
  return startTime.value.toLocaleString('ru-RU')
})

// Вкладки
const tabs = [
  { id: 'overview', label: 'Обзор', icon: 'i-heroicons-squares-2x2' },
  { id: 'vehicles', label: 'Техника', icon: 'i-heroicons-truck' },
  { id: 'mqtt', label: 'MQTT Логи', icon: 'i-heroicons-chat-bubble-left-right' },
  { id: 'settings', label: 'Настройки', icon: 'i-heroicons-cog-6-tooth' }
]

// Методы
const closePanel = () => {
  isOpen.value = false
}

const refreshVehicles = () => {
  emit('refresh-vehicles')
}

const clearLogs = () => {
  emit('clear-logs')
}

const exportLogs = () => {
  emit('export-logs')
}

const viewVehicleDetails = (vehicle) => {
  // TODO: Показать детальную информацию о технике
  console.log('Детали техники:', vehicle)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-500 text-white'
    case 'stopped': return 'bg-yellow-500 text-black'
    case 'offline': return 'bg-red-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Активна'
    case 'stopped': return 'Остановлена'
    case 'offline': return 'Офлайн'
    default: return 'Неизвестно'
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString('ru-RU')
}

// Инициализация
onMounted(() => {
  startTime.value = new Date()
})
</script> 