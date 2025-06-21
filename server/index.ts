import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import fastifyCors from '@fastify/cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Получаем путь к директории
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Создаем Fastify экземпляр
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

// Регистрируем плагины
await fastify.register(fastifyCors, {
  origin: true,
  credentials: true
})

await fastify.register(fastifyWebsocket)

await fastify.register(fastifyStatic, {
  root: join(__dirname, '..', 'public'),
  prefix: '/public/'
})

// Типы данных
interface VehicleData {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  status: 'active' | 'stopped'
  lastUpdate: Date
  battery?: number
  fuel?: number
}

interface TelemetryMessage {
  vehicleId: string
  timestamp: Date
  lat: number
  lng: number
  speed: number
  battery?: number
  fuel?: number
  status?: string
}

// Хранилище данных (в production использовать БД)
const vehicles = new Map<string, VehicleData>()
const connectedClients = new Set<any>()

// Тестовые данные
vehicles.set('tractor_001', {
  id: 'tractor_001',
  name: 'Трактор МТЗ-82',
  lat: 55.7558,
  lng: 37.6176,
  speed: 15,
  status: 'active',
  lastUpdate: new Date(),
  battery: 85,
  fuel: 67
})

vehicles.set('combine_001', {
  id: 'combine_001',
  name: 'Комбайн КЗС-10',
  lat: 55.7608,
  lng: 37.6256,
  speed: 0,
  status: 'stopped',
  lastUpdate: new Date(),
  battery: 92,
  fuel: 34
})

// API маршруты

// Получить список всей техники
fastify.get('/api/vehicles', async (request, reply) => {
  const vehicleList = Array.from(vehicles.values())
  return {
    success: true,
    data: vehicleList,
    count: vehicleList.length
  }
})

// Получить информацию о конкретной технике
fastify.get<{Params: {id: string}}>('/api/vehicles/:id', async (request, reply) => {
  const { id } = request.params
  const vehicle = vehicles.get(id)
  
  if (!vehicle) {
    reply.status(404)
    return {
      success: false,
      error: 'Техника не найдена'
    }
  }
  
  return {
    success: true,
    data: vehicle
  }
})

// Обновить данные техники (имитация MQTT)
fastify.post<{Body: TelemetryMessage}>('/api/telemetry', async (request, reply) => {
  const data = request.body
  
  // Валидация данных
  if (!data.vehicleId || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
    reply.status(400)
    return {
      success: false,
      error: 'Неверные данные телеметрии'
    }
  }
  
  // Обновляем данные техники
  const existingVehicle = vehicles.get(data.vehicleId)
  const updatedVehicle: VehicleData = {
    id: data.vehicleId,
    name: existingVehicle?.name || `Техника ${data.vehicleId}`,
    lat: data.lat,
    lng: data.lng,
    speed: data.speed || 0,
    status: data.status as 'active' | 'stopped' || (data.speed > 0 ? 'active' : 'stopped'),
    lastUpdate: new Date(),
    battery: data.battery || existingVehicle?.battery,
    fuel: data.fuel || existingVehicle?.fuel
  }
  
  vehicles.set(data.vehicleId, updatedVehicle)
  
  // Отправляем обновление всем подключенным клиентам
  broadcastToClients({
    type: 'vehicle_update',
    data: updatedVehicle
  })
  
  return {
    success: true,
    data: updatedVehicle
  }
})

// Получить последнюю телеметрию
fastify.get('/api/telemetry/latest', async (request, reply) => {
  const telemetryData = Array.from(vehicles.values()).map(vehicle => ({
    vehicle_id: vehicle.id,
    vehicle_name: vehicle.name,
    lat: vehicle.lat,
    lng: vehicle.lng,
    speed: vehicle.speed,
    battery: vehicle.battery,
    temperature: Math.random() * 40 + 20, // Симуляция температуры 20-60°C
    rpm: Math.random() * 2000 + 500, // Симуляция RPM 500-2500
    timestamp: vehicle.lastUpdate.toISOString()
  }))
  
  return {
    success: true,
    data: telemetryData
  }
})

