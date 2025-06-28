import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Директория с E2E тестами
  testDir: './tests/e2e',
  
  // Параллельное выполнение тестов
  fullyParallel: true,
  
  // Запрет на .only в CI
  forbidOnly: !!process.env.CI,
  
  // Повторы при ошибках
  retries: process.env.CI ? 2 : 0,
  
  // Количество воркеров
  workers: process.env.CI ? 1 : undefined,
  
  // Репортеры
  reporter: [
    ['html'],
    ['line'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Глобальные настройки
  use: {
    // URL приложения
    baseURL: 'http://localhost:3000',
    
    // Трейсинг при первом повторе
    trace: 'on-first-retry',
    
    // Скриншоты только при ошибках
    screenshot: 'only-on-failure',
    
    // Видео при ошибках
    video: 'retain-on-failure',
    
    // Таймаут для действий
    actionTimeout: 10000,
    
    // Таймаут для ожиданий
    expect: {
      timeout: 5000
    }
  },

  // Проекты (браузеры)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Мобильные устройства
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Запуск Nuxt сервера для тестов
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe'
  },
  
  // Директории для артефактов
  outputDir: 'playwright-report/test-results'
}) 