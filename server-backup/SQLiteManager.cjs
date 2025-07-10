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
        const vehicleId = data.device_id || data.id || 'ESP32_001';
        const vehicleName = data.name || `Vehicle ${vehicleId}`;
        
        // Сохраняем/обновляем информацию о технике
        this.db.prepare('INSERT OR REPLACE INTO vehicles (id, name) VALUES (?, ?)').run(vehicleId, vehicleName);
        
        // Сохраняем телеметрию с поддержкой температуры и RPM
        const result = this.db.prepare(`
            INSERT INTO telemetry (vehicle_id, timestamp, lat, lng, speed, battery, temperature, rpm) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            vehicleId, 
            Date.now(), 
            data.lat || 0, 
            data.lng || 0, 
            data.speed || 0, 
            data.battery || null,
            data.temperature || null,
            data.rpm || null
        );
        
        console.log('💾 SAVED TO SQLITE - ID:', result.lastInsertRowid);
        return { success: true, id: result.lastInsertRowid };
    }

    getAllVehicles() { 
        return this.db.prepare('SELECT * FROM vehicles').all(); 
    }
    
    getLatestTelemetry() { 
        return this.db.prepare(`
            SELECT t.*, v.name as vehicle_name 
            FROM telemetry t 
            JOIN vehicles v ON t.vehicle_id = v.id 
            ORDER BY t.timestamp DESC 
            LIMIT 100
        `).all(); 
    }

    getLatestTelemetryForVehicle(vehicleId) {
        return this.db.prepare(`
            SELECT t.*, v.name as vehicle_name 
            FROM telemetry t 
            JOIN vehicles v ON t.vehicle_id = v.id 
            WHERE t.vehicle_id = ? 
            ORDER BY t.timestamp DESC 
            LIMIT 1
        `).get(vehicleId); 
    }

    getTelemetryHistory(vehicleId = null, hours = 1) {
        const timeLimit = Date.now() - (hours * 60 * 60 * 1000);
        let query = `
            SELECT t.*, v.name as vehicle_name 
            FROM telemetry t 
            JOIN vehicles v ON t.vehicle_id = v.id 
            WHERE t.timestamp > ?
        `;
        let params = [timeLimit];
        
        if (vehicleId) {
            query += ' AND t.vehicle_id = ?';
            params.push(vehicleId);
        }
        
        query += ' ORDER BY t.timestamp ASC';
        
        return this.db.prepare(query).all(...params);
    }

    // Новый метод для получения телеметрии после определенного timestamp (для delta-запросов)
    getLatestTelemetryAfter(lastTimestamp) {
        return this.db.prepare(`
            SELECT t.*, v.name as vehicle_name 
            FROM telemetry t 
            JOIN vehicles v ON t.vehicle_id = v.id 
            WHERE t.timestamp > ? 
            ORDER BY t.timestamp DESC 
            LIMIT 50
        `).all(lastTimestamp || 0);
    }
}

module.exports = SQLiteManager;
