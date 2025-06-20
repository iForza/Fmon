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
      yMax: 100,
      unit: '°C',
      formatValue: (value) => `${value.toFixed(1)}°C`
    },
    battery: {
      color: '#10B981',
      yMax: 100, 
      unit: '%',
      formatValue: (value) => `${value.toFixed(1)}%`
    },
    rpm: {
      color: '#8B5CF6',
      yMax: 3000,
      unit: 'RPM', 
      formatValue: (value) => `${Math.round(value)} RPM`
    }
  }
  
  return configs[props.type] || configs.speed
}

// Создание опций графика
const createChartOptions = () => {
  const config = getChartConfig()
  
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
      min: 0,
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
        start: 0,
        end: 100,
        zoomOnMouseWheel: 'ctrl'
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

// Инициализация графика
const initChart = () => {
  if (!chartContainer.value || !process.client) return
  
  try {
    const { $echarts } = useNuxtApp()
    chartInstance = $echarts.init(chartContainer.value, 'dark')
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

// Обновление графика
const updateChart = () => {
  if (!chartInstance) return
  
  try {
    const options = createChartOptions()
    chartInstance.setOption(options, true)
  } catch (error) {
    console.error('Ошибка обновления графика:', error)
  }
}

// Watchers
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

watch(() => props.type, () => {
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