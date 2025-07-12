const mqtt = require('mqtt');
const SQLiteManager = require('./SQLiteManager.cjs');
const db = new SQLiteManager();

console.log('🔌 Connecting to WQTT.RU MQTT Collector v2.0 (m9.wqtt.ru:20264)...');
const client = mqtt.connect('mqtt://m9.wqtt.ru:20264', {
    clientId: 'mapmon-collector-v2-' + Date.now(),
    username: 'u_MZEPA5',
    password: 'L3YAUTS6',
    keepalive: 120,
    reconnectPeriod: 3000,
    connectTimeout: 15 * 1000,
    clean: true,
    protocolVersion: 4
});

// Статистика сообщений
let messageStats = {
    telemetry: 0,
    gps: 0,
    sensors: 0,
    health: 0,
    connection: 0,
    alerts: 0,
    legacy: 0,
    total: 0
};

client.on('connect', () => {
    console.log('✅ MQTT Connected - WQTT.RU Collector v2.0');
    console.log('🔐 Аутентификация прошла успешно');
    console.log('');
    
    // === ПОДПИСКИ НА ТОПИКИ v2.0 ===
    
    // Основные данные устройств
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
        if (!err) console.log('⚠️  Подписка: mapmon/vehicles/+/alerts/warnings (QoS 1)');
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
    
    console.log('');
    console.log('📡 Все подписки WQTT.RU v2.0 настроены!');
    console.log('🎯 Ожидание сообщений от ESP32 устройств...');
    console.log('');
});

client.on('message', (topic, message) => {
    try {
        const messageStr = message.toString();
        console.log(`📡 MQTT v2.0 [${topic}]: ${messageStr.substring(0, 100)}${messageStr.length > 100 ? '...' : ''}`);
        
        let data;
        try {
            data = JSON.parse(messageStr);
        } catch (parseError) {
            console.warn('⚠️ Сообщение не JSON, обрабатываем как простое значение:', messageStr);
            data = { raw_message: messageStr };
        }

        // Определяем тип сообщения и обрабатываем
        const messageType = getMessageType(topic);
        
        switch (messageType) {
            case 'telemetry':
                handleTelemetryMessage(topic, data);
                messageStats.telemetry++;
                break;
                
            case 'gps':
                handleGpsMessage(topic, data);
                messageStats.gps++;
                break;
                
            case 'sensors':
                handleSensorsMessage(topic, data);
                messageStats.sensors++;
                break;
                
            case 'health':
                handleHealthMessage(topic, data);
                messageStats.health++;
                break;
                
            case 'connection':
                handleConnectionMessage(topic, data);
                messageStats.connection++;
                break;
                
            case 'alerts':
                handleAlertsMessage(topic, data);
                messageStats.alerts++;
                break;
                
            case 'legacy':
                handleLegacyMessage(topic, data);
                messageStats.legacy++;
                break;
                
            default:
                console.warn('❓ Неизвестный тип сообщения:', topic);
        }
        
        messageStats.total++;
        
        // Статистика каждые 50 сообщений
        if (messageStats.total % 50 === 0) {
            printMessageStats();
        }
        
    } catch (error) {
        console.error('❌ Ошибка обработки сообщения MQTT:', error);
        console.error('Topic:', topic);
        console.error('Message:', message.toString());
    }
});

function getMessageType(topic) {
    if (topic.includes('/data/telemetry')) return 'telemetry';
    if (topic.includes('/data/gps')) return 'gps';
    if (topic.includes('/data/sensors')) return 'sensors';
    if (topic.includes('/status/health')) return 'health';
    if (topic.includes('/status/connection')) return 'connection';
    if (topic.includes('/alerts/')) return 'alerts';
    if (topic === 'car' || topic.includes('vehicles/') && !topic.includes('mapmon/')) return 'legacy';
    return 'unknown';
}

function handleTelemetryMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    console.log(`📊 Обработка телеметрии для ${vehicleId}`);
    
    try {
        // Сохраняем основную телеметрию в SQLite
        const telemetryData = {
            vehicle_id: vehicleId,
            timestamp: Date.now(), // Используем серверное время
            lat: data.location?.lat || data.lat || 0,
            lng: data.location?.lng || data.lng || 0,
            speed: data.motion?.speed || data.speed || 0,
            battery: data.power?.battery || data.battery || null,
            temperature: data.environment?.temperature || data.temperature || null,
            rpm: data.engine?.rpm || data.rpm || null
        };
        
        const result = saveTelemetryToDatabase(telemetryData);
        
        if (result.success) {
            console.log(`💾 ТЕЛЕМЕТРИЯ СОХРАНЕНА - ID: ${result.id}`);
            
            // Обновляем информацию о технике
            updateVehicleInfo(vehicleId, {
                name: data.vehicle_name || `Vehicle ${vehicleId}`,
                status: data.engine?.status || data.status || 'unknown',
                last_seen: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('❌ Ошибка сохранения телеметрии:', error);
    }
}

function handleGpsMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    console.log(`📍 GPS обновление для ${vehicleId}: ${data.lat}, ${data.lng} (${data.speed} км/ч)`);
    
    // GPS данные сохраняем отдельно для высокочастотного трекинга
    // Можно добавить отдельную таблицу gps_tracks в будущем
}

function handleSensorsMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    console.log(`🔧 Данные датчиков для ${vehicleId}:`, {
        fuel_level: data.sensors?.fuel_level,
        oil_pressure: data.sensors?.oil_pressure,
        hydraulic_pressure: data.sensors?.hydraulic_pressure
    });
    
    // Сохраняем данные датчиков (можно расширить схему БД)
}

function handleHealthMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    console.log(`💓 Статус здоровья ${vehicleId}:`, {
        uptime: data.system?.uptime,
        free_memory: data.system?.free_memory,
        wifi_rssi: data.system?.wifi_rssi,
        mqtt_reconnects: data.system?.mqtt_reconnects
    });
    
    // Обновляем статус здоровья устройства
    updateVehicleHealth(vehicleId, data);
}

function handleConnectionMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    console.log(`🔌 Статус подключения ${vehicleId}: ${data.status}`);
    
    // Обновляем статус подключения
    updateVehicleConnectionStatus(vehicleId, data.status, data.rssi);
}

function handleAlertsMessage(topic, data) {
    const vehicleId = extractVehicleId(topic, data);
    if (!vehicleId) return;
    
    const alertLevel = topic.includes('/critical') ? 'CRITICAL' : 'WARNING';
    console.log(`⚠️ ${alertLevel} ALERT ${vehicleId}: ${data.message}`);
    
    // Сохраняем уведомления (можно добавить таблицу alerts)
    logAlert(vehicleId, alertLevel, data.message, data.priority);
}

function handleLegacyMessage(topic, data) {
    console.log(`🚗 Legacy сообщение [${topic}] - конвертируем в новый формат`);
    
    // Конвертируем legacy формат в новый
    const convertedData = convertLegacyToV2(data);
    
    if (convertedData.vehicle_id) {
        // Сохраняем как телеметрию
        const telemetryData = {
            vehicle_id: convertedData.vehicle_id,
            timestamp: Date.now(),
            lat: convertedData.lat || 0,
            lng: convertedData.lng || 0,
            speed: convertedData.speed || 0,
            battery: convertedData.battery || null,
            temperature: convertedData.temperature || null,
            rpm: convertedData.rpm || null
        };
        
        const result = saveTelemetryToDatabase(telemetryData);
        if (result.success) {
            console.log(`💾 LEGACY ТЕЛЕМЕТРИЯ СОХРАНЕНА - ID: ${result.id}`);
        }
    }
}

