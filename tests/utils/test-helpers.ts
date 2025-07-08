import { vi } from 'vitest'
import type { VehicleData } from '~/composables/useApi'

/**
 * Создает мок данных для транспортного средства
 */
export function createMockVehicleData(overrides: Partial<VehicleData> = {}): VehicleData {
  return {
    id: 'test-vehicle-001',
    name: 'Тестовый Трактор МТЗ-82',
    lat: 55.7558,
    lng: 37.6176,
    speed: 15,
    status: 'active',
    timestamp: new Date('2024-01-01T12:00:00.000Z'),
    lastUpdate: new Date('2024-01-01T12:00:00.000Z'),
    battery: 85,
    temperature: 75,
    rpm: 1500,
    ...overrides
  }
}

/**
 * Создает массив мок данных для нескольких транспортных средств
 */
export function createMockVehicleList(count: number = 3): VehicleData[] {
  return Array.from({ length: count }, (_, index) => 
    createMockVehicleData({
      id: `test-vehicle-${String(index + 1).padStart(3, '0')}`,
      name: `Тестовая Техника ${index + 1}`,
      lat: 55.7558 + (index * 0.001),
      lng: 37.6176 + (index * 0.001),
      speed: Math.floor(Math.random() * 50),
      battery: 70 + (index * 10)
    })
  )
}

/**
 * Создает мок MQTT сообщения
 */
export function createMockMqttMessage(topic: string, payload: any) {
  return {
    topic,
    payload: JSON.stringify(payload),
    timestamp: new Date().toISOString(),
    qos: 0,
    retain: false
  }
}

/**
 * Создает мок API ответа
 */
export function createMockApiResponse<T>(data: T, success: boolean = true) {
  return {
    success,
    data,
    count: Array.isArray(data) ? data.length : 1,
    timestamp: new Date().toISOString()
  }
}

/**
 * Утилита для ожидания в тестах
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Мок для fetch с предустановленными ответами
 */
export function createMockFetch(responses: Record<string, any>) {
  return vi.fn().mockImplementation((url: string) => {
    const response = responses[url]
    if (!response) {
      return Promise.reject(new Error(`Unmocked fetch to ${url}`))
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    })
  })
}

/**
 * Мок для WebSocket
 */
export function createMockWebSocket() {
  const listeners: Record<string, Function[]> = {}
  
  const mockWs = {
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(callback)
    }),
    removeEventListener: vi.fn(),
    readyState: 1,
    
    // Утилитарные методы для тестов
    _trigger: (event: string, data?: any) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(data))
      }
    },
    _triggerMessage: (data: any) => {
      const event = { data: JSON.stringify(data) }
      if (listeners.message) {
        listeners.message.forEach(callback => callback(event))
      }
    }
  }
  
  return mockWs
}

/**
 * Мок для MQTT клиента
 */
export function createMockMqttClient() {
  const subscriptions = new Set<string>()
  const listeners: Record<string, Function[]> = {}
  
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((topic: string) => {
      subscriptions.add(topic)
      return Promise.resolve()
    }),
    unsubscribe: vi.fn((topic: string) => {
      subscriptions.delete(topic)
      return Promise.resolve()
    }),
    publish: vi.fn(),
    end: vi.fn(),
    on: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(callback)
    }),
    
    // Утилитарные методы для тестов
    _getSubscriptions: () => Array.from(subscriptions),
    _triggerMessage: (topic: string, message: any) => {
      if (listeners.message) {
        listeners.message.forEach(callback => 
          callback(topic, Buffer.from(JSON.stringify(message)))
        )
      }
    },
    _triggerConnect: () => {
      if (listeners.connect) {
        listeners.connect.forEach(callback => callback())
      }
    },
    _triggerError: (error: Error) => {
      if (listeners.error) {
        listeners.error.forEach(callback => callback(error))
      }
    }
  }
}

/**
 * Создает мок для SQLite базы данных
 */
export function createMockDatabase() {
  const data: Record<string, any[]> = {
    vehicles: [],
    telemetry: [],
    settings: []
  }
  
  return {
    getAllVehicles: vi.fn(() => data.vehicles),
    getLatestTelemetryForVehicle: vi.fn((vehicleId: string) => 
      data.telemetry.find(t => t.vehicle_id === vehicleId)
    ),
    saveTelemetry: vi.fn((telemetryData: any) => {
      data.telemetry.push(telemetryData)
      return { success: true }
    }),
    addVehicle: vi.fn((vehicle: any) => {
      data.vehicles.push(vehicle)
      return { success: true }
    }),
    
    // Утилитарные методы для тестов
    _clearData: () => {
      Object.keys(data).forEach(key => {
        data[key] = []
      })
    },
    _addTestData: (table: string, items: any[]) => {
      data[table] = [...(data[table] || []), ...items]
    },
    _getData: (table: string) => data[table] || []
  }
}

/**
 * Создает мок элемента DOM
 */
export function createMockElement(tagName: string = 'div') {
  return {
    tagName: tagName.toUpperCase(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    },
    style: {},
    innerHTML: '',
    textContent: '',
    children: [],
    parentNode: null
  }
} 