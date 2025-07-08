# 🧪 СТРАТЕГИЯ ТЕСТИРОВАНИЯ MapMon v0.5

## 🎯 ЦЕЛЬ СТРАТЕГИИ
Создать надежную систему тестирования для безопасного решения всех 10 выявленных проблем в проекте MapMon v0.5. Каждое исправление должно сопровождаться автоматическими тестами для предотвращения регрессий.

## 📋 АРХИТЕКТУРА ТЕСТИРОВАНИЯ

### 🏗️ Пирамида тестирования MapMon

```
        🌐 E2E Tests (Playwright)
       /                       \
      /    🔗 Integration Tests   \
     /                             \
    📦 Component Tests (Vue Test Utils)
   /                                   \
  ⚙️ Unit Tests (Vitest + Nuxt Test Utils)
```

**Уровни тестирования:**
- **Unit тесты (70%)** - Функции, композаблы, утилиты
- **Component тесты (20%)** - Vue компоненты изолированно  
- **Integration тесты (8%)** - API, MQTT, база данных
- **E2E тесты (2%)** - Критические пользовательские сценарии

## 🛠️ ИНСТРУМЕНТЫ И НАСТРОЙКА

### 1. Vitest + @nuxt/test-utils (Unit тесты)
```bash
yarn add -D @nuxt/test-utils vitest @vue/test-utils happy-dom
```

### 2. Playwright (E2E тесты)
```bash
yarn add -D @playwright/test
```

### 3. MSW (Mock Service Worker)
```bash
yarn add -D msw
```

## ⚙️ КОНФИГУРАЦИЯ ТЕСТОВОЙ СРЕДЫ

### vitest.config.ts
```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'esp32/',
        'server-backup/',
        'problem-fixes/'
      ]
    },
    // Моки для тестирования
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true
  },
  // Настройка для работы с SQLite в тестах
  resolve: {
    alias: {
      '~/': new URL('./', import.meta.url).pathname,
    }
  }
})
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['line'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ],

  // Запуск Nuxt сервера для тестов
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

## 📁 СТРУКТУРА ТЕСТОВ

```
tests/
├── setup.ts                     # Глобальная настройка тестов
├── utils/                       # Утилиты для тестов
│   ├── test-helpers.ts          # Вспомогательные функции
│   ├── mock-factories.ts        # Фабрики для создания мок данных
│   └── mqtt-mock.ts            # MQTT мок сервер
├── unit/                       # Unit тесты
│   ├── composables/            # Тесты композаблов
│   ├── utils/                  # Тесты утилит
│   └── server/                 # Тесты серверной логики
├── component/                  # Component тесты
│   ├── AdminPanel.test.ts      
│   ├── MapComponent.test.ts    
│   ├── ChartComponent.test.ts  
│   └── SettingsModal.test.ts   
├── integration/                # Integration тесты
│   ├── api/                    # Тесты API endpoints
│   ├── mqtt/                   # Тесты MQTT интеграции
│   └── database/              # Тесты работы с БД
├── e2e/                       # E2E тесты
│   ├── critical-flows/        # Критические пользовательские сценарии
│   ├── problem-fixes/         # Тесты для каждой решаемой проблемы
│   └── smoke/                 # Smoke тесты
└── fixtures/                  # Тестовые данные
    ├── mqtt-messages.json     
    ├── vehicle-data.json      
    └── api-responses.json     
