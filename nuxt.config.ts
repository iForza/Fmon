export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui'
  ],

  // Настройки UI с темной темой по умолчанию
  ui: {
    global: true,
    icons: ['heroicons']
  },

  // Конфигурация приложения
  app: {
    head: {
      title: 'Fleet Monitor - Мониторинг техники',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  // Настройки цветовой схемы
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  // Совместимость
  compatibilityDate: '2025-06-14'
})