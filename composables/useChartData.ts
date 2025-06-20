import { ref, computed } from 'vue'

export interface ChartDataPoint {
  timestamp: number
  speed: number
  temperature: number
  battery: number
  rpm: number
}

export interface VehicleChartData {
  vehicleId: string
  vehicleName: string
  data: ChartDataPoint[]
}

export const useChartData = () => {
  const chartData = ref<VehicleChartData[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedTimeRange = ref('10min')
  const selectedVehicleId = ref<string>('all')

  // Доступные временные диапазоны
  const timeRanges = [
    { label: 'Последние 10 минут', value: '10min' },
    { label: 'Последний час', value: '1h' },
    { label: 'Последние 6 часов', value: '6h' },
    { label: 'Последние 12 часов', value: '12h' },
    { label: 'Последние 24 часа', value: '24h' }
  ]

  // Получение данных с сервера
  const fetchChartData = async () => {
    try {
      isLoading.value = true
      error.value = null

      const params = new URLSearchParams({
        range: selectedTimeRange.value
      })

      if (selectedVehicleId.value !== 'all') {
        params.append('vehicleId', selectedVehicleId.value)
      }

      const response = await $fetch<{
        success: boolean
        data: VehicleChartData[]
        range: string
        count: number
      }>(`/api/telemetry/history?${params}`)

      if (response.success) {
        chartData.value = response.data
      } else {
        throw new Error('Ошибка получения данных')
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки данных графиков'
      console.error('Chart data fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Форматирование данных для конкретного типа графика
  const getChartSeries = (type: 'speed' | 'temperature' | 'battery' | 'rpm') => {
    return chartData.value.map(vehicle => ({
      name: vehicle.vehicleName,
      type: 'line',
      data: vehicle.data.map(point => [point.timestamp, point[type]]),
      smooth: true
    }))
  }

  // Получение диапазона времени для оси X
  const getTimeAxisRange = () => {
    if (chartData.value.length === 0) return null

    let minTime = Infinity
    let maxTime = -Infinity

    chartData.value.forEach(vehicle => {
      vehicle.data.forEach(point => {
        minTime = Math.min(minTime, point.timestamp)
        maxTime = Math.max(maxTime, point.timestamp)
      })
    })

    return minTime !== Infinity ? [minTime, maxTime] : null
  }

  // Установка временного диапазона
  const setTimeRange = (range: string) => {
    selectedTimeRange.value = range
    fetchChartData()
  }

  // Установка выбранной техники
  const setSelectedVehicle = (vehicleId: string) => {
    selectedVehicleId.value = vehicleId
    fetchChartData()
  }

  // Автоматическое обновление данных каждые 5 секунд
  const startAutoUpdate = () => {
    const interval = setInterval(() => {
      if (!isLoading.value) {
        fetchChartData()
      }
    }, 5000)

    // Очистка интервала при размонтировании
    onUnmounted(() => {
      clearInterval(interval)
    })

    return interval
  }

  // Вычисляемые свойства
  const currentTimeRange = computed(() => {
    return timeRanges.find(range => range.value === selectedTimeRange.value)
  })

  const hasData = computed(() => {
    return chartData.value.length > 0 && chartData.value.some(v => v.data.length > 0)
  })

  return {
    // Состояние
    chartData: readonly(chartData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    selectedTimeRange: readonly(selectedTimeRange),
    selectedVehicleId: readonly(selectedVehicleId),
    
    // Константы
    timeRanges,
    
    // Методы
    fetchChartData,
    getChartSeries,
    getTimeAxisRange,
    setTimeRange,
    setSelectedVehicle,
    startAutoUpdate,
    
    // Вычисляемые свойства
    currentTimeRange,
    hasData
  }
} 