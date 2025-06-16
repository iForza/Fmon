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

start() 