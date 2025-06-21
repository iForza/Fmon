export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@nuxt/icon'
  ],

  // Настройки UI с темной темой по умолчанию
  ui: {
    global: true
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

  // Настройки иконок
  icon: {
    serverBundle: {
      collections: ['heroicons', 'mdi', 'tabler']
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256
    }
  },

  // Прокси для API запросов
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001/api',
        changeOrigin: true,
        prependPath: true
      }
    }
  },

  // Совместимость
  compatibilityDate: '2025-06-14'
})