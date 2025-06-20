<template>
  <header class="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
    <!-- Логотип и название -->
    <div class="flex items-center space-x-3">
      <UIcon name="i-heroicons-truck" class="text-2xl text-green-500" />
      <h1 class="text-xl font-bold text-white">Fleet Monitor</h1>
    </div>

    <!-- Навигационные вкладки -->
    <nav class="flex items-center space-x-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="tab.path"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="[
          $route.path === tab.path 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        ]"
      >
        <UIcon :name="tab.icon" class="mr-2" />
        {{ tab.label }}
      </NuxtLink>
    </nav>

    <!-- Правая часть с настройками -->
    <div class="flex items-center space-x-3">
      <!-- Индикатор подключения API -->
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            apiConnected ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="text-sm text-gray-300">
          {{ apiConnected ? 'API подключен' : 'API отключен' }}
        </span>
      </div>

      <!-- Индикатор MQTT -->
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            mqttStatus === 'connected' ? 'bg-blue-500' : 
            mqttStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-500'
          ]"
        />
        <span class="text-sm text-gray-300">
          MQTT {{ getMqttStatusText() }}
        </span>
      </div>

      <!-- Кнопка настроек -->
      <UButton
        variant="ghost"
        color="gray"
        icon="i-heroicons-cog-6-tooth"
        @click="openSettings"
      />

      <!-- Кнопка пользователя -->
      <UButton
        variant="ghost"
        color="gray"
      >
        <UIcon name="i-heroicons-user" class="mr-2" />
        Пользователь
      </UButton>
    </div>

    <!-- Модальное окно настроек -->
    <SettingsModal v-model="isSettingsOpen" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useMqttSettings } from '~/composables/useMqttSettings'

// Получаем API данные
const api = useApi()

// Получаем MQTT настройки
const mqttSettings = useMqttSettings()

// Состояние модального окна настроек
const isSettingsOpen = ref(false)

// Состояние подключений
const apiConnected = computed(() => api.isConnected.value)
const mqttStatus = computed(() => mqttSettings.connectionStatus.value)

// Навигационные вкладки
const tabs = [
  { id: 'dashboard', label: 'Мониторинг', icon: 'i-heroicons-squares-2x2', path: '/' },
  { id: 'analytics', label: 'Аналитика', icon: 'i-heroicons-chart-bar', path: '/analytics' },
  { id: 'history', label: 'История', icon: 'i-heroicons-clock', path: '/history' }
]

// Функции
const openSettings = () => {
  isSettingsOpen.value = true
}

const getMqttStatusText = () => {
  switch (mqttStatus.value) {
    case 'connected': return 'подключен'
    case 'connecting': return 'подключение...'
    case 'disconnected': return 'отключен'
    case 'error': return 'ошибка'
    default: return 'неизвестно'
  }
}

// Инициализация при монтировании
onMounted(() => {
  mqttSettings.initialize()
})
</script> 