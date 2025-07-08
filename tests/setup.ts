import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// Глобальная настройка для тестов
beforeEach(() => {
  // Очистка всех моков перед каждым тестом
  vi.clearAllMocks()
  
  // Мокаем console.error для чистого вывода тестов
  vi.spyOn(console, 'error').mockImplementation(() => {})
  
  // Мокаем fetch для изоляции тестов
  global.fetch = vi.fn()
  
  // Настройка часового пояса для консистентности
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
})

afterEach(() => {
  // Восстановление системного времени
  vi.useRealTimers()
  
  // Восстановление console.error
  vi.restoreAllMocks()
})

// Глобальные моки для тестовой среды

// Мок для IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}))

// Мок для ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Мок для matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// Мок для WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}))

// Глобальная конфигурация Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // Мок для i18n
  $route: {
    path: '/',
    query: {},
    params: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}

// Мок для Nuxt навигации
vi.mock('#app', () => ({
  navigateTo: vi.fn(),
  useRoute: () => ({
    path: '/',
    query: {},
    params: {}
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })
}))

// Мок для $fetch
vi.mock('ofetch', () => ({
  $fetch: vi.fn()
}))

// Экспорт утилит для тестов
export { vi } 