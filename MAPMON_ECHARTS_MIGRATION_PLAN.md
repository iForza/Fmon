# 🚀 **ПЛАН МИГРАЦИИ MAPMON НА ECHARTS С СЕРВЕРНЫМ РЕНДЕРИНГОМ**

## 📋 **ОБЗОР РЕШЕНИЯ**

### **Архитектура:**
```ESP32 → MQTT → Nuxt Server → SQLite Database → ECharts SSR → SVG/PNG → Browser
```

### **Ключевые преимущества:**
- 🔥 **Графики строятся на сервере** - нет нагрузки на браузер
- 💾 **Персистентное хранение** - данные сохраняются в SQLite
- ⚡ **Быстрая загрузка** - готовые SVG графики
- 📊 **Полные временные диапазоны** - включая пустые периоды
- 🔄 **Легкий клиентский runtime** - только для интерактивности

## 🔧 **ЭТАП 1: НАСТРОЙКА БАЗЫ ДАННЫХ**

### **1.1 Установка SQLite**
```bash
cd /var/www/mapmon
npm install sqlite3 better-sqlite3
```

### **1.2 Создание схемы базы данных**
```sql
-- database/schema.sql
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    speed REAL DEFAULT 0,
    battery INTEGER DEFAULT NULL,
    fuel INTEGER DEFAULT NULL,
    status TEXT DEFAULT 'unknown',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE INDEX idx_telemetry_vehicle_time ON telemetry(vehicle_id, timestamp);
CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp);
```

### **1.3 Инициализация базы данных**
```javascript
// server/database.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = new Database('mapmon.db');
    this.initializeSchema();
  }

  initializeSchema() {
    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    this.db.exec(schema);
  }

  // Сохранение данных телеметрии
  saveTelemetry(vehicleId, data) {
    const stmt = this.db.prepare(`
      INSERT INTO telemetry (vehicle_id, timestamp, lat, lng, speed, battery, fuel, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      vehicleId,
      new Date().toISOString(),
      data.lat,
      data.lng,
      data.speed || 0,
      data.battery || null,
      data.fuel || null,
      data.status || 'active'
    );
  }

  // Получение исторических данных
  getTelemetryHistory(vehicleId, hours = 24) {
    const stmt = this.db.prepare(`
      SELECT * FROM telemetry 
      WHERE vehicle_id = ? 
      AND timestamp >= datetime('now', '-${hours} hours')
      ORDER BY timestamp ASC
    `);
    
    return stmt.all(vehicleId);
  }

  // Получение данных за временной диапазон
  getTelemetryRange(vehicleId, startTime, endTime) {
    const stmt = this.db.prepare(`
      SELECT * FROM telemetry 
      WHERE vehicle_id = ? 
      AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `);
    
    return stmt.all(vehicleId, startTime, endTime);
  }

  // Заполнение пропусков данных
  fillDataGaps(data, startTime, endTime, intervalMinutes = 5) {
    const result = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    const interval = intervalMinutes * 60 * 1000;

    let currentTime = start;
    let dataIndex = 0;

    while (currentTime <= end) {
      const timeStr = currentTime.toISOString();
      
      // Ищем ближайшую точку данных
      let closestData = null;
      if (dataIndex < data.length) {
        const dataTime = new Date(data[dataIndex].timestamp);
        if (Math.abs(dataTime - currentTime) <= interval / 2) {
          closestData = data[dataIndex];
          dataIndex++;
        }
      }

      result.push({
        timestamp: timeStr,
        lat: closestData?.lat || null,
        lng: closestData?.lng || null,
        speed: closestData?.speed || 0,
        battery: closestData?.battery || null,
        fuel: closestData?.fuel || null,
        status: closestData?.status || 'no_data'
      });

      currentTime = new Date(currentTime.getTime() + interval);
    }

    return result;
  }
}

module.exports = DatabaseManager;
```

## 🔧 **ЭТАП 2: УСТАНОВКА ECHARTS SSR**

### **2.1 Установка зависимостей**
```bash
npm install echarts canvas
```

### **2.2 Создание ECharts генератора**
```javascript
// server/chartGenerator.js
const echarts = require('echarts');
const { createCanvas } = require('canvas');

class ChartGenerator {
  constructor() {
    // Настройка Canvas для ECharts
    echarts.setPlatformAPI({
      createCanvas() {
        return createCanvas();
      }
    });
  }

