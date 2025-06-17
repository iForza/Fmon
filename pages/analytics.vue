<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">📊 Аналитика и Графики</h1>
      <p class="text-gray-400">Телеметрия техники в реальном времени через API</p>
    </div>

    <!-- Статистические карточки -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Активная техника</p>
            <p class="text-2xl font-bold text-green-400">{{ activeVehiclesCount }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            🚜
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Средняя скорость</p>
            <p class="text-2xl font-bold text-blue-400">{{ averageSpeed.toFixed(1) }} км/ч</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            ⚡
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Средняя температура</p>
            <p class="text-2xl font-bold text-orange-400">{{ averageTemperature.toFixed(1) }}°C</p>
          </div>
          <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            🌡️
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">Всего техники</p>
            <p class="text-2xl font-bold text-white">{{ vehicles.length }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
            📊
          </div>
        </div>
      </div>
    </div>

    <!-- Статус API -->
    <div class="mb-6 bg-gray-800 rounded-lg p-4">
      <div class="flex items-center space-x-3">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            api.isConnected.value ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="text-white font-medium">
          {{ api.isConnected.value ? 'API подключен' : 'API отключен' }}
        </span>
        <button 
          @click="refreshData"
          class="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
        >
          Обновить данные
        </button>
      </div>
    </div>

    <!-- Таблица техники -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-white mb-4">📋 Список техники</h3>
      
      <div v-if="vehicles.length === 0" class="text-center py-8 text-gray-400">
        {{ api.isConnected.value ? 'Нет данных о технике' : 'Подключение к API...' }}
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-4 text-gray-400">Техника</th>
              <th class="text-left py-3 px-4 text-gray-400">Скорость</th>
              <th class="text-left py-3 px-4 text-gray-400">Координаты</th>
              <th class="text-left py-3 px-4 text-gray-400">Температура</th>
              <th class="text-left py-3 px-4 text-gray-400">Батарея</th>
              <th class="text-left py-3 px-4 text-gray-400">Статус</th>
              <th class="text-left py-3 px-4 text-gray-400">Обновлено</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              class="border-b border-gray-700 hover:bg-gray-700/50"
            >
              <td class="py-3 px-4 text-white font-medium">{{ vehicle.name || vehicle.id }}</td>
              <td class="py-3 px-4 text-gray-300">{{ vehicle.speed || 0 }} км/ч</td>
              <td class="py-3 px-4 text-gray-300 text-xs">
                {{ vehicle.lat?.toFixed(4) || 'N/A' }}, {{ vehicle.lng?.toFixed(4) || 'N/A' }}
              </td>
              <td class="py-3 px-4 text-gray-300">
                {{ vehicle.temperature ? vehicle.temperature.toFixed(1) + '°C' : 'N/A' }}
              </td>
              <td class="py-3 px-4 text-gray-300">
                {{ vehicle.battery ? vehicle.battery.toFixed(1) + '%' : 'N/A' }}
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs',
                    vehicle.status === 'active' ? 'bg-green-600 text-white' :
                    vehicle.status === 'offline' ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'
                  ]"
                >
                  {{ vehicle.status || 'unknown' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-400 text-xs">
                {{ formatTime(vehicle.lastUpdate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Отладочная информация -->
    <div class="mt-8 bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-white mb-4">🔧 Отладочная информация</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-700 rounded p-3">
          <div class="text-sm text-gray-400 mb-1">API статус:</div>
          <div class="text-white">{{ api.isConnected.value ? 'Подключен' : 'Отключен' }}</div>
        </div>
        <div class="bg-gray-700 rounded p-3">
          <div class="text-sm text-gray-400 mb-1">Загрузка:</div>
          <div class="text-white">{{ api.isLoading.value ? 'Да' : 'Нет' }}</div>
        </div>
        <div class="bg-gray-700 rounded p-3">
          <div class="text-sm text-gray-400 mb-1">Ошибка:</div>
          <div class="text-white">{{ api.error.value || 'Нет' }}</div>
        </div>
        <div class="bg-gray-700 rounded p-3">
          <div class="text-sm text-gray-400 mb-1">Всего транспорта:</div>
          <div class="text-white">{{ api.allVehicles.value.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useTime } from '~/composables/useTime'

// Установка темы приложения
useColorMode().value = 'dark'

// API composable
const api = useApi()
const { formatTime } = useTime()

// Получаем данные техники - только реальные ESP32 устройства
const vehicles = computed(() => {
  return api.allVehicles.value.filter(v => v.id && (v.id.startsWith('ESP32_') || v.id.includes('Car')))
})

// Вычисляемые статистики
const activeVehiclesCount = computed(() => {
  return vehicles.value.filter(v => v.status === 'active').length
})

const averageSpeed = computed(() => {
  const speeds = vehicles.value.map(v => v.speed).filter(s => s > 0)
  return speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
})

const averageTemperature = computed(() => {
  const temps = vehicles.value.map(v => v.temperature).filter(t => t != null)
  return temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0
})

// Функции
const refreshData = async () => {
  await api.fetchTelemetry()
  console.log('Analytics: Данные обновлены')
}

onMounted(async () => {
  console.log('Analytics: Страница загружена')
  console.log('Analytics: API статус:', api.isConnected.value)
  console.log('Analytics: API данные:', api.allVehicles.value)
  
  // Подключаемся к API если не подключены
  if (!api.isConnected.value) {
    console.log('Analytics: Подключаемся к API...')
    await api.initialize()
  }
  
  // Ждем немного для получения данных (только в браузере)
  if (process.client) {
    setTimeout(() => {
      console.log('Analytics: Данные после подключения:', api.allVehicles.value)
    }, 2000)
  }
})

// Метаданные страницы
useHead({
  title: 'Аналитика - Fleet Monitor',
  meta: [
    { name: 'description', content: 'Аналитика и статистика техники в реальном времени' }
  ]
})
</script> 