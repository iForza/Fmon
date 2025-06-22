<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Навигация -->
    <AppHeader />
    
    <!-- Уведомления о новой технике -->
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <div
        v-for="vehicleId in []"
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
                    <div class="text-xl font-bold text-white">{{ api.allVehicles.value.length }}</div>
                  </div>
                  <div class="bg-gray-700 rounded-lg p-3">
                    <div class="text-sm text-gray-400">Активна</div>
                    <div class="text-xl font-bold text-green-500">{{ api.activeVehicles.value }}</div>
                  </div>
                </div>

                <!-- Список техники -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wide">Список техники</h3>
                    <div class="text-xs text-gray-500">
                      {{ api.isConnected.value ? '🔗 API' : '❌ Офлайн' }}
                    </div>
                  </div>
                  
                  <div
                    v-for="vehicle in api.allVehicles.value"
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
                    
                    <!-- Основные параметры -->
                    <div class="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div class="bg-gray-600 rounded px-2 py-1">
                        <div class="text-gray-400">Скорость</div>
                        <div class="text-white font-medium">{{ vehicle.speed || 0 }} км/ч</div>
                      </div>
                      <div class="bg-gray-600 rounded px-2 py-1">
                        <div class="text-gray-400">Батарея</div>
                        <div class="text-white font-medium">
                          {{ vehicle.battery ? vehicle.battery.toFixed(1) + '%' : 'N/A' }}
                        </div>
                      </div>
                      <div class="bg-gray-600 rounded px-2 py-1">
                        <div class="text-gray-400">Температура</div>
                        <div class="text-white font-medium">
                          {{ vehicle.temperature ? vehicle.temperature.toFixed(1) + '°C' : 'N/A' }}
                        </div>
                      </div>
                      <div class="bg-gray-600 rounded px-2 py-1">
                        <div class="text-gray-400">Обороты</div>
                        <div class="text-white font-medium">
                          {{ vehicle.rpm ? vehicle.rpm + ' RPM' : 'N/A' }}
                        </div>
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
          </div>
        </div>
      </div>
      
      <!-- Правая панель с картой (70%) -->
      <div class="flex-1 relative">
        <NuxtPage 
          :vehicles="api.allVehicles.value"
          :selectedVehicleId="selectedVehicleId"
          @vehicle-selected="selectVehicle"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useTime } from '~/composables/useTime'

// Установка темы приложения
useColorMode().value = 'dark'

// Инициализация API клиента вместо MQTT
const api = useApi()
const { formatTime, getRelativeTime, getConnectionStatus } = useTime()

// Состояние панели
const activeTab = ref('vehicles')
const selectedVehicleId = ref(null)

// Вкладки
const tabs = [
  { id: 'vehicles', label: 'Техника', icon: '🚜' }
]

// Функции
const selectVehicle = (vehicle) => {
  if (typeof vehicle === 'string') {
    selectedVehicleId.value = vehicle
    const vehicleObj = api.allVehicles.value.find(v => v.id === vehicle)
    console.log('Выбрана техника:', vehicleObj?.name || vehicle)
  } else {
    selectedVehicleId.value = vehicle.id
    console.log('Выбрана техника:', vehicle.name)
  }
}

const refreshData = async () => {
  await api.fetchTelemetry()
  console.log('Данные обновлены')
}

const checkApiStatus = async () => {
  await api.checkApiStatus()
  console.log('Статус API проверен')
}

// Инициализация при монтировании
onMounted(async () => {
  console.log('🚀 Запуск MapMon с API архитектурой')
  
  // Инициализируем API подключение
  await api.initialize()
  
  // Запускаем автоматическое обновление данных
  api.startPolling()
  
  console.log('✅ MapMon готов к работе')
})

// Метаданные страницы
useHead({
  title: 'Fleet Monitor API - Мониторинг техники',
  meta: [
    { name: 'description', content: 'Система мониторинга техники через серверный API без дублирования MQTT' }
  ]
})
</script>

<style>
/* Глобальные стили для темной темы */
html {
  background-color: #111827;
  color: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

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