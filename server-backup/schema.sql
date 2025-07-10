CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS telemetry (id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id TEXT, timestamp INTEGER, lat REAL, lng REAL, speed REAL, battery REAL, temperature REAL, rpm INTEGER);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle ON telemetry(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_timestamp ON telemetry(vehicle_id, timestamp);
