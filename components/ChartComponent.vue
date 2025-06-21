<template>
  <div ref="chartContainer" class="chart-container w-full h-full min-h-[300px]" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Пропсы
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['speed', 'temperature', 'battery', 'rpm'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  unit: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  yAxisRange: {
    type: Array,
    default: null
  }
})

// Реферансы
const chartContainer = ref(null)
let chartInstance = null
let currentZoomState = null // Состояние зума для сохранения

// Настройки для разных типов графиков
const getChartConfig = () => {
  const configs = {
    speed: {
      color: '#3B82F6',
      yMax: 50,
      unit: 'км/ч',
      formatValue: (value) => `${value.toFixed(1)} км/ч`
    },
    temperature: {
      color: '#EF4444', 
      yMax: 120,
      yMin: -20,
      unit: '°C',
      formatValue: (value) => `${value.toFixed(1)}°C`
    },
    battery: {
      color: '#10B981',
      yMax: 100, 
      yMin: 0,
      unit: '%',
      formatValue: (value) => `${value.toFixed(1)}%`
    },
    rpm: {
      color: '#8B5CF6',
      yMax: 3000,
      yMin: 0,
      unit: 'RPM', 
      formatValue: (value) => `${Math.round(value)} RPM`
    }
  }
  
  return configs[props.type] || configs.speed
}

// Получение фиксированного временного диапазона
const getFixedTimeRange = () => {
  const now = Date.now()
  const ranges = {
    '10min': 10 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000
  }
  
  // Попытаемся определить диапазон из данных или используем час по умолчанию
  let range = ranges['1h']
  
  // Если есть данные, попробуем угадать диапазон
  if (props.data.length > 0) {
    const firstSeries = props.data[0]
    if (firstSeries && firstSeries.data && firstSeries.data.length > 1) {
      const dataRange = firstSeries.data[firstSeries.data.length - 1][0] - firstSeries.data[0][0]
      // Найдем ближайший диапазон
      const rangeName = Object.keys(ranges).find(key => 
        Math.abs(ranges[key] - dataRange) < Math.abs(range - dataRange)
      )
      if (rangeName) range = ranges[rangeName]
    }
  }
  
  return [now - range, now]
}

