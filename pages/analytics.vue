<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">📊 Аналитика и Графики</h1>
      <p class="text-gray-400">Интерактивные графики телеметрии с поддержкой zoom</p>
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

    <!-- Панель управления графиками -->
    <div class="mb-6 bg-gray-800 rounded-lg p-6">
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <!-- Селектор техники -->
        <div class="flex items-center space-x-4">
          <label class="text-gray-400 text-sm">Техника:</label>
          <select 
            v-model="chartData.selectedVehicleId.value"
            @change="chartData.setSelectedVehicle(chartData.selectedVehicleId.value)"
            class="bg-gray-700 text-white rounded-md px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="all">Вся техника</option>
            <option 
              v-for="vehicle in vehicles" 
              :key="vehicle.id" 
              :value="vehicle.id"
            >
              {{ vehicle.name || vehicle.id }}
            </option>
          </select>
        </div>
        
        <!-- Кнопки временных диапазонов -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="range in chartData.timeRanges"
            :key="range.value"
            @click="chartData.setTimeRange(range.value)"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              chartData.selectedTimeRange.value === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
      
      <!-- Информация о текущем диапазоне -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              chartData.isLoading.value ? 'bg-yellow-500' : 
              chartData.hasData.value ? 'bg-green-500' : 'bg-red-500'
            ]"
          />
          <span class="text-sm text-gray-400">
            {{ 
              chartData.isLoading.value ? 'Загрузка данных...' :
              chartData.hasData.value ? `Отображается: ${chartData.currentTimeRange.value?.label}` :
              'Нет данных для отображения'
            }}
          </span>
        </div>
        
        <div class="text-xs text-gray-500">
          🖱️ Ctrl + колесико для zoom | Обновление каждые 5 сек
        </div>
      </div>
    </div>

    <!-- Графики ECharts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- График скорости -->
      <div class="bg-gray-800 rounded-lg p-6">
        <ChartComponent
          type="speed"
          title="📈 Скорость техники"
          :data="speedChartData"
          unit="км/ч"
          color="#3B82F6"
        />
      </div>

      <!-- График температуры -->
      <div class="bg-gray-800 rounded-lg p-6">
        <ChartComponent
          type="temperature"
          title="🌡️ Температура двигателя"
          :data="temperatureChartData"
          unit="°C"
          color="#EF4444"
        />
      </div>

      <!-- График батареи -->
      <div class="bg-gray-800 rounded-lg p-6">
        <ChartComponent
          type="battery"
          title="🔋 Заряд батареи"
          :data="batteryChartData"
          unit="%"
          color="#10B981"
        />
      </div>

      <!-- График RPM -->
      <div class="bg-gray-800 rounded-lg p-6">
        <ChartComponent
          type="rpm"
          title="⚙️ Обороты двигателя"
          :data="rpmChartData"
          unit="RPM"
          color="#8B5CF6"
        />
      </div>
    </div>

    <!-- Статус загрузки и ошибки -->
    <div v-if="chartData.error.value" class="mt-6 bg-red-800/20 border border-red-500 rounded-lg p-4">
      <div class="flex items-center space-x-2">
        <span class="text-red-400">❌</span>
        <span class="text-red-300">{{ chartData.error.value }}</span>
        <button 
          @click="chartData.fetchChartData()"
          class="ml-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Повторить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useChartData } from '~/composables/useChartData'

// Установка темы приложения
useColorMode().value = 'dark'

// Composables
const api = useApi()
const chartData = useChartData()

// Получаем данные техники
const vehicles = computed(() => {
  return api.allVehicles.value.filter(v => v.id && (v.id.startsWith('ESP32_') || v.id.includes('Car') || v.id.includes('tractor') || v.id.includes('combine')))
})

// Вычисляемые статистики
const activeVehiclesCount = computed(() => {
  return vehicles.value.filter(v => v.status === 'active').length
})

const averageSpeed = computed(() => {
  if (!chartData.hasData.value || chartData.chartData.value.length === 0) {
    const speeds = vehicles.value.map(v => v.speed).filter(s => s > 0)
    return speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
  }
  
  // Получаем среднюю скорость из данных графиков
  const allSpeeds = []
  chartData.chartData.value.forEach(vehicle => {
    vehicle.data.forEach(point => {
      if (point.speed > 0) allSpeeds.push(point.speed)
    })
  })
  return allSpeeds.length > 0 ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length : 0
})

const averageTemperature = computed(() => {
  if (!chartData.hasData.value || chartData.chartData.value.length === 0) {
    const temps = vehicles.value.map(v => v.temperature).filter(t => t != null)
    return temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0
  }
  
  // Получаем среднюю температуру из данных графиков
  const allTemps = []
  chartData.chartData.value.forEach(vehicle => {
    vehicle.data.forEach(point => {
      if (point.temperature != null) allTemps.push(point.temperature)
    })
  })
  return allTemps.length > 0 ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length : 0
})

// Данные для графиков
const speedChartData = computed(() => chartData.getChartSeries('speed'))
const temperatureChartData = computed(() => chartData.getChartSeries('temperature'))
const batteryChartData = computed(() => chartData.getChartSeries('battery'))
const rpmChartData = computed(() => chartData.getChartSeries('rpm'))

// Переменная для хранения функции очистки
let cleanupChartAutoUpdate = null

// Инициализация
onMounted(async () => {
  console.log('Analytics: Страница с ECharts загружена')
  
  // Подключаемся к API если не подключены
  if (!api.isConnected.value) {
    await api.initialize()
  }
  
  // Загружаем начальные данные графиков
  await chartData.fetchChartData()
  
  // Запускаем автоматическое обновление и сохраняем функцию очистки
  cleanupChartAutoUpdate = chartData.startAutoUpdate()
})

// Очистка ресурсов при размонтировании
onUnmounted(() => {
  console.log('🧹 Очистка ресурсов analytics.vue')
  
  // Останавливаем автоматическое обновление графиков
  if (cleanupChartAutoUpdate) {
    cleanupChartAutoUpdate()
  }
})

// Метаданные страницы
useHead({
  title: 'Аналитика ECharts - Fleet Monitor',
  meta: [
    { name: 'description', content: 'Интерактивные графики телеметрии с поддержкой масштабирования' }
  ]
})
</script> 