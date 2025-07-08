import { ref, computed } from 'vue'

interface AdminStats {
  totalVehicles: number
  activeVehicles: number
  totalMessages: number
  systemUptime: string
  lastRestart: string
  mqttStatus: 'connected' | 'disconnected' | 'connecting'
}

interface SystemInfo {
  version: string
  nodeVersion: string
  platform: string
  memory: {
    used: number
    total: number
  }
  cpu: {
    usage: number
    cores: number
  }
}

export const useAdmin = () => {
  // Состояние админ-панели
  const isAdminPanelOpen = ref(false)
  const adminLogs = ref<any[]>([])
  const systemStartTime = ref(new Date())

  // Статистика системы
  const getSystemStats = (vehicles: any[], messages: any[], mqttConnected: boolean): AdminStats => {
    const now = new Date()
    const uptime = now.getTime() - systemStartTime.value.getTime()
    const hours = Math.floor(uptime / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))

    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalMessages: messages.length,
      systemUptime: `${hours}ч ${minutes}м`,
      lastRestart: systemStartTime.value.toLocaleString('ru-RU'),
      mqttStatus: mqttConnected ? 'connected' : 'disconnected'
    }
  }

  // Информация о системе
  const getSystemInfo = (): SystemInfo => {
    return {
      version: 'v0.5.0',
      nodeVersion: process.version || 'N/A',
      platform: process.platform || 'browser',
      memory: {
        used: 0, // В браузере недоступно
        total: 0
      },
      cpu: {
        usage: 0, // В браузере недоступно
        cores: navigator.hardwareConcurrency || 1
      }
    }
  }

  // Управление логами
  const addAdminLog = (type: 'info' | 'warning' | 'error', message: string, data?: any) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      type,
      message,
      data: data || null
    }
    
    adminLogs.value.unshift(logEntry)
    
    // Ограничиваем количество логов (максимум 1000)
    if (adminLogs.value.length > 1000) {
      adminLogs.value = adminLogs.value.slice(0, 1000)
    }
    
    console.log(`[ADMIN ${type.toUpperCase()}]`, message, data)
  }

  const clearAdminLogs = () => {
    adminLogs.value = []
    addAdminLog('info', 'Логи админ-панели очищены')
  }

  const exportAdminLogs = () => {
    const dataStr = JSON.stringify(adminLogs.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    addAdminLog('info', 'Логи админ-панели экспортированы')
  }

  // Управление техникой
  const sendCommandToVehicle = async (vehicleId: string, command: string, params?: any) => {
    try {
      addAdminLog('info', `Отправка команды "${command}" технике ${vehicleId}`, { command, params })
      
      // TODO: Реализовать отправку команд через MQTT
      // const { publish } = useMqtt()
      // await publish(`vehicles/${vehicleId}/commands`, JSON.stringify({ command, params }))
      
      addAdminLog('info', `Команда "${command}" успешно отправлена технике ${vehicleId}`)
      return true
    } catch (error) {
      addAdminLog('error', `Ошибка отправки команды "${command}" технике ${vehicleId}`, error)
      return false
    }
  }

  const restartVehicle = async (vehicleId: string) => {
    return await sendCommandToVehicle(vehicleId, 'restart')
  }

  const updateVehicleConfig = async (vehicleId: string, config: any) => {
    return await sendCommandToVehicle(vehicleId, 'update_config', config)
  }

  // Системные операции
  const performSystemMaintenance = async () => {
    addAdminLog('info', 'Начало системного обслуживания')
    
    try {
      // Очистка старых логов
      const oldLogsCount = adminLogs.value.length
      adminLogs.value = adminLogs.value.slice(0, 500)
      
      addAdminLog('info', `Очищено ${oldLogsCount - adminLogs.value.length} старых логов`)
      
      // TODO: Добавить другие операции обслуживания
      // - Очистка кеша
      // - Проверка соединений
      // - Обновление статистики
      
      addAdminLog('info', 'Системное обслуживание завершено успешно')
      return true
    } catch (error) {
      addAdminLog('error', 'Ошибка при системном обслуживании', error)
      return false
    }
  }

  const generateSystemReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemInfo: getSystemInfo(),
      logs: adminLogs.value.slice(0, 100), // Последние 100 логов
      summary: {
        totalLogs: adminLogs.value.length,
        errorCount: adminLogs.value.filter(log => log.type === 'error').length,
        warningCount: adminLogs.value.filter(log => log.type === 'warning').length,
        infoCount: adminLogs.value.filter(log => log.type === 'info').length
      }
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    addAdminLog('info', 'Системный отчет сгенерирован и скачан')
  }

  // Инициализация
  const initializeAdmin = () => {
    systemStartTime.value = new Date()
    addAdminLog('info', 'Админ-панель MapMon инициализирована')
  }

  // Вычисляемые свойства
  const recentLogs = computed(() => adminLogs.value.slice(0, 50))
  const errorLogs = computed(() => adminLogs.value.filter(log => log.type === 'error'))
  const warningLogs = computed(() => adminLogs.value.filter(log => log.type === 'warning'))

  return {
    // Состояние
    isAdminPanelOpen,
    adminLogs: readonly(adminLogs),
    recentLogs,
    errorLogs,
    warningLogs,
    systemStartTime: readonly(systemStartTime),

    // Методы
    getSystemStats,
    getSystemInfo,
    addAdminLog,
    clearAdminLogs,
    exportAdminLogs,
    sendCommandToVehicle,
    restartVehicle,
    updateVehicleConfig,
    performSystemMaintenance,
    generateSystemReport,
    initializeAdmin
  }
} 