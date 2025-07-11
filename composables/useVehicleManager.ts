import { ref, computed, onUnmounted, watch } from 'vue'
import { useApi } from './useApi'
import { useTime } from './useTime'

// Типы для состояний устройств
export enum VehicleStatus {
  ONLINE = 'online',       // Получаем данные < 10 сек
  IDLE = 'idle',           // Получаем данные < 30 сек, но нет активности
  DISCONNECTED = 'disconnected', // Нет данных > 30 сек
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

export const useVehicleManager = () => {
  // Состояние
  const activeVehicles = ref<Map<string, ManagedVehicle>>(new Map())
  const inactiveVehicles = ref<Map<string, ManagedVehicle>>(new Map())
  const selectedVehicleId = ref<string | null>(null)
  
  // Интервал для очистки
  let cleanupInterval: NodeJS.Timeout | null = null
  
  // Константы
  const ONLINE_THRESHOLD = 10000  // 10 секунд
  const IDLE_THRESHOLD = 30000    // 30 секунд
  const CLEANUP_INTERVAL = 15000  // 15 секунд
  
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
  
  // Инициализация менеджера
  const initialize = async () => {
    // Инициализируем API только если он еще не инициализирован
    if (!api.isConnected.value) {
      await api.initialize()
      api.startPolling()
    }
    
    // Запускаем автоочистку
    cleanupInterval = setInterval(() => {
      cleanupOldDevices()
    }, CLEANUP_INTERVAL)
    
    // Реактивное отслеживание изменений в API
    watch(
      () => api.allVehicles.value,
      (newVehicles) => {
        if (newVehicles.length > 0) {
          processVehicleData(newVehicles)
        }
      },
      { immediate: true, deep: true }
    )
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
  
  // Очистка ресурсов
  const cleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
    api.cleanup()
  }
  
  // Автоочистка при размонтировании
  onUnmounted(() => {
    cleanup()
  })
  
  return {
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
    VehicleStatus
  }
}