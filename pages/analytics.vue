<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Основной контент -->
    <main class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок страницы -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">📊 Аналитика и Графики</h1>
          <p class="text-gray-400">Телеметрия техники в реальном времени</p>
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
                <UIcon name="i-heroicons-truck" class="text-2xl text-green-400" />
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
                <UIcon name="i-heroicons-bolt" class="text-2xl text-blue-400" />
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
                <UIcon name="i-heroicons-fire" class="text-2xl text-orange-400" />
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400">Средний заряд</p>
                <p class="text-2xl font-bold text-yellow-400">{{ averageBattery.toFixed(1) }}%</p>
              </div>
              <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-battery-100" class="text-2xl text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Селектор временного диапазона -->
        <div class="mb-6 bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">⏱️ Временной диапазон</h3>
            <div class="flex space-x-2">
              <button
                v-for="range in timeRanges"
                :key="range.value"
                @click="selectedTimeRange = range.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedTimeRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-400">
            Показаны данные за {{ timeRanges.find(r => r.value === selectedTimeRange)?.label.toLowerCase() }}
          </div>
        </div>

        <!-- Графики -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- График скорости -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">📈 Скорость техники</h3>
            <ClientOnly>
              <apexchart
                type="line"
                height="300"
                :options="speedChartOptions"
                :series="speedChartSeries"
              />
              <template #fallback>
                <div class="h-[300px] flex items-center justify-center text-gray-400">
                  Загрузка графика...
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- График температуры -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">🌡️ Температура двигателя</h3>
            <ClientOnly>
              <apexchart
                type="area"
                height="300"
                :options="temperatureChartOptions"
                :series="temperatureChartSeries"
              />
              <template #fallback>
                <div class="h-[300px] flex items-center justify-center text-gray-400">
                  Загрузка графика...
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- График батареи -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">🔋 Уровень заряда</h3>
            <ClientOnly>
              <apexchart
                type="bar"
                height="300"
                :options="batteryChartOptions"
                :series="batteryChartSeries"
              />
              <template #fallback>
                <div class="h-[300px] flex items-center justify-center text-gray-400">
                  Загрузка графика...
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- График RPM -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">⚙️ Обороты двигателя</h3>
            <ClientOnly>
              <apexchart
                type="line"
                height="300"
                :options="rpmChartOptions"
                :series="rpmChartSeries"
              />
              <template #fallback>
                <div class="h-[300px] flex items-center justify-center text-gray-400">
                  Загрузка графика...
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Таблица детальной информации -->
        <div class="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">📋 Детальная информация</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="text-left py-3 px-4 text-gray-400">Техника</th>
                  <th class="text-left py-3 px-4 text-gray-400">Скорость</th>
                  <th class="text-left py-3 px-4 text-gray-400">Температура</th>
                  <th class="text-left py-3 px-4 text-gray-400">Батарея</th>
                  <th class="text-left py-3 px-4 text-gray-400">RPM</th>
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
                  <td class="py-3 px-4 text-white font-medium">{{ vehicle.name }}</td>
                  <td class="py-3 px-4 text-gray-300">{{ vehicle.speed }} км/ч</td>
                  <td class="py-3 px-4 text-gray-300">
                    {{ vehicle.temperature ? vehicle.temperature.toFixed(1) + '°C' : 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-300">
                    {{ vehicle.battery ? vehicle.battery.toFixed(1) + '%' : 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-300">
                    {{ vehicle.rpm || 'N/A' }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs',
                          vehicle.status === 'active' ? 'bg-green-500 text-white' : 
                          vehicle.status === 'offline' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
                        ]"
                      >
                        {{ vehicle.status === 'active' ? 'Активна' : 
                           vehicle.status === 'offline' ? 'Офлайн' : 'Остановлена' }}
                      </span>
                      <div
                        :class="[
                          'w-2 h-2 rounded-full',
                          getConnectionStatus(vehicle.lastUpdate) === 'online' ? 'bg-blue-500' : 
                          getConnectionStatus(vehicle.lastUpdate) === 'offline' ? 'bg-gray-500' : 'bg-yellow-500'
                        ]"
                        :title="getConnectionStatus(vehicle.lastUpdate) === 'online' ? 'Онлайн' : 
                                getConnectionStatus(vehicle.lastUpdate) === 'offline' ? 'Офлайн' : 'Неизвестно'"
                      />
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-400 text-xs">
                    <div class="flex flex-col">
                      <span>{{ getRelativeTime(vehicle.lastUpdate) }}</span>
                      <span class="text-xs text-gray-500">{{ formatTime(vehicle.lastUpdate) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Установка темы приложения
useColorMode().value = 'dark'

// API composable (вместо MQTT)
const api = useApi()

// Убраны демо данные - используем только реальные ESP32 устройства

// Получаем данные техники из app.vue через props или глобальное состояние
const { $router } = useNuxtApp()

// Кэш для сохранения данных ESP32 при разрывах связи
const esp32DataCache = ref([])

// Получаем данные техники - только реальные ESP32 устройства
const vehicles = computed(() => {
  // Проверяем есть ли реальные ESP32 устройства в API
  const realDevices = api.vehicles.value.filter(v => v.id && v.id.startsWith('ESP32_'))
  
  if (realDevices.length > 0) {
    // Если есть реальные ESP32 устройства, обновляем кэш и показываем их
    esp32DataCache.value = [...realDevices]
    console.log('Analytics: Используем только реальные ESP32 данные:', realDevices)
    return realDevices
  }
  
  // Если нет данных в API, но есть в кэше - используем кэш
  if (esp32DataCache.value.length > 0) {
    console.log('Analytics: Используем кэшированные ESP32 данные:', esp32DataCache.value)
    return esp32DataCache.value
  }
  
  // Если нет реальных устройств - возвращаем пустой массив
  if (api.isConnected.value) {
    console.log('Analytics: API подключен, ждем данные ESP32...')
  } else {
    console.log('Analytics: API не подключен, ждем подключения...')
  }
  return []
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

const averageBattery = computed(() => {
  const batteries = vehicles.value.map(v => v.battery).filter(b => b != null)
  return batteries.length > 0 ? batteries.reduce((a, b) => a + b, 0) / batteries.length : 0
})

// Временные диапазоны
const timeRanges = [
  { label: 'Последние 10 минут', value: 10, unit: 'minutes' },
  { label: 'Последний час', value: 1, unit: 'hours' },
  { label: 'Последние 6 часов', value: 6, unit: 'hours' },
  { label: 'Последние 12 часов', value: 12, unit: 'hours' },
  { label: 'Последние 24 часа', value: 24, unit: 'hours' }
]

const selectedTimeRange = ref(10) // По умолчанию 10 минут

// Функция для получения времени начала диапазона
const getTimeRangeStart = () => {
  const now = new Date()
  const range = timeRanges.find(r => r.value === selectedTimeRange.value)
  if (!range) return now.getTime() - 10 * 60 * 1000 // Fallback: 10 минут
  
  if (range.unit === 'minutes') {
    return now.getTime() - range.value * 60 * 1000
  } else if (range.unit === 'hours') {
    return now.getTime() - range.value * 60 * 60 * 1000
  }
  return now.getTime() - 10 * 60 * 1000
}

// Данные для графиков
const chartData = ref({
  speed: [],
  temperature: [],
  battery: [],
  rpm: [],
  timestamps: []
})

// Настройки графиков
const baseChartOptions = {
  chart: {
    background: 'transparent',
    foreColor: '#9CA3AF',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  theme: {
    mode: 'dark'
  },
  grid: {
    borderColor: '#374151',
    strokeDashArray: 3
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'HH:mm:ss'
    }
  },
  tooltip: {
    theme: 'dark'
  }
}

// График скорости
const speedChartOptions = ref({
  ...baseChartOptions,
  colors: ['#3B82F6', '#10B981', '#F59E0B'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  yaxis: {
    title: {
      text: 'Скорость (км/ч)'
    },
    min: 0,
    max: 50,
    tickAmount: 5,
    labels: {
      formatter: (value) => `${Math.round(value)} км/ч`
    }
  }
})

const speedChartSeries = ref([])

// График температуры
const temperatureChartOptions = ref({
  ...baseChartOptions,
  colors: ['#EF4444'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3
    }
  },
  annotations: {
    yaxis: [
      {
        y: 90,
        y2: 120,
        fillColor: '#FEE2E2',
        opacity: 0.3,
        label: {
          text: 'Критическая зона',
          style: {
            color: '#DC2626',
            fontSize: '12px'
          }
        }
      },
      {
        y: 70,
        y2: 90,
        fillColor: '#FEF3C7',
        opacity: 0.3,
        label: {
          text: 'Предупреждение',
          style: {
            color: '#D97706',
            fontSize: '12px'
          }
        }
      }
    ]
  },
  yaxis: {
    title: {
      text: 'Температура (°C)'
    },
    min: -20,
    max: 120,
    tickAmount: 7,
    labels: {
      formatter: (value) => `${Math.round(value)}°C`
    }
  }
})

const temperatureChartSeries = ref([])

// График батареи
const batteryChartOptions = ref({
  ...baseChartOptions,
  colors: ['#F59E0B'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%'
    }
  },
  annotations: {
    yaxis: [
      {
        y: 0,
        y2: 20,
        fillColor: '#FEE2E2',
        opacity: 0.3,
        label: {
          text: 'Критический заряд',
          style: {
            color: '#DC2626',
            fontSize: '12px'
          }
        }
      },
      {
        y: 20,
        y2: 40,
        fillColor: '#FEF3C7',
        opacity: 0.3,
        label: {
          text: 'Низкий заряд',
          style: {
            color: '#D97706',
            fontSize: '12px'
          }
        }
      }
    ]
  },
  yaxis: {
    title: {
      text: 'Заряд (%)'
    },
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: {
      formatter: (value) => `${Math.round(value)}%`
    }
  }
})

const batteryChartSeries = ref([])

// График RPM
const rpmChartOptions = ref({
  ...baseChartOptions,
  colors: ['#8B5CF6'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  annotations: {
    yaxis: [
      {
        y: 2500,
        y2: 3000,
        fillColor: '#FEE2E2',
        opacity: 0.3,
        label: {
          text: 'Высокие обороты',
          style: {
            color: '#DC2626',
            fontSize: '12px'
          }
        }
      },
      {
        y: 2000,
        y2: 2500,
        fillColor: '#FEF3C7',
        opacity: 0.3,
        label: {
          text: 'Повышенные обороты',
          style: {
            color: '#D97706',
            fontSize: '12px'
          }
        }
      }
    ]
  },
  yaxis: {
    title: {
      text: 'Обороты (RPM)'
    },
    min: 0,
    max: 3000,
    tickAmount: 6,
    labels: {
      formatter: (value) => `${Math.round(value)} RPM`
    }
  }
})

const rpmChartSeries = ref([])

// Хранилище исторических данных для графиков
const chartDataHistory = ref(new Map())
const MAX_DATA_POINTS = 500 // Увеличиваем для больших временных диапазонов
const MAX_DATA_RETENTION_TIME = 24 * 60 * 60 * 1000 // 24 часа максимальное хранение

// Функция добавления данных в историю
const addDataToHistory = (vehicleId, vehicleName, timestamp, data) => {
  if (!chartDataHistory.value.has(vehicleId)) {
    chartDataHistory.value.set(vehicleId, {
      name: vehicleName,
      speed: [],
      temperature: [],
      rpm: [],
      battery: []
    })
  }
  
  const history = chartDataHistory.value.get(vehicleId)
  
  // Добавляем новые данные
  if (data.speed !== undefined) {
    history.speed.push([timestamp, Number(data.speed) || 0])
  }
  if (data.temperature !== undefined && data.temperature !== null && !isNaN(data.temperature)) {
    history.temperature.push([timestamp, Number(data.temperature)])
  }
  if (data.rpm !== undefined && data.rpm !== null && !isNaN(data.rpm)) {
    history.rpm.push([timestamp, Number(data.rpm)])
  }
  if (data.battery !== undefined && data.battery !== null && !isNaN(data.battery)) {
    history.battery.push([timestamp, Number(data.battery)])
  }
  
  // Ограничиваем количество точек и удаляем старые данные (максимум 24 часа)
  const maxCutoffTime = timestamp - MAX_DATA_RETENTION_TIME
  
  history.speed = history.speed
    .filter(([time]) => time > maxCutoffTime)
    .slice(-MAX_DATA_POINTS)
  history.temperature = history.temperature
    .filter(([time]) => time > maxCutoffTime)
    .slice(-MAX_DATA_POINTS)
  history.rpm = history.rpm
    .filter(([time]) => time > maxCutoffTime)
    .slice(-MAX_DATA_POINTS)
  history.battery = history.battery
    .filter(([time]) => time > maxCutoffTime)
    .slice(-MAX_DATA_POINTS)
  
  // Обновляем имя если изменилось
  history.name = vehicleName
}

// Функция обновления данных графиков
const updateChartData = () => {
  try {
    const now = new Date().getTime()
    
    console.log('Analytics: Обновляем графики для техники:', vehicles.value)
    
    // Проверяем что у нас есть данные
    if (!vehicles.value || vehicles.value.length === 0) {
      console.log('Analytics: Нет данных для графиков')
      return
    }
    
    // Добавляем новые данные в историю
    vehicles.value.forEach(vehicle => {
      if (!vehicle || !vehicle.id) {
        console.warn('Analytics: Некорректные данные техники:', vehicle)
        return
      }
      
      console.log('Analytics: Обрабатываем технику:', vehicle.name, vehicle)
      
      addDataToHistory(vehicle.id, vehicle.name || 'Неизвестно', now, {
        speed: vehicle.speed,
        temperature: vehicle.temperature,
        rpm: vehicle.rpm,
        battery: vehicle.battery
      })
    })
    
    // Формируем данные для графиков из истории с учетом выбранного временного диапазона
    const timeRangeStart = getTimeRangeStart()
    const speedSeries = []
    const temperatureSeries = []
    const rpmSeries = []
    const batteryData = []
    
    chartDataHistory.value.forEach((history, vehicleId) => {
      // График скорости
      if (history.speed.length > 0) {
        const filteredSpeed = history.speed.filter(([time]) => time >= timeRangeStart)
        if (filteredSpeed.length > 0) {
          speedSeries.push({
            name: history.name,
            data: [...filteredSpeed]
          })
        }
      }
      
      // График температуры
      if (history.temperature.length > 0) {
        const filteredTemperature = history.temperature.filter(([time]) => time >= timeRangeStart)
        if (filteredTemperature.length > 0) {
          temperatureSeries.push({
            name: history.name,
            data: [...filteredTemperature]
          })
        }
      }
      
      // График RPM
      if (history.rpm.length > 0) {
        const filteredRpm = history.rpm.filter(([time]) => time >= timeRangeStart)
        if (filteredRpm.length > 0) {
          rpmSeries.push({
            name: history.name,
            data: [...filteredRpm]
          })
        }
      }
      
      // График батареи (берем последнее значение для столбчатого графика)
      if (history.battery.length > 0) {
        const filteredBattery = history.battery.filter(([time]) => time >= timeRangeStart)
        if (filteredBattery.length > 0) {
          const lastBattery = filteredBattery[filteredBattery.length - 1]
          batteryData.push({
            x: history.name,
            y: lastBattery[1]
          })
        }
      }
    })
    
    console.log('Analytics: Данные для графиков:', {
      speed: speedSeries.map(s => ({ name: s.name, points: s.data.length })),
      temperature: temperatureSeries.map(s => ({ name: s.name, points: s.data.length })),
      rpm: rpmSeries.map(s => ({ name: s.name, points: s.data.length })),
      battery: batteryData
    })
    
    // Обновляем графики
    speedChartSeries.value = speedSeries
    temperatureChartSeries.value = temperatureSeries
    rpmChartSeries.value = rpmSeries
    batteryChartSeries.value = batteryData.length > 0 ? [{ name: 'Заряд батареи', data: batteryData }] : []
    
  } catch (error) {
    console.error('Analytics: Ошибка при обновлении графиков:', error)
  }
}

// Используем новый composable для работы с временем
const { formatTime, getRelativeTime, getConnectionStatus } = useTime()

// Интервал обновления графиков
let updateInterval = null

onMounted(async () => {
  console.log('Analytics: Страница загружена')
  console.log('Analytics: API статус:', api.isConnected.value)
  console.log('Analytics: API данные:', api.vehicles.value)
  
  // Подключаемся к API если не подключены
  if (!api.isConnected.value) {
    console.log('Analytics: Подключаемся к API...')
    await api.connect()
  }
  
  // Ждем немного для получения данных (только в браузере)
  if (process.client) {
    setTimeout(() => {
      console.log('Analytics: Данные после подключения:', api.vehicles.value)
      updateChartData()
    }, 2000)
  }
  
  // Первоначальное обновление данных
  updateChartData()
  
  // Обновляем графики каждые 3 секунды (только в браузере)
  if (process.client) {
    updateInterval = setInterval(() => {
      updateChartData()
    }, 3000)
  }
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Следим за изменениями в данных техники
watch(vehicles, (newVehicles, oldVehicles) => {
  console.log('Analytics: Данные техники изменились:', newVehicles)
  updateChartData()
}, { deep: true, immediate: true })

// Следим за изменениями статуса API
watch(() => api.isConnected.value, (connected) => {
  console.log('Analytics: API статус изменился:', connected)
  if (connected && process.client) {
    setTimeout(() => {
      updateChartData()
    }, 1000)
  }
})

// Следим за изменениями в API данных
watch(() => api.vehicles.value, (newData) => {
  console.log('Analytics: API данные изменились:', newData)
  updateChartData()
}, { deep: true })

// Следим за изменениями временного диапазона
watch(selectedTimeRange, (newRange) => {
  console.log('Analytics: Временной диапазон изменился:', newRange)
  updateChartData()
})

// Функция для очистки истории отключенных устройств
const cleanupDisconnectedDevices = () => {
  const currentDeviceIds = new Set(vehicles.value.map(v => v.id))
  const historyKeys = Array.from(chartDataHistory.value.keys())
  
  historyKeys.forEach(deviceId => {
    if (!currentDeviceIds.has(deviceId)) {
      console.log('Analytics: Удаляем историю для отключенного устройства:', deviceId)
      chartDataHistory.value.delete(deviceId)
    }
  })
}

// Очищаем историю отключенных устройств каждые 30 секунд (только в браузере)
if (process.client) {
  setInterval(cleanupDisconnectedDevices, 30000)
}

// Убрана функция генерации тестовых данных - используем только реальные ESP32 данные
</script> 