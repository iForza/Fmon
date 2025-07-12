const mqtt = require('mqtt');
const SQLiteManager = require('./SQLiteManager.cjs');
const db = new SQLiteManager();

console.log('🔌 Connecting to WQTT.RU MQTT Collector v2.0 (m9.wqtt.ru:20264)...');
const client = mqtt.connect('mqtt://m9.wqtt.ru:20264', {
    clientId: 'mapmon-server-' + Date.now(),
    username: 'u_MZEPA5',
    password: 'L3YAUTS6',
    keepalive: 120,
    reconnectPeriod: 3000,
    connectTimeout: 15 * 1000,
    clean: true,
    protocolVersion: 4
});

client.on('connect', () => {
    console.log('✅ MQTT Connected - WQTT.RU v2.0');
    console.log('🔐 Аутентификация прошла успешно');
    console.log('');
    
    // === ПОДПИСКИ НА ТОПИКИ v2.0 ===
    
    // Основные данные устройств (новая архитектура)
    client.subscribe('mapmon/vehicles/+/data/telemetry', { qos: 1 }, (err) => {
        if (!err) console.log('📊 Подписка: mapmon/vehicles/+/data/telemetry (QoS 1)');
    });
    client.subscribe('mapmon/vehicles/+/data/gps', { qos: 0 }, (err) => {
        if (!err) console.log('📍 Подписка: mapmon/vehicles/+/data/gps (QoS 0)');
    });
    client.subscribe('mapmon/vehicles/+/data/sensors', { qos: 1 }, (err) => {
        if (!err) console.log('🔧 Подписка: mapmon/vehicles/+/data/sensors (QoS 1)');
    });
    
    // Статусы устройств
    client.subscribe('mapmon/vehicles/+/status/connection', { qos: 1 }, (err) => {
        if (!err) console.log('🔌 Подписка: mapmon/vehicles/+/status/connection (QoS 1)');
    });
    client.subscribe('mapmon/vehicles/+/status/health', { qos: 1 }, (err) => {
        if (!err) console.log('💓 Подписка: mapmon/vehicles/+/status/health (QoS 1)');
    });
    
    // Уведомления
    client.subscribe('mapmon/vehicles/+/alerts/critical', { qos: 2 }, (err) => {
        if (!err) console.log('🚨 Подписка: mapmon/vehicles/+/alerts/critical (QoS 2)');
    });
    client.subscribe('mapmon/vehicles/+/alerts/warnings', { qos: 1 }, (err) => {
        if (!err) console.log('⚠️ Подписка: mapmon/vehicles/+/alerts/warnings (QoS 1)');
    });
    
    // === LEGACY ТОПИКИ (обратная совместимость) ===
    client.subscribe('car', { qos: 0 }, (err) => {
        if (!err) console.log('🚗 Подписка: car (legacy, QoS 0)');
    });
    client.subscribe('vehicles/+/telemetry', { qos: 0 }, (err) => {
        if (!err) console.log('📊 Подписка: vehicles/+/telemetry (legacy, QoS 0)');
    });
    client.subscribe('vehicles/+/status', { qos: 0 }, (err) => {
        if (!err) console.log('📡 Подписка: vehicles/+/status (legacy, QoS 0)');
    });
    client.subscribe('vehicles/+/heartbeat', { qos: 0 }, (err) => {
        if (!err) console.log('💓 Подписка: vehicles/+/heartbeat (legacy, QoS 0)');
    });
    
    // Старые топики (совместимость с предыдущими версиями)
    client.subscribe('mapmon/vehicles/+/telemetry', { qos: 0 }, (err) => {
        if (!err) console.log('📊 Подписка: mapmon/vehicles/+/telemetry (legacy v1)');
    });
    client.subscribe('mapmon/vehicles/+/status', { qos: 0 }, (err) => {
        if (!err) console.log('📡 Подписка: mapmon/vehicles/+/status (legacy v1)');
    });
    client.subscribe('mapmon/vehicles/+/heartbeat', { qos: 0 }, (err) => {
        if (!err) console.log('💓 Подписка: mapmon/vehicles/+/heartbeat (legacy v1)');
    });
    
    console.log('');
    console.log('📡 Все подписки WQTT.RU v2.0 настроены!');
    console.log('🎯 Поддержка legacy топиков включена для обратной совместимости');
    console.log('');
});

client.on('message', (topic, message) => {
    try {
        const messageStr = message.toString();
        console.log(`📡 MQTT Received topic: ${topic}, message: ${messageStr}`);
        
        let data;
        try {
            data = JSON.parse(messageStr);
        } catch (parseError) {
            // Если не JSON, пытаемся обработать как простое значение
            console.warn('Message is not JSON, treating as simple value:', messageStr);
            data = { value: messageStr };
        }
        
        // Определяем device_id из топика или данных
        let deviceId = data.id || data.device_id || data.vehicle_id;
        if (!deviceId && topic.includes('/')) {
            const parts = topic.split('/');
            if (parts.length >= 2 && parts[0] === 'vehicles') {
                deviceId = parts[1]; // vehicles/esp32_001/telemetry -> esp32_001
            } else {
                deviceId = parts[parts.length - 1] || 'unknown';
            }
        }
        
        if (deviceId) {
            data.device_id = deviceId;
            data.vehicle_id = deviceId;
        }
        
        // Добавляем timestamp если отсутствует
        data.timestamp = data.timestamp || new Date().toISOString();
        
        // Улучшаем обработку данных для совместимости с ESP32
        if (data.lat || data.latitude || data.gps_lat) {
            data.lat = data.lat || data.latitude || data.gps_lat;
        }
        if (data.lng || data.longitude || data.lon || data.gps_lng) {
            data.lng = data.lng || data.longitude || data.lon || data.gps_lng;
        }
        if (data.speed !== undefined) {
            data.speed = parseFloat(data.speed);
        }
        if (data.battery || data.bat || data.batt) {
            data.battery = parseFloat(data.battery || data.bat || data.batt);
        }
        if (data.temperature || data.temp) {
            data.temperature = parseFloat(data.temperature || data.temp);
        }
        if (data.rpm || data.engine_rpm || data.motor_rpm) {
            data.rpm = parseFloat(data.rpm || data.engine_rpm || data.motor_rpm);
        }
        
        // Определяем статус автоматически
        if (!data.status) {
            data.status = (parseFloat(data.speed || 0) > 0) ? 'active' : 'stopped';
        }
        
        console.log(`📊 Processed data for device ${deviceId}:`, data);
        
        // Фильтруем heartbeat и status сообщения - не сохраняем их в телеметрию
        if (data.type === 'heartbeat' || topic.includes('/heartbeat') || topic.includes('/status')) {
            console.log('💓 Heartbeat/Status message - skipping telemetry save');
            return;
        }
        
        // Сохраняем только полноценные телеметрические данные
        if (data.lat !== undefined && data.lng !== undefined && data.speed !== undefined) {
            const result = db.saveTelemetry(data);
            console.log('💾 SAVED TO SQLITE - ID:', result.lastID || 'unknown');
            console.log('💾 Saved:', result.success ? 'OK' : 'ERROR');
            
            if (!result.success) {
                console.error('💾 Save error details:', result.error);
            }
        } else {
            console.log('⚠️ Incomplete telemetry data - skipping save');
        }
    } catch (error) {
        console.error('❌ Error processing MQTT message:', error.message);
        console.error('Topic:', topic);
        console.error('Message:', message.toString());
    }
});

client.on('error', (error) => console.error('❌ MQTT Error:', error.message));