// Получить историю телеметрии для графиков
fastify.get<{Querystring: {range?: string, vehicleId?: string}}>('/api/telemetry/history', async (request, reply) => {
  const { range = '10min', vehicleId } = request.query
  
  // Определяем количество точек и интервал в зависимости от диапазона
  const ranges: Record<string, {points: number, interval: number}> = {
    '10min': { points: 20, interval: 30 }, // 20 точек с интервалом 30 сек
    '1h': { points: 30, interval: 120 }, // 30 точек с интервалом 2 мин
    '6h': { points: 36, interval: 600 }, // 36 точек с интервалом 10 мин
    '12h': { points: 36, interval: 1200 }, // 36 точек с интервалом 20 мин
    '24h': { points: 48, interval: 1800 } // 48 точек с интервалом 30 мин
  }
  
  const config = ranges[range] || ranges['10min']
  const now = new Date()
  const history: any[] = []
  
  // Фильтруем технику если указан vehicleId
  const targetVehicles = vehicleId 
    ? Array.from(vehicles.values()).filter(v => v.id === vehicleId)
    : Array.from(vehicles.values())
  
  targetVehicles.forEach(vehicle => {
    const vehicleHistory: any[] = []
    
    // Генерируем исторические данные
    for (let i = config.points; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * config.interval * 1000))
      
      // Реалистичная симуляция данных
      const baseSpeed = vehicle.speed || 0
      const speed = Math.max(0, baseSpeed + (Math.random() - 0.5) * 10)
      
      const baseTemp = 35 + Math.sin(i * 0.1) * 15 // Температура 20-50°C с трендом
      const temperature = baseTemp + (Math.random() - 0.5) * 5
      
      const baseBattery = vehicle.battery || 80
      const battery = Math.max(10, Math.min(100, baseBattery + (Math.random() - 0.5) * 5))
      
      const baseRpm = speed > 0 ? 800 + speed * 30 : 0 // RPM зависит от скорости
      const rpm = baseRpm + (Math.random() - 0.5) * 200
      
      vehicleHistory.push({
        timestamp: timestamp.getTime(),
        speed: Math.round(speed * 100) / 100,
        temperature: Math.round(temperature * 100) / 100,
        battery: Math.round(battery * 100) / 100,
        rpm: Math.round(Math.max(0, rpm))
      })
    }
    
    history.push({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      data: vehicleHistory
    })
  })
  
  return {
    success: true,
    data: history,
    range,
    count: history.length
  }
})

// Статус сервера
fastify.get('/api/status', async (request, reply) => {
  return {
    status: 'Fleet Monitor API Server',
    timestamp: new Date().toISOString(),
    vehicles: vehicles.size,
    connectedClients: connectedClients.size
  }
})

// Получить статус сервера
fastify.get('/api/status', async (request, reply) => {
  return {
    status: 'API Server running with SQLite',
    timestamp: new Date().toISOString(),
    vehicles: vehicles.size,
    database: 'In-Memory Storage'
  }
})

// WebSocket для real-time обновлений
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connectedClients.add(connection)
    
    fastify.log.info('Новое WebSocket подключение')
    
    // Отправляем текущие данные новому клиенту
    connection.socket.send(JSON.stringify({
      type: 'initial_data',
      data: Array.from(vehicles.values())
    }))
    
    connection.socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        
        switch (data.type) {
          case 'ping':
            connection.socket.send(JSON.stringify({ type: 'pong' }))
            break
            
          case 'subscribe_vehicle':
            // Подписка на обновления конкретной техники
            fastify.log.info(`Подписка на технику: ${data.vehicleId}`)
            break
            
          default:
            fastify.log.warn(`Неизвестный тип сообщения: ${data.type}`)
        }
      } catch (error) {
        fastify.log.error('Ошибка обработки WebSocket сообщения:', error)
      }
    })
    
    connection.socket.on('close', () => {
      connectedClients.delete(connection)
      fastify.log.info('WebSocket соединение закрыто')
    })
    
    connection.socket.on('error', (error) => {
      fastify.log.error('WebSocket ошибка:', error)
      connectedClients.delete(connection)
    })
  })
})

