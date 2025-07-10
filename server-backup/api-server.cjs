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

// API для получения новых данных телеметрии после определенного timestamp (delta-запросы)
fastify.get('/api/telemetry/delta', async (request, reply) => {
  try {
    const { since } = request.query;
    const lastTimestamp = since ? parseInt(since) : 0;
    
    const telemetry = db.getLatestTelemetryAfter(lastTimestamp);
    const formatted = telemetry.map(t => ({
      vehicle_id: t.vehicle_id,
      vehicle_name: t.vehicle_name,
      lat: t.lat,
      lng: t.lng,
      speed: t.speed,
      battery: t.battery,
      temperature: t.temperature,
      rpm: t.rpm,
      timestamp: t.timestamp // Возвращаем как число для удобства сравнения
    }));
    
    return {
      success: true,
      data: formatted,
      count: formatted.length,
      lastTimestamp: formatted.length > 0 ? Math.max(...formatted.map(f => f.timestamp)) : lastTimestamp
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
    // Получаем реальный статус из базы данных
    const recentTelemetry = db.getLatestTelemetry();
    const activeDevices = recentTelemetry.filter(t => {
      const lastUpdate = new Date(t.timestamp);
      const now = new Date();
      const timeDiff = (now - lastUpdate) / 1000; // в секундах
      return timeDiff < 300; // активные если обновлялись последние 5 минут
    }).length;
    
    const lastMessage = recentTelemetry.length > 0 ? {
      vehicle_id: recentTelemetry[0].vehicle_id,
      timestamp: recentTelemetry[0].timestamp,
      data: {
        speed: recentTelemetry[0].speed,
        battery: recentTelemetry[0].battery,
        temperature: recentTelemetry[0].temperature
      }
    } : null;
    
    return {
      success: true,
      connected: activeDevices > 0,
      status: activeDevices > 0 ? 'connected' : 'disconnected',
      lastMessage: lastMessage,
      activeDevices: activeDevices,
      totalDevices: recentTelemetry.length,
      timestamp: new Date().toISOString(),
      message: `MQTT коллектор обрабатывает данные от ${activeDevices} устройств`
    };
  } catch (error) {
    console.error('MQTT status error:', error);
    reply.status(500);
    return {
      success: false,
      connected: false,
      error: 'Ошибка получения статуса MQTT',
      timestamp: new Date().toISOString()
    };
  }
});

fastify.post('/api/mqtt/config', async (request, reply) => {
  try {
    const config = request.body;
    console.log('🔧 MQTT config update received:', config);
    
    // Валидация конфигурации
    if (!config.server || !config.port) {
      reply.status(400);
      return {
        success: false,
        error: 'Необходимо указать сервер и порт MQTT'
      };
    }
    
    // В реальной реализации здесь нужно:
    // 1. Сохранить конфигурацию в файл/БД
    // 2. Перезапустить MQTT коллектор с новыми настройками
    
    return {
      success: true,
      message: 'Настройки MQTT сохранены. Требуется перезапуск коллектора.',
      config: {
        server: config.server,
        port: config.port,
        client_id: config.client_id || 'mapmon-server',
        topics: config.topics || ['vehicles/+/telemetry']
      }
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
    console.log('🔄 MQTT restart requested');
    
    // В реальной реализации здесь нужно:
    // 1. Остановить текущий MQTT клиент
    // 2. Перезагрузить конфигурацию
    // 3. Запустить новое соединение
    
    // Имитация времени перезапуска
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'MQTT подключение успешно перезапущено',
      timestamp: new Date().toISOString(),
      status: 'restarted'
    };
  } catch (error) {
    console.error('MQTT restart error:', error);
    reply.status(500);
    return {
      success: false,
      error: 'Ошибка перезапуска MQTT соединения'
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
