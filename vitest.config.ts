import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    
    // Покрытие кода
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'esp32/',
        'server-backup/',
        'problem-fixes/',
        '.nuxt/',
        '.output/',
        'ecosystem.config.cjs'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Настройки моков
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    
    // Таймауты
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Изоляция тестов
    isolate: true,
    
    // Файлы тестов
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/component/**/*.test.ts'
    ],
    
    // Игнорируемые файлы
    exclude: [
      'node_modules',
      'tests/e2e/**/*',
      'tests/fixtures/**/*'
    ]
  },
  
  // Настройка алиасов для тестов
  resolve: {
    alias: {
      '~/': new URL('./', import.meta.url).pathname,
      '@/': new URL('./', import.meta.url).pathname,
    }
  },
  
  // Определение переменных среды для тестов
  define: {
    'process.env.NODE_ENV': '"test"',
    'import.meta.env.MODE': '"test"'
  }
}) 