// Создание опций графика
const createChartOptions = () => {
  const config = getChartConfig()
  const timeRange = getFixedTimeRange()
  
  return {
    animation: false,
    backgroundColor: 'transparent',
    textStyle: {
      color: '#9CA3AF'
    },
    title: {
      text: props.title,
      left: 'left',
      textStyle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#374151',
      borderColor: '#6B7280',
      textStyle: {
        color: '#FFFFFF'
      },
      formatter: (params) => {
        if (!params || params.length === 0) return ''
        
        const point = params[0]
        const time = new Date(point.axisValue).toLocaleTimeString('ru-RU')
        const value = config.formatValue(point.value[1])
        
        return `
          <div style="padding: 8px;">
            <div style="color: #9CA3AF; font-size: 12px;">${time}</div>
            <div style="margin-top: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${config.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #FFFFFF; font-weight: bold;">${point.seriesName}: ${value}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      top: '20%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      // Фиксированный диапазон времени
      min: timeRange[0],
      max: timeRange[1],
      axisLine: {
        lineStyle: { color: '#374151' }
      },
      axisTick: {
        lineStyle: { color: '#374151' }
      },
      axisLabel: {
        color: '#9CA3AF',
        formatter: (value) => {
          const date = new Date(value)
          return date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#374151',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: config.yMin !== undefined ? config.yMin : 0,
      max: props.yAxisRange ? props.yAxisRange[1] : config.yMax,
      axisLine: {
        lineStyle: { color: '#374151' }
      },
      axisTick: {
        lineStyle: { color: '#374151' }
      },
      axisLabel: {
        color: '#9CA3AF',
        formatter: (value) => config.formatValue(value)
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
          type: 'dashed'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: currentZoomState?.xStart || 0,
        end: currentZoomState?.xEnd || 100,
        startValue: currentZoomState?.xStartValue,
        endValue: currentZoomState?.xEndValue,
        zoomOnMouseWheel: 'ctrl',
        // Сохраняем состояние зума
        ...(currentZoomState && {
          start: currentZoomState.xStart,
          end: currentZoomState.xEnd
        })
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        start: currentZoomState?.yStart || 0,
        end: currentZoomState?.yEnd || 100,
        startValue: currentZoomState?.yStartValue,
        endValue: currentZoomState?.yEndValue,
        zoomOnMouseWheel: false,
        // Сохраняем состояние зума по Y
        ...(currentZoomState && {
          start: currentZoomState.yStart,
          end: currentZoomState.yEnd
        })
      }
    ],
    series: props.data.map((series, index) => ({
      name: series.name,
      type: 'line',
      data: series.data,
      smooth: true,
      lineStyle: {
        width: 2,
        color: index === 0 ? config.color : `hsl(${(index * 60) % 360}, 70%, 60%)`
      },
      itemStyle: {
        color: index === 0 ? config.color : `hsl(${(index * 60) % 360}, 70%, 60%)`
      },
      areaStyle: {
        opacity: 0.1,
        color: index === 0 ? config.color : `hsl(${(index * 60) % 360}, 70%, 60%)`
      },
      symbol: 'circle',
      symbolSize: 4,
      emphasis: {
        symbolSize: 8
      }
    }))
  }
}

// Сохранение состояния зума
const saveZoomState = () => {
  if (!chartInstance) return
  
  try {
    const option = chartInstance.getOption()
    if (option.dataZoom && option.dataZoom.length > 0) {
      currentZoomState = {
        xStart: option.dataZoom[0].start,
        xEnd: option.dataZoom[0].end,
        xStartValue: option.dataZoom[0].startValue,
        xEndValue: option.dataZoom[0].endValue,
        yStart: option.dataZoom[1]?.start || 0,
        yEnd: option.dataZoom[1]?.end || 100,
        yStartValue: option.dataZoom[1]?.startValue,
        yEndValue: option.dataZoom[1]?.endValue
      }
    }
  } catch (error) {
    // Игнорируем ошибки сохранения состояния
  }
}

// Инициализация графика
const initChart = () => {
  if (!chartContainer.value || !process.client) return
  
  try {
    const { $echarts } = useNuxtApp()
    chartInstance = $echarts.init(chartContainer.value, 'dark')
    
    // Слушаем события зума
    chartInstance.on('dataZoom', () => {
      saveZoomState()
    })
    
    // Слушаем события восстановления зума (двойной клик)
    chartInstance.on('restore', () => {
      currentZoomState = null
    })
    
    updateChart()
    
    // Обработка resize
    const resizeHandler = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }
    
    window.addEventListener('resize', resizeHandler)
    
    // Очистка при размонтировании
    onUnmounted(() => {
      window.removeEventListener('resize', resizeHandler)
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    })
    
  } catch (error) {
    console.error('Ошибка инициализации графика:', error)
  }
}

// Обновление графика с сохранением зума
const updateChart = () => {
  if (!chartInstance) return
  
  try {
    // Сохраняем текущее состояние зума перед обновлением
    saveZoomState()
    
    const options = createChartOptions()
    
    // Используем notMerge: false для сохранения состояния зума
    chartInstance.setOption(options, false)
  } catch (error) {
    console.error('Ошибка обновления графика:', error)
  }
}

// Watchers
watch(() => props.data, (newData, oldData) => {
  // Обновляем только если данные действительно изменились
  if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
    updateChart()
  }
}, { deep: true })

watch(() => props.type, () => {
  // При смене типа графика сбрасываем зум
  currentZoomState = null
  updateChart()
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
</script>

<style scoped>
.chart-container {
  background: transparent;
}
</style> 