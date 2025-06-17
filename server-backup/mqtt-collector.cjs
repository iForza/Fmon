const mqtt = require('mqtt');
const SQLiteManager = require('../sqlite/SQLiteManager.cjs');
const db = new SQLiteManager();

console.log('🔌 Connecting to EMQX Cloud (correct URL)...');
const client = mqtt.connect('wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt', {
    clientId: 'mapmon-server-' + Date.now(),
    username: 'iforza',
    password: 'iforza'
});

client.on('connect', () => {
    console.log('✅ MQTT Connected - EMQX Cloud');
    client.subscribe('car');
    client.subscribe('vehicles/+/telemetry');
    client.subscribe('vehicles/+/status');
    client.subscribe('vehicles/+/heartbeat');
    console.log('📡 Subscribed to all ESP32 topics');
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log('📡 ESP32 Data:', topic, data);
        
        let deviceId = data.id || data.device_id;
        if (!deviceId && topic.includes('vehicles/')) {
            deviceId = topic.split('/')[1];
        }
        if (deviceId) data.device_id = deviceId;
        
        const result = db.saveTelemetry(data);
        console.log('💾 Saved:', result.success ? 'OK' : 'ERROR');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
});

client.on('error', (error) => console.error('❌ MQTT Error:', error.message));
