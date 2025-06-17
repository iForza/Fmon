const Database = require('better-sqlite3');
const path = require('path');

class SQLiteManager {
    constructor() {
        this.db = new Database(path.join(__dirname, 'mapmon.db'));
        const schema = require('fs').readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        this.db.exec(schema);
        console.log('✅ SQLite initialized');
    }

    saveTelemetry(data) {
        const vehicleId = data.device_id || 'ESP32_001';
        this.db.prepare('INSERT OR REPLACE INTO vehicles (id, name) VALUES (?, ?)').run(vehicleId, `Vehicle ${vehicleId}`);
        const result = this.db.prepare('INSERT INTO telemetry (vehicle_id, timestamp, lat, lng, speed, battery) VALUES (?, ?, ?, ?, ?, ?)').run(vehicleId, Date.now(), data.lat, data.lng, data.speed || 0, data.battery);
        console.log('💾 SAVED TO SQLITE - ID:', result.lastInsertRowid);
        return { success: true, id: result.lastInsertRowid };
    }

    getAllVehicles() { return this.db.prepare('SELECT * FROM vehicles').all(); }
    getLatestTelemetry() { return this.db.prepare('SELECT t.*, v.name as vehicle_name FROM telemetry t JOIN vehicles v ON t.vehicle_id = v.id ORDER BY t.timestamp DESC LIMIT 100').all(); }
}

module.exports = SQLiteManager;
