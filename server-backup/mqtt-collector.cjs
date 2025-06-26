const mqtt = require('mqtt');
const SQLiteManager = require('./SQLiteManager.cjs');
const db = new SQLiteManager();

console.log('🔌 Connecting to Eclipse Mosquitto (test.mosquitto.org)...');
const client = mqtt.connect('mqtt://test.mosquitto.org:1883', {
    clientId: 'mapmon-server-' + Date.now(),
    // Аутентификация НЕ ТРЕБУЕТСЯ для публичного брокера
});

client.on('connect', () => {
    console.log('✅ MQTT Connected - Eclipse Mosquitto');
    client.subscribe('car');
    client.subscribe('vehicles/+/telemetry');
    client.subscribe('vehicles/+/status');
    client.subscribe('vehicles/+/heartbeat');
    console.log('📡 Subscribed to all ESP32 topics');
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
        
        const result = db.saveTelemetry(data);
        console.log('💾 Saved:', result.success ? 'OK' : 'ERROR');
        
        if (!result.success) {
            console.error('💾 Save error details:', result.error);
        }
    } catch (error) {
        console.error('❌ Error processing MQTT message:', error.message);
        console.error('Topic:', topic);
        console.error('Message:', message.toString());
    }
});

client.on('error', (error) => console.error('❌ MQTT Error:', error.message));
