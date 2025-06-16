<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Основной контент -->
    <main class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок страницы -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">🕒 История</h1>
          <p class="text-gray-400">Исторические данные и отчеты</p>
        </div>

        <!-- Заглушка -->
        <div class="bg-gray-800 rounded-lg p-12 text-center">
          <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-heroicons-clock" class="text-4xl text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-white mb-4">Страница в разработке</h3>
          <p class="text-gray-400 mb-6">
            Функционал истории будет доступен в следующих версиях MapMon.
            <br />
            Здесь будут отображаться исторические данные, отчеты и аналитика за прошлые периоды.
          </p>
          <div class="text-sm text-gray-500">
            Планируется в версии 0.5v
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Установка темы приложения
useColorMode().value = 'dark'
</script> 