CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS telemetry (id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id TEXT, timestamp INTEGER, lat REAL, lng REAL, speed REAL, battery REAL);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle ON telemetry(vehicle_id);
