const express = require('express');
const cors = require('cors');
const SQLiteManager = require('../sqlite/SQLiteManager.cjs');
const app = express();
const db = new SQLiteManager();

app.use(cors());
app.get('/api/status', (req, res) => res.json({ status: 'API Server running with SQLite', database: 'connected' }));
app.get('/api/vehicles', (req, res) => res.json(db.getAllVehicles()));
app.get('/api/telemetry', (req, res) => res.json(db.getLatestTelemetry()));
app.get('/api/telemetry/latest', (req, res) => res.json(db.getLatestTelemetry()));

app.listen(3001, () => console.log('✅ API Server - SQLite'));