```

## 🧪 ПЛАН ТЕСТИРОВАНИЯ ПО ПРОБЛЕМАМ

### 🔥 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

#### ✅ Проблема #01: MQTT Architecture Incompatible
**Тесты:**
```typescript
// tests/integration/mqtt/architecture-compatibility.test.ts
describe('MQTT Architecture Compatibility', () => {
  test('ESP32 TCP MQTT messages reach WebSocket clients', async () => {
    // Мок TCP MQTT сервера
    const tcpMqttServer = await createMockTcpMqttServer()
    
    // Мок WebSocket MQTT клиента
    const wsClient = await createMockWebSocketClient()
    
    // Отправка сообщения от ESP32
    tcpMqttServer.publish('vehicles/test/telemetry', testPayload)
    
    // Проверка получения в WebSocket
    await expect(wsClient).toReceiveMessage(testPayload)
  })

  test('MQTT bridge preserves message integrity', async () => {
    const originalMessage = createVehicleTelemettryMessage()
    const bridgedMessage = await mqttBridge.process(originalMessage)
    
    expect(bridgedMessage.data).toEqual(originalMessage.data)
    expect(bridgedMessage.timestamp).toBeDefined()
  })
})
```

#### ✅ Проблема #03: Duplicate Server Implementations
**Тесты:**
```typescript
// tests/integration/server/unified-architecture.test.ts
describe('Unified Server Architecture', () => {
  test('only one server instance handles API requests', async () => {
    const apiResponse = await $fetch('/api/vehicles')
    
    expect(apiResponse).toBeDefined()
    expect(apiResponse.data).toBeInstanceOf(Array)
  })

  test('API endpoints work consistently', async () => {
    const endpoints = ['/api/vehicles', '/api/telemetry/latest', '/api/status']
    
    for (const endpoint of endpoints) {
      const response = await $fetch(endpoint)
      expect(response.success).toBe(true)
    }
  })
})
```

#### ✅ Проблема #04: Incorrect PM2 Configuration
**Тесты:**
```typescript
// tests/e2e/pm2/process-management.test.ts
describe('PM2 Process Management', () => {
  test('all required processes are running', async () => {
    const processes = await getPM2Processes()
    
    expect(processes).toHaveLength(2) // Nuxt + MQTT Collector
    expect(processes.find(p => p.name === 'mapmon')).toBeDefined()
    expect(processes.find(p => p.name === 'mqtt-collector')).toBeDefined()
  })

  test('processes restart on failure', async () => {
    // Симуляция сбоя процесса
    await killProcess('mapmon')
    
    // Ожидание автоматического перезапуска
    await waitForProcess('mapmon', { timeout: 10000 })
    
    const isRunning = await isProcessRunning('mapmon')
    expect(isRunning).toBe(true)
  })
})
```

### ⚡ ВАЖНЫЕ ПРОБЛЕМЫ

#### ✅ Проблема #05: ESP32 Topic Mismatch
**Тесты:**
```typescript
// tests/integration/mqtt/topic-standardization.test.ts
describe('MQTT Topic Standardization', () => {
  test('ESP32 publishes to standardized topics', async () => {
    const mqttClient = await createMockMqttClient()
    
    // Симуляция отправки данных от ESP32
    await simulateESP32TelemetryData()
    
    // Проверка получения в стандартных топиках
    expect(mqttClient.receivedTopics).toContain('vehicles/ESP32_Car_2046/telemetry')
    expect(mqttClient.receivedTopics).toContain('vehicles/ESP32_Car_2046/status')
  })

  test('web application subscribes to all necessary topics', async () => {
    const subscribedTopics = await getWebAppSubscriptions()
    
    expect(subscribedTopics).toContain('vehicles/+/telemetry')
    expect(subscribedTopics).toContain('vehicles/+/status') 
    expect(subscribedTopics).toContain('car') // backward compatibility
  })
})
```

#### ✅ Проблема #02: Duplicate Chart Libraries
**Тесты:**
```typescript
// tests/unit/charts/library-usage.test.ts
describe('Chart Library Usage', () => {
  test('only ECharts is used in bundle', async () => {
    const { bundleAnalyzer } = await import('./bundle-analyzer')
    const analysis = await bundleAnalyzer.analyze()
    
    expect(analysis.dependencies).toContain('echarts')
    expect(analysis.dependencies).not.toContain('apexcharts')
  })

  test('ChartComponent renders with ECharts', async () => {
    const wrapper = await mountSuspended(ChartComponent, {
      props: { data: mockChartData }
    })
    
    expect(wrapper.find('.echarts-container')).toBeTruthy()
    expect(wrapper.find('.apexcharts-container')).toBeFalsy()
  })
})
```

### 🛠️ УЛУЧШЕНИЯ

#### ✅ Проблема #06-10: Остальные проблемы
Аналогичные тесты для каждой проблемы...

## 🔄 WORKFLOW ТЕСТИРОВАНИЯ

### 1. Pre-commit хуки
```bash
# .husky/pre-commit
#!/bin/sh
yarn test:unit
yarn test:lint
yarn test:type-check
```

### 2. CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run unit tests
        run: yarn test:unit --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies  
        run: yarn install --frozen-lockfile
      
      - name: Install Playwright
        run: yarn playwright install
      
      - name: Run E2E tests
        run: yarn test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 3. Скрипты package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:component": "vitest --config vitest.component.config.ts",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:all": "yarn test:unit && yarn test:e2e",
    "test:problem": "vitest --run tests/e2e/problem-fixes/",
    "test:smoke": "playwright test tests/e2e/smoke/",
    "test:debug": "vitest --inspect-brk"
  }
}
```

## 📊 МЕТРИКИ И ПОКРЫТИЕ

### Целевые метрики:
- **Unit тесты:** 90%+ покрытие кода
- **Component тесты:** 80%+ покрытие компонентов
- **Integration тесты:** 100% критических API endpoints
- **E2E тесты:** 100% критических пользовательских сценариев

### Инструменты мониторинга:
- **Codecov** для отслеживания покрытия
- **Playwright Reporter** для E2E отчетов
- **Vitest UI** для интерактивной отладки
- **Bundle Analyzer** для контроля размера

## 🎯 ПРОЦЕСС РЕШЕНИЯ ПРОБЛЕМ

### Для каждой проблемы:
1. **Написать тесты** (сначала failing)
2. **Реализовать исправление**
3. **Убедиться, что тесты проходят**
4. **Запустить regression тесты**
5. **Обновить документацию**

### Пример процесса:
```bash
# 1. Создать ветку для проблемы
git checkout -b fix/01-mqtt-architecture

# 2. Написать тесты
yarn test:problem 01 # должны падать

# 3. Реализовать исправление
# ... код изменений ...

# 4. Проверить, что тесты проходят
yarn test:problem 01

# 5. Запустить все тесты
yarn test:all

# 6. Коммит и мерж
git add . && git commit -m "fix: resolve MQTT architecture incompatibility"
```

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **Настроить базовую инфраструктуру тестирования**
2. **Создать тесты для каждой критической проблемы**
3. **Постепенно решать проблемы с тестовым покрытием**
4. **Расширить тестовое покрытие для всех компонентов**
5. **Интегрировать в CI/CD pipeline**

---

**📝 Примечание:** Эта стратегия обеспечивает максимальную надежность при решении проблем MapMon v0.5. Каждое изменение будет тщательно протестировано, что гарантирует стабильность системы мониторинга сельхозтехники. 