import { ref, onMounted, onUnmounted, readonly } from 'vue'

export const useTime = () => {
  const isClient = ref(false)
  const currentTime = ref(new Date())
  
  let interval: NodeJS.Timeout | null = null

  // Функция форматирования времени, безопасная для SSR
  const formatTime = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A'
    
    // На сервере возвращаем статичное значение
    if (!isClient.value) {
      return '--:--:--'
    }
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      
      // Проверяем валидность даты
      if (isNaN(dateObj.getTime())) {
        return 'N/A'
      }
      
      return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('Ошибка форматирования времени:', error)
      return 'N/A'
    }
  }

  // Функция для получения относительного времени (например, "2 минуты назад")
  const getRelativeTime = (date: Date | string | null | undefined): string => {
    if (!date || !isClient.value) return 'N/A'
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      
      // Проверяем валидность даты
      if (isNaN(dateObj.getTime())) {
        return 'N/A'
      }
      
      const now = currentTime.value
      const diffMs = now.getTime() - dateObj.getTime()
      const diffSeconds = Math.floor(diffMs / 1000)
      
      if (diffSeconds < 10) return 'только что'
      if (diffSeconds < 60) return `${diffSeconds}с назад`
      
      const diffMinutes = Math.floor(diffSeconds / 60)
      if (diffMinutes < 60) return `${diffMinutes}м назад`
      
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours}ч назад`
      
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}д назад`
    } catch (error) {
      console.error('Ошибка вычисления относительного времени:', error)
      return 'N/A'
    }
  }

  // Функция для определения статуса подключения по времени
  const getConnectionStatus = (lastUpdate: Date | string | null | undefined): 'online' | 'offline' | 'unknown' => {
    if (!lastUpdate || !isClient.value) return 'unknown'
    
    try {
      const dateObj = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate
      
      // Проверяем валидность даты
      if (isNaN(dateObj.getTime())) {
        return 'unknown'
      }
      
      const now = currentTime.value
      const diffMs = now.getTime() - dateObj.getTime()
      
      // Если последнее обновление было более 10 секунд назад - офлайн
      return diffMs > 10000 ? 'offline' : 'online'
    } catch (error) {
      return 'unknown'
    }
  }

  onMounted(() => {
    isClient.value = true
    
    // Обновляем текущее время каждую секунду
    interval = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  })

  return {
    isClient: readonly(isClient),
    currentTime: readonly(currentTime),
    formatTime,
    getRelativeTime,
    getConnectionStatus
  }
} 