// Функция для отправки сообщений всем клиентам
function broadcastToClients(message: any) {
  const messageStr = JSON.stringify(message)
  
  connectedClients.forEach((client) => {
    try {
      if (client.socket.readyState === 1) { // OPEN
        client.socket.send(messageStr)
      }
    } catch (error) {
      fastify.log.error('Ошибка отправки сообщения клиенту:', error)
      connectedClients.delete(client)
    }
  })
}

// Имитация получения данных от MQTT (для тестирования)
function simulateMqttData() {
  const vehicleIds = Array.from(vehicles.keys())
  
  vehicleIds.forEach((vehicleId) => {
    const vehicle = vehicles.get(vehicleId)!
    
    // Случайное изменение координат (имитация движения)
    const latDelta = (Math.random() - 0.5) * 0.001
    const lngDelta = (Math.random() - 0.5) * 0.001
    const speedDelta = Math.random() * 10 - 5
    
    const updatedVehicle: VehicleData = {
      ...vehicle,
      lat: vehicle.lat + latDelta,
      lng: vehicle.lng + lngDelta,
      speed: Math.max(0, Math.min(50, vehicle.speed + speedDelta)),
      lastUpdate: new Date()
    }
    
    updatedVehicle.status = updatedVehicle.speed > 1 ? 'active' : 'stopped'
    
    vehicles.set(vehicleId, updatedVehicle)
    
    // Отправляем обновление клиентам
    broadcastToClients({
      type: 'vehicle_update',
      data: updatedVehicle
    })
  })
}

// Запускаем имитацию MQTT данных каждые 5 секунд
setInterval(simulateMqttData, 5000)

// Обработка завершения процесса
const gracefulShutdown = async () => {
  fastify.log.info('Завершение работы сервера...')
  
  try {
    await fastify.close()
    fastify.log.info('Сервер успешно остановлен')
    process.exit(0)
  } catch (error) {
    fastify.log.error('Ошибка при завершении работы:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Запуск сервера
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    fastify.log.info(`🚀 Сервер запущен на http://${host}:${port}`)
    fastify.log.info(`📡 WebSocket доступен на ws://${host}:${port}/ws`)
    
  } catch (error) {
    fastify.log.error('Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

// MQTT настройки API endpoints
fastify.get('/api/mqtt/status', async (request, reply) => {
  try {
    // Проверяем статус MQTT подключения (заглушка)
    return {
      success: true,
      connected: false,
      lastMessage: null,
      activeDevices: 0,
      message: 'MQTT коллектор работает отдельно'
    }
  } catch (error) {
    console.error('MQTT status error:', error)
    reply.status(500)
    return {
      success: false,
      error: 'Ошибка получения статуса MQTT'
    }
  }
})

fastify.post('/api/mqtt/config', async (request, reply) => {
  try {
    const config = request.body
    // Сохраняем конфигурацию MQTT (заглушка)
    console.log('MQTT config received:', config)
    
    return {
      success: true,
      message: 'Настройки MQTT сохранены'
    }
  } catch (error) {
    console.error('MQTT config error:', error)
    reply.status(500)
    return {
      success: false,
      error: 'Ошибка сохранения настроек MQTT'
    }
  }
})

fastify.post('/api/mqtt/restart', async (request, reply) => {
  try {
    // Перезапуск MQTT подключения (заглушка)
    return {
      success: true,
      message: 'MQTT подключение перезапущено'
    }
  } catch (error) {
    console.error('MQTT restart error:', error)
    reply.status(500)
    return {
      success: false,
      error: 'Ошибка перезапуска MQTT'
    }
  }
})

start() 