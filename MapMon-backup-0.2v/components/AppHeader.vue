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

    <!-- Правая часть с настройками и пользователем -->
    <div class="flex items-center space-x-3">
      <!-- Индикатор подключения MQTT -->
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            mqttConnected ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="text-sm text-gray-300">
          {{ mqttConnected ? 'MQTT подключен' : 'MQTT отключен' }}
        </span>
      </div>

      <!-- Кнопка настроек -->
      <UButton
        variant="ghost"
        color="gray"
        icon="i-heroicons-cog-6-tooth"
        @click="openSettings"
      />

      <!-- Пользователь -->
      <UButton
        variant="ghost"
        color="gray"
        @click="showUserMenu"
      >
        <UIcon name="i-heroicons-user-circle" class="mr-2" />
        Пользователь
      </UButton>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

// Состояние активной вкладки
const activeTab = ref('dashboard')

// Состояние MQTT подключения
const mqttConnected = ref(false)

// Навигационные вкладки
const tabs = [
  { id: 'dashboard', label: 'Мониторинг', icon: 'i-heroicons-squares-2x2', path: '/' },
  { id: 'vehicles', label: 'Техника', icon: 'i-heroicons-truck', path: '/' },
  { id: 'analytics', label: 'Аналитика', icon: 'i-heroicons-chart-bar', path: '/analytics' },
  { id: 'history', label: 'История', icon: 'i-heroicons-clock', path: '/history' }
]

// Функции
const openSettings = () => {
  console.log('Открыть настройки')
  // TODO: Открыть модальное окно настроек
}

const showUserMenu = () => {
  console.log('Показать меню пользователя')
  // TODO: Показать меню пользователя
}

// Имитация изменения статуса MQTT
setTimeout(() => {
  mqttConnected.value = true
}, 3000)
</script> 