function extractVehicleId(topic, data) {
    // Извлекаем vehicle_id из топика или данных
    const topicParts = topic.split('/');
    
    if (topic.startsWith('mapmon/vehicles/')) {
        return topicParts[2]; // mapmon/vehicles/ESP32_Car_2046/...
    }
    
    if (topic.startsWith('vehicles/')) {
        return topicParts[1]; // vehicles/ESP32_Car_2046/...
    }
    
    // Из данных
    return data.vehicle_id || data.id || null;
}

function saveTelemetryToDatabase(telemetryData) {
    try {
        const result = db.db.prepare(`
            INSERT INTO telemetry (vehicle_id, timestamp, lat, lng, speed, battery, temperature, rpm) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            telemetryData.vehicle_id,
            telemetryData.timestamp,
            telemetryData.lat,
            telemetryData.lng,
            telemetryData.speed,
            telemetryData.battery,
            telemetryData.temperature,
            telemetryData.rpm
        );
        
        return { success: true, id: result.lastInsertRowid };
    } catch (error) {
        console.error('❌ Ошибка сохранения в БД:', error);
        return { success: false, error: error.message };
    }
}

function updateVehicleInfo(vehicleId, info) {
    try {
        // Обновляем или создаем запись о технике
        db.db.prepare(`
            INSERT INTO vehicles (id, name, status, last_seen) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                name = excluded.name,
                status = excluded.status,
                last_seen = excluded.last_seen
        `).run(vehicleId, info.name, info.status, info.last_seen);
        
    } catch (error) {
        console.error('❌ Ошибка обновления информации о технике:', error);
    }
}

function updateVehicleHealth(vehicleId, healthData) {
    // Можно расширить схему БД для хранения данных о здоровье
    console.log(`💾 Обновление здоровья ${vehicleId} (uptime: ${healthData.system?.uptime}s)`);
}

function updateVehicleConnectionStatus(vehicleId, status, rssi) {
    // Обновляем статус подключения
    console.log(`💾 Статус подключения ${vehicleId}: ${status} (RSSI: ${rssi})`);
}

function logAlert(vehicleId, level, message, priority) {
    // Логируем уведомление
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] ${level} - ${vehicleId}: ${message} (${priority})`);
}

function convertLegacyToV2(legacyData) {
    // Конвертируем старый формат в новый
    return {
        vehicle_id: legacyData.id || legacyData.vehicle_id,
        lat: legacyData.lat,
        lng: legacyData.lng,
        speed: legacyData.speed,
        battery: legacyData.battery,
        temperature: legacyData.temperature,
        rpm: legacyData.rpm,
        status: legacyData.status
    };
}

function printMessageStats() {
    console.log('');
    console.log('📊 === СТАТИСТИКА СООБЩЕНИЙ ===');
    console.log(`📊 Телеметрия: ${messageStats.telemetry}`);
    console.log(`📍 GPS: ${messageStats.gps}`);
    console.log(`🔧 Датчики: ${messageStats.sensors}`);
    console.log(`💓 Здоровье: ${messageStats.health}`);
    console.log(`🔌 Подключения: ${messageStats.connection}`);
    console.log(`⚠️ Уведомления: ${messageStats.alerts}`);
    console.log(`🚗 Legacy: ${messageStats.legacy}`);
    console.log(`📈 Всего: ${messageStats.total}`);
    console.log('==============================');
    console.log('');
}

// Обработка ошибок подключения
client.on('error', (error) => {
    console.error('❌ MQTT Ошибка:', error.message);
});

client.on('close', () => {
    console.log('📡 MQTT соединение закрыто');
});

client.on('disconnect', () => {
    console.log('📡 MQTT отключен');
});

client.on('reconnect', () => {
    console.log('🔄 MQTT переподключение...');
});

// Логируем статистику каждые 5 минут
setInterval(() => {
    if (messageStats.total > 0) {
        printMessageStats();
    }
}, 300000);

console.log('🚀 MQTT Collector v2.0 запущен и ожидает сообщений...');