  // Генерация графика скорости
  generateSpeedChart(data, timeRange, width = 800, height = 400) {
    const canvas = createCanvas(width, height);
    const chart = echarts.init(canvas, null, {
      renderer: 'svg',
      ssr: true,
      width,
      height
    });

    const option = {
      title: {
        text: `Скорость за ${timeRange}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const point = params[0];
          const time = new Date(point.axisValue).toLocaleString('ru-RU');
          return `${time}<br/>Скорость: ${point.value} км/ч`;
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          formatter: function(value) {
            return new Date(value).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Скорость (км/ч)',
        min: 0
      },
      series: [{
        name: 'Скорость',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: '#1890ff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ]
          }
        },
        data: data.map(item => [
          new Date(item.timestamp).getTime(),
          item.speed
        ])
      }]
    };

    chart.setOption(option);
    const svgString = chart.renderToSVGString();
    chart.dispose();

    return svgString;
  }

  // Генерация графика батареи
  generateBatteryChart(data, timeRange, width = 800, height = 400) {
    const canvas = createCanvas(width, height);
    const chart = echarts.init(canvas, null, {
      renderer: 'svg',
      ssr: true,
      width,
      height
    });

    const option = {
      title: {
        text: `Заряд батареи за ${timeRange}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const point = params[0];
          const time = new Date(point.axisValue).toLocaleString('ru-RU');
          return `${time}<br/>Батарея: ${point.value}%`;
        }
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: 'Заряд (%)',
        min: 0,
        max: 100
      },
      series: [{
        name: 'Батарея',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#52c41a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ]
          }
        },
        data: data.map(item => [
          new Date(item.timestamp).getTime(),
          item.battery || 0
        ])
      }]
    };

    chart.setOption(option);
    const svgString = chart.renderToSVGString();
    chart.dispose();

    return svgString;
  }

  // Генерация комбинированного графика
  generateCombinedChart(data, timeRange, width = 800, height = 500) {
    const canvas = createCanvas(width, height);
    const chart = echarts.init(canvas, null, {
      renderer: 'svg',
      ssr: true,
      width,
      height
    });

    const option = {
      title: {
        text: `Телеметрия за ${timeRange}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['Скорость', 'Батарея'],
        top: 30
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: [
        {
          type: 'value',
          name: 'Скорость (км/ч)',
          position: 'left',
          min: 0
        },
        {
          type: 'value',
          name: 'Батарея (%)',
          position: 'right',
          min: 0,
          max: 100
        }
      ],
      series: [
        {
          name: 'Скорость',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          lineStyle: { color: '#1890ff' },
          data: data.map(item => [
            new Date(item.timestamp).getTime(),
            item.speed
          ])
        },
        {
          name: 'Батарея',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { color: '#52c41a' },
          data: data.map(item => [
            new Date(item.timestamp).getTime(),
            item.battery || 0
          ])
        }
      ]
    };

    chart.setOption(option);
    const svgString = chart.renderToSVGString();
    chart.dispose();

    return svgString;
  }
}

module.exports = ChartGenerator;
```

## 🔧 **ЭТАП 3: ОБНОВЛЕНИЕ СЕРВЕРНОЙ ЧАСТИ**

### **3.1 Модификация server/index.ts**
```typescript
// server/index.ts (дополнения)
import DatabaseManager from './database.js'
import ChartGenerator from './chartGenerator.js'

const dbManager = new DatabaseManager()
const chartGenerator = new ChartGenerator()

// API для получения графиков
fastify.get<{
  Params: { vehicleId: string },
  Querystring: { 
    timeRange?: string,
    chartType?: string,
    width?: number,
    height?: number
  }
}>('/api/charts/:vehicleId', async (request, reply) => {
  const { vehicleId } = request.params
  const { 
    timeRange = '24h', 
    chartType = 'speed',
    width = 800,
    height = 400
  } = request.query

  try {
    // Парсинг временного диапазона
    const hours = parseTimeRange(timeRange)
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)

    // Получение данных из БД
    const rawData = dbManager.getTelemetryRange(
      vehicleId,
      startTime.toISOString(),
      endTime.toISOString()
    )

    // Заполнение пропусков данных
    const filledData = dbManager.fillDataGaps(
      rawData,
      startTime.toISOString(),
      endTime.toISOString()
    )

    // Генерация графика
    let svgChart
    switch (chartType) {
      case 'speed':
        svgChart = chartGenerator.generateSpeedChart(filledData, timeRange, width, height)
        break
      case 'battery':
        svgChart = chartGenerator.generateBatteryChart(filledData, timeRange, width, height)
        break
      case 'combined':
        svgChart = chartGenerator.generateCombinedChart(filledData, timeRange, width, height)
        break
      default:
        svgChart = chartGenerator.generateSpeedChart(filledData, timeRange, width, height)
    }

    reply.type('image/svg+xml')
    return svgChart

  } catch (error) {
    reply.status(500)
    return { error: 'Ошибка генерации графика', details: error.message }
  }
})

// Функция парсинга временного диапазона
function parseTimeRange(timeRange: string): number {
  const match = timeRange.match(/^(\d+)([hmd])$/)
  if (!match) return 24 // По умолчанию 24 часа

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 'm': return value / 60 // минуты в часы
    case 'h': return value      // часы
    case 'd': return value * 24 // дни в часы
    default: return 24
  }
}

// Обновление обработчика MQTT данных
function processVehicleData(topic: string, payload: string) {
  try {
    const data = JSON.parse(payload)
    
    // Сохранение в базу данных
    dbManager.saveTelemetry(data.id || 'unknown', data)
    
    // Обновление кеша в памяти (для real-time отображения)
    const existingVehicle = vehicles.get(data.id)
    const updatedVehicle: VehicleData = {
      id: data.id,
      name: existingVehicle?.name || `Техника ${data.id}`,
      lat: data.lat,
      lng: data.lng,
      speed: data.speed || 0,
      status: data.speed > 0 ? 'active' : 'stopped',
      lastUpdate: new Date(),
      battery: data.battery,
      fuel: data.fuel
    }
    
    vehicles.set(data.id, updatedVehicle)
    
    // Отправка обновления клиентам
    broadcastToClients({
      type: 'vehicle_update',
      data: updatedVehicle
    })

  } catch (error) {
    console.error('Ошибка обработки MQTT данных:', error)
  }
}
```

## 🔧 **ЭТАП 4: ОБНОВЛЕНИЕ КЛИЕНТСКОЙ ЧАСТИ**

### **4.1 Модификация pages/analytics.vue**
```vue
<!-- pages/analytics.vue -->
<template>
  <div class="analytics-container">
    <div class="controls">
      <USelect
        v-model="selectedVehicle"
        :options="vehicleOptions"
        placeholder="Выберите технику"
        @change="updateCharts"
      />
      
      <USelect
        v-model="timeRange"
        :options="timeRangeOptions"
        @change="updateCharts"
      />
      
      <USelect
        v-model="chartType"
        :options="chartTypeOptions"
        @change="updateCharts"
      />
    </div>

    <div class="charts-container">
      <!-- Серверный график -->
      <div class="chart-wrapper">
        <div class="chart-header">
          <h3>{{ chartTitle }}</h3>
          <UButton
            icon="i-heroicons-arrow-path"
            size="sm"
            @click="refreshChart"
            :loading="loading"
          >
            Обновить
          </UButton>
        </div>
        
        <div 
          class="chart-content"
          :class="{ 'loading': loading }"
        >
          <div 
            v-if="chartSvg" 
            v-html="chartSvg"
            class="server-chart"
          />
          <div v-else-if="loading" class="loading-placeholder">
            <USkeleton class="h-96 w-full" />
          </div>
          <div v-else class="no-data">
            <UIcon name="i-heroicons-chart-bar" class="text-4xl text-gray-400" />
            <p>Нет данных для отображения</p>
          </div>
        </div>
      </div>

      <!-- Интерактивный график (опционально) -->
      <div v-if="showInteractive" class="chart-wrapper">
        <div class="chart-header">
          <h3>Интерактивный график</h3>
          <UToggle 
            v-model="showInteractive" 
            label="Показать интерактивный"
          />
        </div>
        
        <div class="chart-content">
          <!-- Здесь может быть легкий клиентский график для интерактивности -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Vehicle {
  id: string
  name: string
}

// Реактивные данные
const selectedVehicle = ref<string>('')
const timeRange = ref<string>('24h')
const chartType = ref<string>('speed')
const chartSvg = ref<string>('')
const loading = ref<boolean>(false)
const showInteractive = ref<boolean>(false)

// Опции для селектов
const timeRangeOptions = [
  { label: '1 час', value: '1h' },
  { label: '6 часов', value: '6h' },
  { label: '12 часов', value: '12h' },
  { label: '24 часа', value: '24h' },
  { label: '3 дня', value: '3d' },
  { label: '7 дней', value: '7d' }
]

const chartTypeOptions = [
  { label: 'Скорость', value: 'speed' },
  { label: 'Батарея', value: 'battery' },
  { label: 'Комбинированный', value: 'combined' }
]

// Получение списка техники
const { vehicles } = useMqtt()
const vehicleOptions = computed(() => 
  Array.from(vehicles.value.values()).map(v => ({
    label: v.name,
    value: v.id
  }))
)

// Заголовок графика
const chartTitle = computed(() => {
  const typeLabels = {
    speed: 'Скорость',
    battery: 'Заряд батареи',
    combined: 'Телеметрия'
  }
  const rangeLabels = {
    '1h': '1 час',
    '6h': '6 часов',
    '12h': '12 часов',
    '24h': '24 часа',
    '3d': '3 дня',
    '7d': '7 дней'
  }
  
  return `${typeLabels[chartType.value]} за ${rangeLabels[timeRange.value]}`
})

// Загрузка графика с сервера
async function loadChart() {
  if (!selectedVehicle.value) return

  loading.value = true
  try {
    const response = await $fetch(`/api/charts/${selectedVehicle.value}`, {
      query: {
        timeRange: timeRange.value,
        chartType: chartType.value,
        width: 800,
        height: 400
      },
      responseType: 'text'
    })
    
    chartSvg.value = response
  } catch (error) {
    console.error('Ошибка загрузки графика:', error)
    chartSvg.value = ''
  } finally {
    loading.value = false
  }
}

// Обновление графиков
async function updateCharts() {
  await loadChart()
}

// Обновление графика
async function refreshChart() {
  await loadChart()
}

// Инициализация
onMounted(() => {
  // Выбираем первую технику по умолчанию
  if (vehicleOptions.value.length > 0) {
    selectedVehicle.value = vehicleOptions.value[0].value
    loadChart()
  }
})

// Отслеживание изменений техники
watch(() => vehicles.value.size, () => {
  if (!selectedVehicle.value && vehicleOptions.value.length > 0) {
    selectedVehicle.value = vehicleOptions.value[0].value
    loadChart()
  }
})

// Автообновление каждые 30 секунд
let autoRefreshInterval: NodeJS.Timeout
onMounted(() => {
  autoRefreshInterval = setInterval(() => {
    if (selectedVehicle.value && !loading.value) {
      loadChart()
    }
  }, 30000)
})

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})
</script>

<style scoped>
.analytics-container {
  @apply p-6 space-y-6;
}

.controls {
  @apply flex gap-4 items-center flex-wrap;
}

.charts-container {
  @apply space-y-6;
}

.chart-wrapper {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
}

.chart-header {
  @apply flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50;
}

.chart-header h3 {
  @apply text-lg font-semibold text-gray-900;
}

.chart-content {
  @apply p-4;
  min-height: 400px;
}

.chart-content.loading {
  @apply opacity-50;
}

.server-chart {
  @apply w-full;
}

.server-chart :deep(svg) {
  @apply w-full h-auto;
}

.loading-placeholder {
  @apply flex justify-center items-center h-96;
}

.no-data {
  @apply flex flex-col items-center justify-center h-96 text-gray-500;
}

.no-data p {
  @apply mt-2 text-sm;
}
</style>
```

## 🔧 **ЭТАП 5: РАЗВЕРТЫВАНИЕ**

### **5.1 Обновление package.json**
```json
{
  "dependencies": {
    "echarts": "^5.4.3",
    "canvas": "^2.11.2",
    "sqlite3": "^5.1.6",
    "better-sqlite3": "^8.7.0"
  }
}
```

### **5.2 Команды развертывания**
```bash
# На VPS
cd /var/www/mapmon

# Установка новых зависимостей
npm install

# Создание директории для базы данных
mkdir -p database

# Пересборка проекта
npm run build

# Перезапуск PM2
pm2 restart mapmon

# Проверка логов
pm2 logs mapmon
```

## 📊 **РЕЗУЛЬТАТ**

### **Что получим:**
1. ✅ **Графики строятся на сервере** - нет нагрузки на браузер
2. ✅ **Данные сохраняются в SQLite** - персистентность
3. ✅ **Полные временные диапазоны** - включая пустые периоды
4. ✅ **Быстрая загрузка** - готовые SVG графики
5. ✅ **Автообновление** - каждые 30 секунд
6. ✅ **Гибкие временные диапазоны** - от 1 часа до 7 дней
7. ✅ **Различные типы графиков** - скорость, батарея, комбинированный

### **Производительность:**
- **Сервер:** Генерация графика ~50-100ms
- **Клиент:** Загрузка SVG ~10-20ms
- **База данных:** Запрос данных ~5-10ms
- **Общее время:** < 200ms для полного обновления

## 🎯 **СЛЕДУЮЩИЕ ШАГИ**

1. **Сначала протестировать локально**
2. **Создать резервную копию текущей системы**
3. **Поэтапное внедрение** (сначала база данных, потом графики)
4. **Мониторинг производительности**
5. **Добавление кеширования** для часто запрашиваемых графиков

Хотите начать с реализации? Я могу помочь с любым из этапов! 