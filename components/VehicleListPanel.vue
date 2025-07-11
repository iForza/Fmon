<template>
  <div class="vehicle-list-panel">
    <!-- Заголовок панели -->
    <div class="panel-header">
      <h2 class="panel-title">Панель управления</h2>
      <div class="panel-status">
        <div 
          class="status-indicator"
          :class="statusIndicatorClass"
        />
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Всего техники</div>
        <div class="stat-value">{{ vehicleManager.totalVehicles.value }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Активна</div>
        <div class="stat-value text-green-500">{{ vehicleManager.onlineVehicles.value.length }}</div>
      </div>
    </div>

    <!-- Заголовок списка -->
    <div class="list-header">
      <h3 class="list-title">Список техники</h3>
      <div class="list-counter">
        {{ vehicleManager.activeVehicles.value.length }} устройств
      </div>
    </div>

    <!-- Содержимое списка -->
    <div class="list-content">
      <!-- Активные устройства -->
      <div v-if="vehicleManager.activeVehicles.value.length > 0" class="active-vehicles">
        <VehicleCard
          v-for="vehicle in vehicleManager.activeVehicles.value"
          :key="vehicle.id"
          :vehicle="vehicle"
          :is-selected="vehicleManager.selectedVehicleId.value === vehicle.id"
          @select="handleVehicleSelect"
        />
      </div>

      <!-- Состояние "Нет устройств" -->
      <EmptyState
        v-else
        :recent-inactive="vehicleManager.inactiveVehicles.value"
      />
    </div>

    <!-- Информация о последнем обновлении -->
    <div class="update-info">
      <div class="update-text">
        <span class="update-label">Последнее обновление:</span>
        <span class="update-time">{{ lastUpdateTime }}</span>
      </div>
      <div class="update-frequency">
        Обновление каждые 2-15 сек
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useVehicleManager } from '~/composables/useVehicleManager'
import VehicleCard from './VehicleCard.vue'
import EmptyState from './EmptyState.vue'

// Инициализируем менеджер устройств
const vehicleManager = useVehicleManager()

// Время последнего обновления
const lastUpdateTime = ref<string>('Никогда')

// Обновляем время последнего обновления
const updateLastUpdateTime = () => {
  lastUpdateTime.value = new Date().toLocaleTimeString('ru-RU')
}

// Статус подключения
const statusText = computed(() => {
  const activeCount = vehicleManager.activeVehicles.value.length
  const onlineCount = vehicleManager.onlineVehicles.value.length
  
  if (activeCount === 0) {
    return 'Поиск устройств'
  } else if (onlineCount === activeCount) {
    return 'Все устройства онлайн'
  } else {
    return `${onlineCount} из ${activeCount} онлайн`
  }
})

const statusIndicatorClass = computed(() => {
  const onlineCount = vehicleManager.onlineVehicles.value.length
  const activeCount = vehicleManager.activeVehicles.value.length
  
  if (activeCount === 0) {
    return 'bg-yellow-500' // Поиск
  } else if (onlineCount === activeCount) {
    return 'bg-green-500' // Все онлайн
  } else if (onlineCount > 0) {
    return 'bg-blue-500' // Частично онлайн
  } else {
    return 'bg-red-500' // Нет подключения
  }
})

// Обработчик выбора устройства
const handleVehicleSelect = (vehicleId: string) => {
  vehicleManager.selectVehicle(vehicleId)
  updateLastUpdateTime()
}

// Инициализация при монтировании
onMounted(async () => {
  await vehicleManager.initialize()
  updateLastUpdateTime()
  
  // Обновляем время каждые 30 секунд
  setInterval(updateLastUpdateTime, 30000)
})

// Подписка на изменения для обновления времени
vehicleManager.activeVehicles.value.length // Триггер реактивности
</script>

<style scoped>
.vehicle-list-panel {
  @apply h-full flex flex-col bg-gray-800 border-r border-gray-700;
}

.panel-header {
  @apply p-4 border-b border-gray-700;
}

.panel-title {
  @apply text-lg font-semibold text-white mb-2;
}

.panel-status {
  @apply flex items-center space-x-2;
}

.status-indicator {
  @apply w-2 h-2 rounded-full;
}

.status-text {
  @apply text-sm text-gray-400;
}

.stats-grid {
  @apply grid grid-cols-2 gap-3 p-4 border-b border-gray-700;
}

.stat-card {
  @apply bg-gray-700 rounded-lg p-3;
}

.stat-label {
  @apply text-sm text-gray-400;
}

.stat-value {
  @apply text-xl font-bold text-white;
}

.list-header {
  @apply flex items-center justify-between p-4 border-b border-gray-700;
}

.list-title {
  @apply text-sm font-medium text-gray-400 uppercase tracking-wide;
}

.list-counter {
  @apply text-xs text-gray-500;
}

.list-content {
  @apply flex-1 overflow-y-auto p-4;
}

.active-vehicles {
  @apply space-y-3;
}

.update-info {
  @apply p-4 border-t border-gray-700 bg-gray-800;
}

.update-text {
  @apply flex items-center justify-between text-xs text-gray-500 mb-1;
}

.update-label {
  @apply text-gray-500;
}

.update-time {
  @apply text-gray-400;
}

.update-frequency {
  @apply text-xs text-gray-600 text-center;
}
</style>