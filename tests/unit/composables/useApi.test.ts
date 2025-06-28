import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useApi } from '~/composables/useApi'
import { createMockApiResponse, createMockVehicleList, createMockFetch } from '../../utils/test-helpers'

/**
 * Unit тесты для композабла useApi
 */
describe('useApi composable', () => {
  beforeEach(() => {
    // Очистка моков перед каждым тестом
    vi.clearAllMocks()
    
    // Мок для $fetch
    vi.mock('ofetch', () => ({
      $fetch: vi.fn()
    }))
  })

  test('should initialize with default values', async () => {
    const TestComponent = defineComponent({
      setup() {
        return useApi()
      },
      template: '<div>{{ vehicles.size }}</div>'
    })

    const wrapper = await mountSuspended(TestComponent)
    const { vehicles, isConnected, isLoading, error } = useApi()

    expect(vehicles.value.size).toBe(0)
    expect(isConnected.value).toBe(false)
    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  test('fetchVehicles should return vehicle data successfully', async () => {
    const mockVehicles = createMockVehicleList(3)
    const mockResponse = createMockApiResponse(mockVehicles)

    // Мок успешного ответа API
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response)

    const { fetchVehicles, vehicles } = useApi()
    const result = await fetchVehicles()

    expect(result).toHaveLength(3)
    expect(vehicles.value.size).toBe(3)
    expect(Array.from(vehicles.value.values())).toEqual(mockVehicles)
  })

  test('fetchVehicles should handle API errors gracefully', async () => {
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    const { fetchVehicles, error, isLoading } = useApi()
    
    const result = await fetchVehicles()

    expect(result).toEqual([])
    expect(error.value).toContain('Ошибка получения данных о технике')
    expect(isLoading.value).toBe(false)
  })

  test('fetchTelemetry should update vehicle data', async () => {
    const telemetryData = [
      {
        vehicle_id: 'test-001',
        vehicle_name: 'Тестовый Трактор',
        lat: '55.7558',
        lng: '37.6176',
        speed: '25',
        battery: '85',
        temperature: '75',
        timestamp: '2024-01-01T12:00:00.000Z'
      }
    ]

    const mockResponse = createMockApiResponse(telemetryData)
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response)

    const { fetchTelemetry, vehicles } = useApi()
    await fetchTelemetry()

    expect(vehicles.value.has('test-001')).toBe(true)
    
    const vehicle = vehicles.value.get('test-001')
    expect(vehicle?.name).toBe('Тестовый Трактор')
    expect(vehicle?.lat).toBe(55.7558)
    expect(vehicle?.lng).toBe(37.6176)
    expect(vehicle?.speed).toBe(25)
    expect(vehicle?.battery).toBe(85)
  })

  test('checkApiStatus should update connection state', async () => {
    const mockResponse = {
      status: 'API Server running with SQLite',
      database: 'connected'
    }

    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response)

    const { checkApiStatus, isConnected } = useApi()
    const result = await checkApiStatus()

    expect(result?.status).toBe('API Server running with SQLite')
    expect(isConnected.value).toBe(true)
  })

  test('should handle vehicle status determination correctly', async () => {
    const telemetryData = [
      {
        vehicle_id: 'moving-vehicle',
        speed: '30', // Движется
        timestamp: '2024-01-01T12:00:00.000Z'
      },
      {
        vehicle_id: 'stopped-vehicle', 
        speed: '0', // Стоит
        timestamp: '2024-01-01T12:00:00.000Z'
      }
    ]

    const mockResponse = createMockApiResponse(telemetryData)
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response)

    const { fetchTelemetry, vehicles } = useApi()
    await fetchTelemetry()

    const movingVehicle = vehicles.value.get('moving-vehicle')
    const stoppedVehicle = vehicles.value.get('stopped-vehicle')

    expect(movingVehicle?.status).toBe('active')
    expect(stoppedVehicle?.status).toBe('stopped')
  })

  test('should preserve existing vehicle data when updating', async () => {
    const { vehicles } = useApi()
    
    // Добавляем существующую технику
    const existingVehicle = {
      id: 'test-001',
      name: 'Существующий Трактор',
      lat: 55.7558,
      lng: 37.6176,
      speed: 15,
      status: 'active' as const,
      timestamp: new Date('2024-01-01T11:00:00.000Z'),
      lastUpdate: new Date('2024-01-01T11:00:00.000Z'),
      battery: 80
    }
    
    vehicles.value.set('test-001', existingVehicle)

    // Обновляем только некоторые поля
    const telemetryUpdate = [{
      vehicle_id: 'test-001',
      speed: '25',
      battery: '90',
      timestamp: '2024-01-01T12:00:00.000Z'
    }]

    const mockResponse = createMockApiResponse(telemetryUpdate)
    const mockFetch = vi.mocked(global.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response)

    const { fetchTelemetry } = useApi()
    await fetchTelemetry()

    const updatedVehicle = vehicles.value.get('test-001')
    
    // Проверяем, что имя сохранилось, а другие поля обновились
    expect(updatedVehicle?.name).toBe('Существующий Трактор')
    expect(updatedVehicle?.speed).toBe(25)
    expect(updatedVehicle?.battery).toBe(90)
    expect(updatedVehicle?.lat).toBe(55.7558) // Координаты сохранились
  })

  test('initialize should check API status and fetch data', async () => {
    const mockStatusResponse = {
      status: 'API Server running with SQLite'
    }
    
    const mockVehicles = createMockVehicleList(2)
    const mockVehicleResponse = createMockApiResponse(mockVehicles)

    const mockFetch = vi.mocked(global.fetch)
    
    // Первый вызов - проверка статуса
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatusResponse)
    } as Response)
    
    // Второй вызов - получение техники  
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockVehicleResponse)
    } as Response)

    const { initialize, isConnected, vehicles } = useApi()
    await initialize()

    expect(isConnected.value).toBe(true)
    expect(vehicles.value.size).toBe(2)
  })
}) 