<template>
  <div class="empty-state">
    <!-- Основное состояние -->
    <div class="empty-content">
      <div class="empty-icon">
        <div class="icon-animation">📡</div>
      </div>
      
      <h3 class="empty-title">Нет подключенных устройств</h3>
      <p class="empty-description">
        Ожидание подключения ESP32 модулей...
      </p>
      
      <!-- Индикатор поиска -->
      <div class="search-indicator">
        <div class="search-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="search-text">Поиск устройств</span>
      </div>
    </div>
    
    <!-- Недавно отключенные устройства -->
    <div v-if="recentInactive.length > 0" class="recent-devices">
      <h4 class="recent-title">Недавно отключенные:</h4>
      <div class="recent-list">
        <div 
          v-for="device in recentInactive" 
          :key="device.id"
          class="recent-item"
        >
          <div class="recent-info">
            <span class="recent-name">{{ device.name }}</span>
            <span class="recent-id">{{ device.id }}</span>
          </div>
          <div class="recent-time">
            <span class="time-label">Отключено:</span>
            <span class="time-value">{{ getRelativeTime(device.lastUpdate) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Подсказки -->
    <div class="hints">
      <div class="hint-item">
        <span class="hint-icon">💡</span>
        <span class="hint-text">Убедитесь, что ESP32 модули включены</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">🔗</span>
        <span class="hint-text">Проверьте подключение к Wi-Fi</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">📶</span>
        <span class="hint-text">Устройства подключаются к MQTT автоматически</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ManagedVehicle } from '~/composables/useVehicleManager'

interface Props {
  recentInactive?: ManagedVehicle[]
}

const props = withDefaults(defineProps<Props>(), {
  recentInactive: () => []
})

// Используем утилиты времени
const { getRelativeTime } = useTime()

// Ограничиваем количество показываемых недавних устройств
const recentInactive = computed(() => {
  return props.recentInactive.slice(0, 3) // Показываем только последние 3
})
</script>

<style scoped>
.empty-state {
  @apply flex flex-col items-center justify-center min-h-full p-6 text-center;
}

.empty-content {
  @apply mb-8;
}

.empty-icon {
  @apply mb-4;
}

.icon-animation {
  @apply text-4xl;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.empty-title {
  @apply text-lg font-medium text-white mb-2;
}

.empty-description {
  @apply text-sm text-gray-400 mb-4;
}

.search-indicator {
  @apply flex items-center justify-center space-x-2 text-gray-500;
}

.search-dots {
  @apply flex space-x-1;
}

.dot {
  @apply w-1 h-1 bg-gray-500 rounded-full;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.search-text {
  @apply text-xs text-gray-500;
}

.recent-devices {
  @apply w-full max-w-sm mb-6;
}

.recent-title {
  @apply text-sm font-medium text-gray-400 mb-3 text-left;
}

.recent-list {
  @apply space-y-2;
}

.recent-item {
  @apply bg-gray-700 rounded-lg p-3 text-left;
}

.recent-info {
  @apply flex items-center justify-between mb-1;
}

.recent-name {
  @apply text-sm text-white font-medium;
}

.recent-id {
  @apply text-xs text-gray-400;
}

.recent-time {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.time-label {
  @apply text-gray-500;
}

.time-value {
  @apply text-gray-400;
}

.hints {
  @apply w-full max-w-sm space-y-2;
}

.hint-item {
  @apply flex items-center space-x-2 text-xs text-gray-500;
}

.hint-icon {
  @apply text-sm;
}

.hint-text {
  @apply text-left;
}
</style>