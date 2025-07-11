const { createServer } = require('http')

const server = createServer((req, res) => {
  // Добавляем CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  res.setHeader('Content-Type', 'application/json')

  const url = req.url || ''
  
  if (url === '/api/status') {
    res.writeHead(200)
    res.end(JSON.stringify({
      status: 'API Server running with SQLite',
      timestamp: new Date().toISOString(),
      database: 'SQLite'
    }))
    return
  }

  if (url === '/api/vehicles') {
    const vehicles = [
      {
        id: 'ESP32_001',
        name: 'Трактор Беларус',
        lat: 55.7558,
        lng: 37.6176,
        status: 'active',
        lastUpdate: new Date()
      },
      {
        id: 'ESP32_002', 
        name: 'Комбайн John Deere',
        lat: 55.7598,
        lng: 37.6216,
        status: 'stopped',
        lastUpdate: new Date()
      }
    ]
    
    res.writeHead(200)
    res.end(JSON.stringify({
      success: true,
      data: vehicles,
      count: vehicles.length
    }))
    return
  }

  if (url === '/api/telemetry/latest' || url.startsWith('/api/telemetry/delta')) {
    const telemetry = [
      {
        vehicle_id: 'ESP32_001',
        vehicle_name: 'Трактор Беларус',
        lat: 55.7558,
        lng: 37.6176,
        speed: 15,
        battery: 85.5,
        temperature: 78.2,
        rpm: 2100,
        timestamp: Date.now()
      },
      {
        vehicle_id: 'ESP32_002',
        vehicle_name: 'Комбайн John Deere', 
        lat: 55.7598,
        lng: 37.6216,
        speed: 0,
        battery: 62.1,
        temperature: 65.8,
        rpm: 0,
        timestamp: Date.now()
      }
    ]

    res.writeHead(200)
    res.end(JSON.stringify({
      success: true,
      data: telemetry,
      count: telemetry.length,
      lastTimestamp: Date.now()
    }))
    return
  }

  if (url.startsWith('/api/telemetry/history')) {
    const vehicleData = [
      {
        vehicleId: 'ESP32_001',
        vehicleName: 'Трактор Беларус',
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 30000, // каждые 30 секунд
          speed: Math.random() * 30,
          temperature: 70 + Math.random() * 20,
          battery: 80 + Math.random() * 20,
          rpm: Math.random() * 3000
        }))
      },
      {
        vehicleId: 'ESP32_002',
        vehicleName: 'Комбайн John Deere',
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 30000,
          speed: Math.random() * 20,
          temperature: 60 + Math.random() * 25,
          battery: 60 + Math.random() * 30,
          rpm: Math.random() * 2500
        }))
      }
    ]

    res.writeHead(200)
    res.end(JSON.stringify({
      success: true,
      data: vehicleData,
      range: '10min',
      count: vehicleData.length
    }))
    return
  }

  // 404 для остальных routes
  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not Found' }))
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`🚀 Test API Server running on port ${PORT}`)
  console.log(`📍 Available endpoints:`)
  console.log(`   GET /api/status`)
  console.log(`   GET /api/vehicles`) 
  console.log(`   GET /api/telemetry/latest`)
  console.log(`   GET /api/telemetry/delta`)
  console.log(`   GET /api/telemetry/history`)
})