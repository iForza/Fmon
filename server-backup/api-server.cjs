const fastify = require('fastify')({ logger: true });
const SQLiteManager = require('./SQLiteManager.cjs');
const db = new SQLiteManager();

// CORS для браузера
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

// API для получения списка техники
fastify.get('/api/vehicles', async (request, reply) => {
  try {
    const vehicles = db.getAllVehicles();
    return {
      success: true,
      data: vehicles,
      count: vehicles.length
    };
  } catch (error) {
    reply.status(500);
    return { success: false, error: error.message };
  }
});

// API для получения последней телеметрии
fastify.get('/api/telemetry/latest', async (request, reply) => {
  try {
    const telemetry = db.getLatestTelemetry();
    const formatted = telemetry.map(t => ({
      vehicle_id: t.vehicle_id,
      vehicle_name: t.vehicle_name,
      lat: t.lat,
      lng: t.lng,
      speed: t.speed,
      battery: t.battery,
      temperature: t.temperature,
      rpm: t.rpm,
      timestamp: new Date(t.timestamp).toISOString()
    }));
    
    return {
      success: true,
      data: formatted
    };
  } catch (error) {
    reply.status(500);
    return { success: false, error: error.message };
  }
});

// API для получения истории для графиков
fastify.get('/api/telemetry/history', async (request, reply) => {
  try {
    const { range = '10min', vehicleId } = request.query;
    
    // Определяем количество часов для запроса
    const rangeHours = {
      '10min': 0.17, // 10 минут
      '1h': 1,
      '6h': 6,
      '12h': 12,
      '24h': 24
    };
    
    const hours = rangeHours[range] || 1;
    const history = db.getTelemetryHistory(vehicleId, hours);
    
    // Группируем данные по технике
    const vehicleData = {};
    history.forEach(record => {
      if (!vehicleData[record.vehicle_id]) {
        vehicleData[record.vehicle_id] = {
          vehicleId: record.vehicle_id,
          vehicleName: record.vehicle_name,
          data: []
        };
      }
      
      vehicleData[record.vehicle_id].data.push({
        timestamp: record.timestamp,
        speed: record.speed || 0,
        temperature: record.temperature || 0,
        battery: record.battery || 0,
        rpm: record.rpm || 0
      });
    });
    
    return {
      success: true,
      data: Object.values(vehicleData),
      range,
      count: Object.keys(vehicleData).length
    };
  } catch (error) {
    reply.status(500);
    return { success: false, error: error.message };
  }
});

// API статуса
fastify.get('/api/status', async (request, reply) => {
  return {
    status: 'API Server running with SQLite',
    timestamp: new Date().toISOString(),
    database: 'SQLite'
  };
});

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
    };
  } catch (error) {
    console.error('MQTT status error:', error);
    reply.status(500);
    return {
      success: false,
      error: 'Ошибка получения статуса MQTT'
    };
  }
});

fastify.post('/api/mqtt/config', async (request, reply) => {
  try {
    const config = request.body;
    // Сохраняем конфигурацию MQTT (заглушка)
    console.log('MQTT config received:', config);
    
    return {
      success: true,
      message: 'Настройки MQTT сохранены'
    };
  } catch (error) {
    console.error('MQTT config error:', error);
    reply.status(500);
    return {
      success: false,
      error: 'Ошибка сохранения настроек MQTT'
    };
  }
});

fastify.post('/api/mqtt/restart', async (request, reply) => {
  try {
    // Перезапуск MQTT подключения (заглушка)
    return {
      success: true,
      message: 'MQTT подключение перезапущено'
    };
  } catch (error) {
    console.error('MQTT restart error:', error);
    reply.status(500);
    return {
      success: false,
      error: 'Ошибка перезапуска MQTT'
    };
  }
});

// Запуск сервера
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ API Server - SQLite');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
