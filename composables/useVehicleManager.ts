import { ref, computed, onUnmounted, watch, getCurrentInstance } from 'vue'
import { useApi } from './useApi'
import { useTime } from './useTime'

// Типы для состояний устройств
export enum VehicleStatus {
  ONLINE = 'online',       // Получаем данные < 30 сек
  IDLE = 'idle',           // Получаем данные < 2 мин, но нет активности  
  DISCONNECTED = 'disconnected', // Нет данных > 2 мин
  ERROR = 'error'          // Ошибка подключения
}

export interface ManagedVehicle {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  battery?: number
  temperature?: number
  rpm?: number
  status: VehicleStatus
  lastUpdate: Date
  isActive: boolean
  connectionDuration: number
}

// Singleton состояние для предотвращения race conditions
let vehicleManagerInstance: any = null
let isInitializing = false
let isInitialized = false
let watcherUnsubscribe: any = null

export const useVehicleManager = () => {
  // Возвращаем существующий экземпляр если он есть
  if (vehicleManagerInstance) {
    return vehicleManagerInstance
  }
  // Состояние
  const activeVehicles = ref<Map<string, ManagedVehicle>>(new Map())
  const inactiveVehicles = ref<Map<string, ManagedVehicle>>(new Map())
  const selectedVehicleId = ref<string | null>(null)
  
  // Интервал для очистки
  let cleanupInterval: NodeJS.Timeout | null = null
  
  // Константы (увеличенные пороги для стабильности)
  const ONLINE_THRESHOLD = 30000   // 30 секунд (было 10)
  const IDLE_THRESHOLD = 120000    // 2 минуты (было 30 сек)
  const CLEANUP_INTERVAL = 15000   // 15 секунд
  
  // Подключение к API
  const api = useApi()
  const { formatTime, getRelativeTime } = useTime()
  
  // Определение статуса устройства
  const getVehicleStatus = (lastUpdate: Date): VehicleStatus => {
    const now = Date.now()
    const timeDiff = now - lastUpdate.getTime()
    
    if (timeDiff < ONLINE_THRESHOLD) {
      return VehicleStatus.ONLINE
    } else if (timeDiff < IDLE_THRESHOLD) {
      return VehicleStatus.IDLE
    } else {
      return VehicleStatus.DISCONNECTED
    }
  }
  
  // Обработка данных из API
  const processVehicleData = (apiVehicles: any[]) => {
    const now = Date.now()
    
    apiVehicles.forEach(vehicle => {
      const lastUpdate = new Date(vehicle.lastUpdate || vehicle.timestamp)
      const status = getVehicleStatus(lastUpdate)
      
      // Создаем объект управляемого устройства
      const managedVehicle: ManagedVehicle = {
        id: vehicle.id,
        name: vehicle.name,
        lat: vehicle.lat || 0,
        lng: vehicle.lng || 0,
        speed: vehicle.speed || 0,
        battery: vehicle.battery,
        temperature: vehicle.temperature,
        rpm: vehicle.rpm,
        status,
        lastUpdate,
        isActive: (vehicle.speed || 0) > 0,
        connectionDuration: now - lastUpdate.getTime()
      }
      
      // Определяем где размещать устройство
      if (status === VehicleStatus.DISCONNECTED) {
        // Перемещаем в неактивные
        activeVehicles.value.delete(vehicle.id)
        inactiveVehicles.value.set(vehicle.id, managedVehicle)
      } else {
        // Размещаем в активные
        if (inactiveVehicles.value.has(vehicle.id)) {
          inactiveVehicles.value.delete(vehicle.id)
        }
        activeVehicles.value.set(vehicle.id, managedVehicle)
      }
    })
    
    // Принудительное обновление реактивности
    activeVehicles.value = new Map(activeVehicles.value)
    inactiveVehicles.value = new Map(inactiveVehicles.value)
  }
  
  // Очистка старых неактивных устройств
  const cleanupOldDevices = () => {
    const now = Date.now()
    const MAX_INACTIVE_TIME = 300000 // 5 минут
    
    inactiveVehicles.value.forEach((vehicle, id) => {
      if (now - vehicle.lastUpdate.getTime() > MAX_INACTIVE_TIME) {
        inactiveVehicles.value.delete(id)
      }
    })
    
    inactiveVehicles.value = new Map(inactiveVehicles.value)
  }
  
  // Инициализация менеджера с защитой от race conditions
  const initialize = async () => {
    // Предотвращаем множественную инициализацию
    if (isInitializing || isInitialized) {
      console.log('⚠️ VehicleManager уже инициализируется или инициализирован, пропускаем...')
      return
    }
    
    isInitializing = true
    console.log('🔄 Инициализация VehicleManager...')
    
    try {
      // Инициализируем API только если он еще не инициализирован
      if (!api.isInitialized) {
        await api.initialize()
        api.startPolling()
      }
      
      // Запускаем автоочистку только если еще не запущена
      if (!cleanupInterval) {
        cleanupInterval = setInterval(() => {
          cleanupOldDevices()
        }, CLEANUP_INTERVAL)
      }
      
      // Создаем watcher только если еще не создан
      if (!watcherUnsubscribe) {
        watcherUnsubscribe = watch(
          () => api.allVehicles.value,
          (newVehicles) => {
            if (newVehicles.length > 0) {
              processVehicleData(newVehicles)
            }
          },
          { immediate: true, deep: true }
        )
      }
      
      isInitialized = true
      console.log('✅ VehicleManager инициализирован')
    } catch (error) {
      console.error('❌ Ошибка инициализации VehicleManager:', error)
    } finally {
      isInitializing = false
    }
  }
  
  // Выбор устройства
  const selectVehicle = (vehicleId: string) => {
    selectedVehicleId.value = vehicleId
  }
  
  // Получение выбранного устройства
  const getSelectedVehicle = computed(() => {
    if (!selectedVehicleId.value) return null
    return activeVehicles.value.get(selectedVehicleId.value) || null
  })
  
  // Вычисляемые свойства
  const allActiveVehicles = computed(() => Array.from(activeVehicles.value.values()))
  const allInactiveVehicles = computed(() => Array.from(inactiveVehicles.value.values()))
  const totalVehicles = computed(() => allActiveVehicles.value.length + allInactiveVehicles.value.length)
  const onlineVehicles = computed(() => allActiveVehicles.value.filter(v => v.status === VehicleStatus.ONLINE))
  const movingVehicles = computed(() => allActiveVehicles.value.filter(v => v.isActive))
  
  // Полная очистка ресурсов
  const cleanup = () => {
    console.log('🧹 Очистка VehicleManager ресурсов')
    
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
    
    if (watcherUnsubscribe) {
      watcherUnsubscribe()
      watcherUnsubscribe = null
    }
    
    // Сбрасываем состояние инициализации
    isInitialized = false
    isInitializing = false
    
    api.cleanup()
  }
  
  // Создаем экземпляр VehicleManager
  vehicleManagerInstance = {
    // Состояние
    activeVehicles: allActiveVehicles,
    inactiveVehicles: allInactiveVehicles,
    selectedVehicleId,
    
    // Методы
    initialize,
    selectVehicle,
    cleanup,
    
    // Вычисляемые
    selectedVehicle: getSelectedVehicle,
    totalVehicles,
    onlineVehicles,
    movingVehicles,
    
    // Утилиты
    formatTime,
    getRelativeTime,
    VehicleStatus,
    
    // Статус инициализации
    get isInitializing() { return isInitializing },
    get isInitialized() { return isInitialized }
  }
  
  // Автоочистка при размонтировании (только если есть активный компонент)
  if (getCurrentInstance()) {
    onUnmounted(() => {
      console.log('🧹 Очистка VehicleManager ресурсов при размонтировании')
      cleanup()
    })
  }
  
  return vehicleManagerInstance
}