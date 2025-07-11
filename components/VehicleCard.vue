<template>
  <div 
    class="vehicle-card"
    :class="cardClasses"
    @click="$emit('select', vehicle.id)"
  >
    <!-- Заголовок устройства -->
    <div class="vehicle-header">
      <div class="vehicle-name">
        <h3 class="text-white font-medium">{{ vehicle.name }}</h3>
        <span class="vehicle-id">{{ vehicle.id }}</span>
      </div>
      
      <!-- Индикаторы состояния -->
      <div class="indicators">
        <!-- Индикатор подключения -->
        <div 
          class="indicator connection-indicator"
          :class="connectionIndicatorClass"
          :title="connectionStatus"
        />
        
        <!-- Индикатор активности -->
        <div 
          class="indicator activity-indicator"
          :class="activityIndicatorClass"
          :title="activityStatus"
        />
      </div>
    </div>
    
    <!-- Метрики устройства -->
    <div class="metrics-grid">
      <div class="metric-item">
        <div class="metric-icon">🚗</div>
        <div class="metric-content">
          <div class="metric-label">Скорость</div>
          <div class="metric-value" :class="speedClass">
            {{ vehicle.speed || 0 }} <span class="unit">км/ч</span>
          </div>
        </div>
      </div>
      
      <div class="metric-item">
        <div class="metric-icon">🔋</div>
        <div class="metric-content">
          <div class="metric-label">Батарея</div>
          <div class="metric-value" :class="batteryClass">
            {{ vehicle.battery ? vehicle.battery.toFixed(1) : 'N/A' }}
            <span class="unit" v-if="vehicle.battery">%</span>
          </div>
        </div>
      </div>
      
      <div class="metric-item">
        <div class="metric-icon">🌡️</div>
        <div class="metric-content">
          <div class="metric-label">Температура</div>
          <div class="metric-value" :class="temperatureClass">
            {{ vehicle.temperature ? vehicle.temperature.toFixed(1) : 'N/A' }}
            <span class="unit" v-if="vehicle.temperature">°C</span>
          </div>
        </div>
      </div>
      
      <div class="metric-item">
        <div class="metric-icon">⚙️</div>
        <div class="metric-content">
          <div class="metric-label">Обороты</div>
          <div class="metric-value">
            {{ vehicle.rpm || 'N/A' }}
            <span class="unit" v-if="vehicle.rpm">RPM</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Временная информация -->
    <div class="time-info">
      <span class="relative-time">{{ getRelativeTime(vehicle.lastUpdate) }}</span>
      <span class="absolute-time">{{ formatTime(vehicle.lastUpdate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VehicleStatus, type ManagedVehicle } from '~/composables/useVehicleManager'

interface Props {
  vehicle: ManagedVehicle
  isSelected?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  select: [vehicleId: string]
}>()

// Используем утилиты времени
const { formatTime, getRelativeTime } = useTime()

// Классы для карточки
const cardClasses = computed(() => [
  'cursor-pointer transition-all duration-200',
  props.isSelected ? 'ring-2 ring-blue-500 bg-gray-600' : 'hover:bg-gray-600',
  {
    'border-green-500': props.vehicle.status === VehicleStatus.ONLINE,
    'border-yellow-500': props.vehicle.status === VehicleStatus.IDLE,
    'border-red-500': props.vehicle.status === VehicleStatus.DISCONNECTED,
    'border-gray-500': props.vehicle.status === VehicleStatus.ERROR
  }
])

// Статусы для индикаторов
const connectionStatus = computed(() => {
  switch (props.vehicle.status) {
    case VehicleStatus.ONLINE:
      return 'Онлайн'
    case VehicleStatus.IDLE:
      return 'Ожидание'
    case VehicleStatus.DISCONNECTED:
      return 'Отключено'
    case VehicleStatus.ERROR:
      return 'Ошибка'
    default:
      return 'Неизвестно'
  }
})

const activityStatus = computed(() => {
  return props.vehicle.isActive ? 'Активно' : 'Остановлено'
})

// Классы для индикаторов
const connectionIndicatorClass = computed(() => {
  switch (props.vehicle.status) {
    case VehicleStatus.ONLINE:
      return 'bg-green-500'
    case VehicleStatus.IDLE:
      return 'bg-yellow-500'
    case VehicleStatus.DISCONNECTED:
      return 'bg-red-500'
    case VehicleStatus.ERROR:
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
})

const activityIndicatorClass = computed(() => {
  return props.vehicle.isActive ? 'bg-blue-500' : 'bg-gray-500'
})

// Классы для метрик
const speedClass = computed(() => {
  const speed = props.vehicle.speed || 0
  if (speed > 20) return 'text-green-400'
  if (speed > 5) return 'text-yellow-400'
  return 'text-gray-400'
})

const batteryClass = computed(() => {
  const battery = props.vehicle.battery || 0
  if (battery > 60) return 'text-green-400'
  if (battery > 30) return 'text-yellow-400'
  if (battery > 0) return 'text-red-400'
  return 'text-gray-400'
})

const temperatureClass = computed(() => {
  const temp = props.vehicle.temperature || 0
  if (temp > 80) return 'text-red-400'
  if (temp > 60) return 'text-yellow-400'
  if (temp > 0) return 'text-green-400'
  return 'text-gray-400'
})
</script>

<style scoped>
.vehicle-card {
  @apply bg-gray-700 rounded-lg p-4 border-l-4 border-gray-500;
}

.vehicle-header {
  @apply flex items-center justify-between mb-3;
}

.vehicle-name h3 {
  @apply text-sm font-medium;
}

.vehicle-id {
  @apply text-xs text-gray-400;
}

.indicators {
  @apply flex items-center space-x-2;
}

.indicator {
  @apply w-2 h-2 rounded-full;
}

.metrics-grid {
  @apply grid grid-cols-2 gap-2 mb-3;
}

.metric-item {
  @apply bg-gray-600 rounded-md p-2 flex items-center space-x-2;
}

.metric-icon {
  @apply text-sm;
}

.metric-content {
  @apply flex-1 min-w-0;
}

.metric-label {
  @apply text-xs text-gray-400;
}

.metric-value {
  @apply text-sm font-medium text-white;
}

.unit {
  @apply text-xs text-gray-400;
}

.time-info {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.relative-time {
  @apply text-gray-400;
}

.absolute-time {
  @apply text-gray-500;
}
</style>