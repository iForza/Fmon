<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Навигация -->
    <AppHeader />
    
    <!-- Уведомления о новой технике -->
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <div
        v-for="vehicleId in []"
        :key="vehicleId"
        class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse"
      >
        <div class="w-2 h-2 bg-green-300 rounded-full"></div>
        <span class="font-medium">Подключена новая техника: {{ vehicleId }}</span>
      </div>
    </div>
    
    <!-- Основной контент -->
    <main class="flex h-[calc(100vh-4rem)]">
      <!-- Левая панель (30%) - Новая умная панель -->
      <div class="w-[30%]">
        <VehicleListPanel />
      </div>
      
      <!-- Правая панель с картой (70%) -->
      <div class="flex-1 relative">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useApi } from '~/composables/useApi'

// Установка темы приложения
useColorMode().value = 'dark'

// Глобальная инициализация API
const api = useApi()

// Инициализация при монтировании приложения
onMounted(async () => {
  console.log('🚀 Запуск MapMon - глобальная инициализация API')
  
  // Инициализируем API подключение
  await api.initialize()
  
  // Запускаем автоматическое обновление данных
  api.startPolling()
  
  console.log('✅ MapMon готов к работе')
})

// Очистка ресурсов при размонтировании
onUnmounted(() => {
  console.log('🧹 Очистка ресурсов app.vue')
  api.cleanup()
})

// Метаданные страницы
useHead({
  title: 'Fleet Monitor - Мониторинг техники',
  meta: [
    { name: 'description', content: 'Система мониторинга сельскохозяйственной техники с умным управлением устройствами' }
  ]
})
</script>

<style>
/* Глобальные стили для темной темы */
html {
  background-color: #111827;
  color: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style> 