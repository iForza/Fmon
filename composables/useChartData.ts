import { ref, computed, onUnmounted, readonly, getCurrentInstance } from 'vue'

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

// Интерфейс для кеша данных с инертностью
interface CachedVehicleData {
  vehicleId: string
  vehicleName: string
  lastUpdate: number
  lastValidData: {
    speed: number
    temperature: number
    battery: number
    rpm: number
  }
  history: ChartDataPoint[]
}

export const useChartData = () => {
  const chartData = ref<VehicleChartData[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedTimeRange = ref('10min')
  const selectedVehicleId = ref<string>('all')
  
  // Локальный кеш данных с инертностью (10 секунд)
  const dataCache = ref<Map<string, CachedVehicleData>>(new Map())
  const DATA_INERTIA_TIME = 10000 // 10 секунд инертности
  const MAX_CACHE_SIZE = 1000 // Максимум точек в кеше на устройство

  // Доступные временные диапазоны
  const timeRanges = [
    { label: 'Последние 10 минут', value: '10min' },
    { label: 'Последний час', value: '1h' },
    { label: 'Последние 6 часов', value: '6h' },
    { label: 'Последние 12 часов', value: '12h' },
    { label: 'Последние 24 часа', value: '24h' }
  ]

  // Получение временного диапазона в миллисекундах
  const getTimeRangeMs = (range: string): number => {
    const ranges = {
      '10min': 10 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    }
    return ranges[range as keyof typeof ranges] || ranges['10min']
  }

  // Интерполяция данных для заполнения пропусков
  const interpolateData = (data: ChartDataPoint[], timeRange: number): ChartDataPoint[] => {
    if (data.length === 0) return []
    
    const now = Date.now()
    const startTime = now - timeRange
    const endTime = now
    const interval = Math.max(5000, Math.floor(timeRange / 200)) // Минимум 5 сек, максимум 200 точек
    
    const interpolated: ChartDataPoint[] = []
    let dataIndex = 0
    
    for (let time = startTime; time <= endTime; time += interval) {
      // Находим ближайшие данные
      while (dataIndex < data.length - 1 && data[dataIndex + 1].timestamp <= time) {
        dataIndex++
      }
      
      if (dataIndex < data.length) {
        const current = data[dataIndex]
        const next = dataIndex < data.length - 1 ? data[dataIndex + 1] : null
        
        if (next && next.timestamp > time && current.timestamp <= time) {
          // Интерполируем между current и next
          const factor = (time - current.timestamp) / (next.timestamp - current.timestamp)
          interpolated.push({
            timestamp: time,
            speed: current.speed + (next.speed - current.speed) * factor,
            temperature: current.temperature + (next.temperature - current.temperature) * factor,
            battery: current.battery + (next.battery - current.battery) * factor,
            rpm: current.rpm + (next.rpm - current.rpm) * factor
          })
        } else {
          // Используем текущие данные
          interpolated.push({
            timestamp: time,
            speed: current.speed,
            temperature: current.temperature,
            battery: current.battery,
            rpm: current.rpm
          })
        }
      }
    }
    
    return interpolated
  }

  // Обновление кеша с инертностью
  const updateDataCache = (newData: VehicleChartData[]) => {
    const now = Date.now()
    
    newData.forEach(vehicle => {
      const cached = dataCache.value.get(vehicle.vehicleId)
      
      if (cached) {
        // Обновляем существующий кеш
        cached.lastUpdate = now
        
        // Добавляем новые данные в историю
        vehicle.data.forEach(point => {
          // Проверяем, что точка еще не добавлена
          const exists = cached.history.some(h => Math.abs(h.timestamp - point.timestamp) < 1000)
          if (!exists) {
            cached.history.push(point)
            
            // Обновляем последние валидные данные
            if (point.speed > 0 || point.temperature > 0 || point.battery > 0 || point.rpm > 0) {
              cached.lastValidData = {
                speed: point.speed || cached.lastValidData.speed,
                temperature: point.temperature || cached.lastValidData.temperature,
                battery: point.battery || cached.lastValidData.battery,
                rpm: point.rpm || cached.lastValidData.rpm
              }
            }
          }
        })
        
        // Сортируем и обрезаем историю
        cached.history = cached.history
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-MAX_CACHE_SIZE)
          
      } else {
        // Создаем новый кеш
        const lastPoint = vehicle.data[vehicle.data.length - 1]
        dataCache.value.set(vehicle.vehicleId, {
          vehicleId: vehicle.vehicleId,
          vehicleName: vehicle.vehicleName,
          lastUpdate: now,
          lastValidData: {
            speed: lastPoint?.speed || 0,
            temperature: lastPoint?.temperature || 0,
            battery: lastPoint?.battery || 0,
            rpm: lastPoint?.rpm || 0
          },
          history: [...vehicle.data].sort((a, b) => a.timestamp - b.timestamp)
        })
      }
    })
  }

  // Получение данных с применением инертности
  const getDataWithInertia = (): VehicleChartData[] => {
    const now = Date.now()
    const timeRange = getTimeRangeMs(selectedTimeRange.value)
    const result: VehicleChartData[] = []
    
    dataCache.value.forEach(cached => {
      const timeSinceUpdate = now - cached.lastUpdate
      let data = [...cached.history]
      
      // Если данные устарели, но в пределах инертности - добавляем последние валидные данные
      if (timeSinceUpdate > 5000 && timeSinceUpdate < DATA_INERTIA_TIME) {
        data.push({
          timestamp: now,
          ...cached.lastValidData
        })
      }
      
      // Фильтруем по временному диапазону
      const startTime = now - timeRange
      const filteredData = data.filter(point => point.timestamp >= startTime)
      
      // Интерполируем данные для заполнения диапазона
      const interpolatedData = interpolateData(filteredData, timeRange)
      
      if (interpolatedData.length > 0) {
        result.push({
          vehicleId: cached.vehicleId,
          vehicleName: cached.vehicleName,
          data: interpolatedData
        })
      }
    })
    
    return result
  }

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
        // Обновляем кеш с новыми данными
        updateDataCache(response.data)
        
        // Получаем данные с применением инертности и интерполяции
        chartData.value = getDataWithInertia()
      } else {
        throw new Error('Ошибка получения данных')
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки данных графиков'
      console.error('Chart data fetch error:', err)
      
      // При ошибке используем кешированные данные с инертностью
      chartData.value = getDataWithInertia()
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

  // Получение фиксированного диапазона времени для оси X
  const getTimeAxisRange = () => {
    const now = Date.now()
    const timeRange = getTimeRangeMs(selectedTimeRange.value)
    return [now - timeRange, now]
  }

  // Установка временного диапазона
  const setTimeRange = (range: string) => {
    selectedTimeRange.value = range
    // Обновляем отображение с новым диапазоном без запроса к серверу
    chartData.value = getDataWithInertia()
    // Также делаем запрос для получения актуальных данных
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

    // Очистка интервала при размонтировании (только если есть активный компонент)
    if (getCurrentInstance()) {
      onUnmounted(() => {
        clearInterval(interval)
      })
    }

    // Возвращаем функцию для ручной очистки
    return () => clearInterval(interval)
  }

  // Очистка устаревших данных из кеша
  const cleanupCache = () => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 часа
    
    dataCache.value.forEach((cached, vehicleId) => {
      if (now - cached.lastUpdate > maxAge) {
        dataCache.value.delete(vehicleId)
      } else {
        // Очищаем старые данные из истории
        const cutoff = now - maxAge
        cached.history = cached.history.filter(point => point.timestamp > cutoff)
      }
    })
  }

  // Запускаем очистку кеша каждые 30 минут
  if (process.client) {
    setInterval(cleanupCache, 30 * 60 * 1000)
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