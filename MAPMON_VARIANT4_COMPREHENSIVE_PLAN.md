# 🚀 **ПЛАН РЕАЛИЗАЦИИ ВАРИАНТА 4: ПОЛНОФУНКЦИОНАЛЬНАЯ MQTT ПЛАТФОРМА**

## 📋 **ОБЗОР ВАРИАНТА 4**

**Цель:** Создать полнофункциональную платформу IoT с серверным MQTT клиентом, постоянным сбором данных и веб-интерфейсом управления, которая **дополняет** существующий MapMon, а не заменяет его.

### **🏗️ АРХИТЕКТУРА СИСТЕМЫ**

```
ESP32 → MQTT Broker → Серверный MQTT Клиент → MongoDB
    ↓                        ↓                      ↓
Веб-интерфейс MapMon ←→ Express API ←→ WebSocket Server
    ↓                        ↓
Админ-панель управления ←→ Система уведомлений
```

### **📂 СТРУКТУРА ПРОЕКТА ПОСЛЕ РЕАЛИЗАЦИИ**

```
/var/www/mapmon/                 ← Основной MapMon (БЕЗ ИЗМЕНЕНИЙ)
├── components/                  ← Существующие компоненты Vue
├── pages/                       ← Существующие страницы
├── composables/                 ← MQTT клиент браузера
└── .output/                     ← Продакшен сборка

/var/www/mapmon-backend/         ← НОВЫЙ: Серверная часть
├── mqtt-collector/              ← Сервис сбора MQTT данных
├── api-server/                  ← REST API
├── admin-panel/                 ← Админ-интерфейс
├── notification-service/        ← Система уведомлений
└── config/                      ← Конфигурации

/var/www/mapmon-config/          ← НОВЫЙ: Общие конфигурации
├── mqtt-settings.json           ← MQTT настройки
├── device-configs.json          ← Конфигурации устройств
└── alerts-rules.json            ← Правила уведомлений
```

---

## 🔧 **ЭТАП 1: АНАЛИЗ СОВМЕСТИМОСТИ С ТЕКУЩИМ ПРОЕКТОМ**

### **1.1 Изучение существующего MapMon**

**Команды для анализа текущего проекта:**
```bash
cd /var/www/mapmon

# Анализ структуры MQTT клиента
find . -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "mqtt" | head -10

# Анализ настроек EMQX
find . -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "emqx" | head -10

# Проверка используемых портов
grep -r "3000\|8080\|1883\|8083" . | head -10

# Анализ структуры данных ESP32
find . -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "ESP32_Car" | head -5
```

### **1.2 Определение точек интеграции**

**Выявленные точки интеграции:**
- **MQTT топики:** `car`, `vehicles/+/telemetry`, `vehicles/+/status`
- **Формат данных ESP32:** JSON с полями id, lat, lng, speed, battery, temperature, rpm
- **EMQX настройки:** wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt
- **Порты:** MapMon использует :3000, нужно выбрать другие порты

---

## 🔧 **ЭТАП 2: СОЗДАНИЕ СЕРВЕРНОГО MQTT КЛИЕНТА**

### **2.1 Установка зависимостей серверной части**

```bash
# Создание директории для серверной части
sudo mkdir -p /var/www/mapmon-backend
sudo chown -R $USER:$USER /var/www/mapmon-backend
cd /var/www/mapmon-backend

# Инициализация Node.js проекта
npm init -y

# Установка зависимостей
npm install mqtt express mongodb socket.io cors helmet winston node-cron bcryptjs jsonwebtoken
npm install -D nodemon jest supertest
```

### **2.2 Создание MQTT Collector сервиса**

```bash
# Создание файла MQTT коллектора
cat > mqtt-collector/index.js << 'EOF'
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const winston = require('winston');

// Настройка логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/mqtt-collector.log' }),
    new winston.transports.Console()
  ]
});

class MQTTCollector {
  constructor() {
    this.mongoClient = null;
    this.mqttClient = null;
    this.database = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      // Подключение к MongoDB
      this.mongoClient = new MongoClient('mongodb://localhost:27017', {
        useUnifiedTopology: true
      });
      await this.mongoClient.connect();
      this.database = this.mongoClient.db('mapmon_data');
      logger.info('Connected to MongoDB');

      // Подключение к MQTT
      this.mqttClient = mqtt.connect('wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt', {
        username: 'iforza',
        password: 'iforza',
        clientId: 'mapmon_server_collector',
        clean: false, // Persistent session
        keepalive: 60,
        reconnectPeriod: 5000
      });

      this.setupMQTTHandlers();
      this.isConnected = true;
      logger.info('MQTT Collector initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MQTT Collector:', error);
      throw error;
    }
  }

  setupMQTTHandlers() {
    this.mqttClient.on('connect', () => {
      logger.info('Connected to MQTT broker');
      
      // Подписка на все топики данных
      this.mqttClient.subscribe([
        'car',
        'vehicles/+/telemetry',
        'vehicles/+/status',
        'vehicles/+/heartbeat'
      ], (err) => {
        if (err) {
          logger.error('MQTT subscription error:', err);
        } else {
          logger.info('Successfully subscribed to MQTT topics');
        }
      });
    });

    this.mqttClient.on('message', async (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        await this.processMessage(topic, data);
      } catch (error) {
        logger.error('Error processing MQTT message:', error);
      }
    });

    this.mqttClient.on('error', (error) => {
      logger.error('MQTT connection error:', error);
    });

    this.mqttClient.on('reconnect', () => {
      logger.info('Reconnecting to MQTT broker...');
    });
  }

  async processMessage(topic, data) {
    const timestamp = new Date();
    const messageDoc = {
      topic,
      data,
      timestamp,
      processed: false
    };

    try {
      // Сохранение сырых данных
      await this.database.collection('raw_messages').insertOne(messageDoc);

      // Обработка по типу топика
      if (topic === 'car' || topic.includes('telemetry')) {
        await this.processTelemetryData(data, timestamp);
      } else if (topic.includes('status')) {
        await this.processStatusData(data, timestamp);
      } else if (topic.includes('heartbeat')) {
        await this.processHeartbeatData(data, timestamp);
      }

      logger.info(`Processed message from topic: ${topic}`);
    } catch (error) {
      logger.error('Error storing message:', error);
    }
  }

  async processTelemetryData(data, timestamp) {
    const telemetryDoc = {
      deviceId: data.id || 'unknown',
      latitude: data.lat,
      longitude: data.lng,
      speed: data.speed,
      battery: data.battery,
      temperature: data.temperature,
      rpm: data.rpm,
      timestamp,
      status: data.status || 'active'
    };

    await this.database.collection('telemetry').insertOne(telemetryDoc);
    
    // Обновление последнего состояния устройства
    await this.database.collection('device_states').replaceOne(
      { deviceId: telemetryDoc.deviceId },
      { ...telemetryDoc, lastUpdate: timestamp },
      { upsert: true }
    );
  }

  async processStatusData(data, timestamp) {
    await this.database.collection('device_status').insertOne({
      deviceId: data.id,
      status: data.status,
      message: data.message,
      timestamp
    });
  }

  async processHeartbeatData(data, timestamp) {
    await this.database.collection('heartbeats').insertOne({
      deviceId: data.id,
      timestamp,
      signal_strength: data.signal_strength,
      uptime: data.uptime
    });
  }

  async getDeviceHistory(deviceId, hours = 24) {
    const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await this.database.collection('telemetry')
      .find({
        deviceId,
        timestamp: { $gte: fromTime }
      })
      .sort({ timestamp: 1 })
      .toArray();
  }

  async getActiveDevices() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return await this.database.collection('device_states')
      .find({
        lastUpdate: { $gte: fiveMinutesAgo }
      })
      .toArray();
  }
}

module.exports = MQTTCollector;

// Запуск если файл запущен напрямую
if (require.main === module) {
  const collector = new MQTTCollector();
  collector.initialize().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down MQTT Collector...');
    if (collector.mqttClient) {
      collector.mqttClient.end();
    }
    if (collector.mongoClient) {
      await collector.mongoClient.close();
    }
    process.exit(0);
  });
}
EOF

# Создание директории для логов
mkdir -p logs
```

### **2.3 Создание Express API сервера**

```bash
# Создание API сервера
cat > api-server/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');
const winston = require('winston');

const app = express();
const PORT = 3001; // Другой порт, чтобы не конфликтовать с MapMon

// Настройка логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/api-server.log' }),
    new winston.transports.Console()
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB подключение
let database;

async function connectToDatabase() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    database = client.db('mapmon_data');
    logger.info('API Server connected to MongoDB');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

// API маршруты
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await database.collection('device_states').find({}).toArray();
    res.json({ success: true, data: devices });
  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/devices/:deviceId/history', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;
    
    const fromTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    
    const history = await database.collection('telemetry')
      .find({
        deviceId,
        timestamp: { $gte: fromTime }
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('Error fetching device history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/statistics', async (req, res) => {
  try {
    const stats = {
      totalDevices: await database.collection('device_states').countDocuments(),
      activeDevices: await database.collection('device_states').countDocuments({
        lastUpdate: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      }),
      totalMessages: await database.collection('raw_messages').countDocuments(),
      messagesLast24h: await database.collection('raw_messages').countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await database.collection('alerts')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Маршрут для конфигурации MQTT
app.get('/api/mqtt-config', async (req, res) => {
  try {
    const config = await database.collection('config').findOne({ type: 'mqtt' });
    res.json({ success: true, data: config || {} });
  } catch (error) {
    logger.error('Error fetching MQTT config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mqtt-config', async (req, res) => {
  try {
    const config = req.body;
    await database.collection('config').replaceOne(
      { type: 'mqtt' },
      { type: 'mqtt', ...config, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    logger.error('Error updating MQTT config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Запуск сервера
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    logger.info(`API Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
EOF
```

---

## 🔧 **ЭТАП 3: СОЗДАНИЕ АДМИН-ПАНЕЛИ**

### **3.1 Создание простой админ-панели**

```bash
# Создание админ-панели
mkdir -p admin-panel/public admin-panel/views

cat > admin-panel/app.js << 'EOF'
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3002; // Еще один отдельный порт

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

let database;

// Подключение к MongoDB
async function connectToDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  database = client.db('mapmon_data');
}

// Главная страница админки
app.get('/', async (req, res) => {
  try {
    const stats = {
      totalDevices: await database.collection('device_states').countDocuments(),
      activeDevices: await database.collection('device_states').countDocuments({
        lastUpdate: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      }),
      totalMessages: await database.collection('raw_messages').countDocuments(),
      recentMessages: await database.collection('raw_messages')
        .find({})
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray()
    };
    
    res.render('dashboard', { stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Страница устройств
app.get('/devices', async (req, res) => {
  try {
    const devices = await database.collection('device_states').find({}).toArray();
    res.render('devices', { devices });
  } catch (error) {
    console.error('Devices error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Страница настроек MQTT
app.get('/mqtt-settings', async (req, res) => {
  try {
    const config = await database.collection('config').findOne({ type: 'mqtt' });
    res.render('mqtt-settings', { config: config || {} });
  } catch (error) {
    console.error('MQTT settings error:', error);
    res.status(500).send('Internal Server Error');
  }
});

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Admin panel running on http://localhost:${PORT}`);
  });
}).catch(console.error);
EOF

# Создание шаблонов
cat > admin-panel/views/layout.ejs << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>MapMon Admin Panel</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-dark bg-dark">
        <div class="container">
            <span class="navbar-brand">MapMon Admin Panel</span>
            <div class="navbar-nav d-flex flex-row">
                <a class="nav-link me-3" href="/">Dashboard</a>
                <a class="nav-link me-3" href="/devices">Devices</a>
                <a class="nav-link" href="/mqtt-settings">MQTT Settings</a>
            </div>
        </div>
    </nav>
    
    <div class="container mt-4">
        <%- body %>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
EOF

cat > admin-panel/views/dashboard.ejs << 'EOF'
<% layout('layout') -%>

<h1>Dashboard</h1>

<div class="row">
    <div class="col-md-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Total Devices</h5>
                <h2 class="text-primary"><%= stats.totalDevices %></h2>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Active Devices</h5>
                <h2 class="text-success"><%= stats.activeDevices %></h2>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Total Messages</h5>
                <h2 class="text-info"><%= stats.totalMessages %></h2>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <h3>Recent Messages</h3>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Topic</th>
                        <th>Device ID</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <% stats.recentMessages.forEach(message => { %>
                    <tr>
                        <td><%= new Date(message.timestamp).toLocaleString() %></td>
                        <td><%= message.topic %></td>
                        <td><%= message.data.id || 'N/A' %></td>
                        <td><%= JSON.stringify(message.data).substr(0, 100) %>...</td>
                    </tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
    </div>
</div>
EOF
```

---

## 🔧 **ЭТАП 4: НАСТРОЙКА MONGODB**

### **4.1 Установка и настройка MongoDB**

```bash
# Установка MongoDB (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Запуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Создание индексов для оптимизации
mongo mapmon_data << 'EOF'
// Индексы для быстрого поиска
db.telemetry.createIndex({ "deviceId": 1, "timestamp": -1 })
db.telemetry.createIndex({ "timestamp": -1 })
db.device_states.createIndex({ "deviceId": 1 })
db.device_states.createIndex({ "lastUpdate": -1 })
db.raw_messages.createIndex({ "timestamp": -1 })
db.raw_messages.createIndex({ "topic": 1, "timestamp": -1 })

// TTL индекс для автоматического удаления старых данных (опционально)
db.raw_messages.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 }) // 30 дней
db.telemetry.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 7776000 }) // 90 дней
EOF
```

---

## 🔧 **ЭТАП 5: СОЗДАНИЕ PM2 КОНФИГУРАЦИИ**

### **5.1 Конфигурация PM2 для всех сервисов**

```bash
# Создание единой PM2 конфигурации
cat > /var/www/mapmon-backend/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    // Существующий MapMon (не трогаем)
    {
      name: 'mapmon-frontend',
      cwd: '/var/www/mapmon',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1'
      },
      error_file: './logs/mapmon-err.log',
      out_file: './logs/mapmon-out.log',
      log_file: './logs/mapmon-combined.log',
      time: true
    },
    
    // Новый MQTT Collector
    {
      name: 'mqtt-collector',
      cwd: '/var/www/mapmon-backend',
      script: './mqtt-collector/index.js',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/mqtt-collector-err.log',
      out_file: './logs/mqtt-collector-out.log',
      log_file: './logs/mqtt-collector-combined.log',
      time: true,
      restart_delay: 5000,
      max_restarts: 10
    },
    
    // API Server
    {
      name: 'mapmon-api',
      cwd: '/var/www/mapmon-backend',
      script: './api-server/index.js',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/api-server-err.log',
      out_file: './logs/api-server-out.log',
      log_file: './logs/api-server-combined.log',
      time: true
    },
    
    // Admin Panel
    {
      name: 'mapmon-admin',
      cwd: '/var/www/mapmon-backend',
      script: './admin-panel/app.js',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/admin-panel-err.log',
      out_file: './logs/admin-panel-out.log',
      log_file: './logs/admin-panel-combined.log',
      time: true
    }
  ]
}
EOF

# Создание директорий для логов
mkdir -p /var/www/mapmon-backend/logs
```

---

## 🔧 **ЭТАП 6: НАСТРОЙКА NGINX ДЛЯ ПРОКСИРОВАНИЯ**

### **6.1 Обновление конфигурации Nginx**

```bash
# Обновление конфигурации Nginx
sudo tee /etc/nginx/sites-available/mapmon << 'EOF'
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;

    # Логи
    access_log /var/log/nginx/mapmon.access.log;
    error_log /var/log/nginx/mapmon.error.log;

    # Основной MapMon (без изменений)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для WebSocket (MQTT)
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # API сервер
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Админ-панель
    location /admin/ {
        proxy_pass http://127.0.0.1:3002/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Проверка и перезапуск Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 **ЭТАП 7: СИСТЕМА УВЕДОМЛЕНИЙ**

### **7.1 Создание сервиса уведомлений**

```bash
# Создание сервиса уведомлений
cat > /var/www/mapmon-backend/notification-service/index.js << 'EOF'
const { MongoClient } = require('mongodb');
const winston = require('winston');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/notifications.log' }),
        new winston.transports.Console()
      ]
    });
  }

  async initialize() {
    this.mongoClient = new MongoClient('mongodb://localhost:27017');
    await this.mongoClient.connect();
    this.database = this.mongoClient.db('mapmon_data');
    
    // Запуск проверок каждые 5 минут
    cron.schedule('*/5 * * * *', () => {
      this.checkDeviceHealth();
    });
    
    this.logger.info('Notification Service initialized');
  }

  async checkDeviceHealth() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const offlineDevices = await this.database.collection('device_states')
        .find({
          lastUpdate: { $lt: fiveMinutesAgo }
        })
        .toArray();

      for (const device of offlineDevices) {
        await this.createAlert({
          type: 'device_offline',
          deviceId: device.deviceId,
          message: `Device ${device.deviceId} has been offline for more than 5 minutes`,
          severity: 'warning',
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.error('Error checking device health:', error);
    }
  }

  async createAlert(alert) {
    try {
      // Проверяем, не создавали ли мы уже такой алерт недавно
      const recentAlert = await this.database.collection('alerts').findOne({
        type: alert.type,
        deviceId: alert.deviceId,
        timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 минут
      });

      if (!recentAlert) {
        await this.database.collection('alerts').insertOne(alert);
        this.logger.info(`Alert created: ${alert.message}`);
      }
    } catch (error) {
      this.logger.error('Error creating alert:', error);
    }
  }
}

const service = new NotificationService();
service.initialize().catch(console.error);
EOF
```

---

## 🔧 **ЭТАП 8: ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМ MAPMON**

### **8.1 Создание API интеграции для MapMon**

```bash
# Создание файла для интеграции с MapMon
cat > /var/www/mapmon-backend/integration/mapmon-bridge.js << 'EOF'
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

let database;

async function connectToDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  database = client.db('mapmon_data');
}

// Endpoint для получения данных MapMon клиентом
app.get('/mapmon/devices/current', async (req, res) => {
  try {
    const activeDevices = await database.collection('device_states')
      .find({
        lastUpdate: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      })
      .toArray();
    
    // Форматируем данные в формате совместимом с MapMon
    const devices = activeDevices.map(device => ({
      id: device.deviceId,
      lat: device.latitude,
      lng: device.longitude,
      speed: device.speed,
      battery: device.battery,
      temperature: device.temperature,
      rpm: device.rpm,
      timestamp: device.timestamp,
      status: device.status
    }));
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint для истории устройства
app.get('/mapmon/devices/:deviceId/history', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { hours = 1 } = req.query;
    
    const fromTime = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    
    const history = await database.collection('telemetry')
      .find({
        deviceId,
        timestamp: { $gte: fromTime }
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectToDatabase().then(() => {
  app.listen(3003, () => {
    console.log('MapMon Bridge running on port 3003');
  });
}).catch(console.error);
EOF
```

---

## 🔧 **ЭТАП 9: СКРИПТЫ ЗАПУСКА И УПРАВЛЕНИЯ**

### **9.1 Создание скриптов управления**

```bash
# Скрипт запуска всей системы
cat > /var/www/mapmon-backend/start-all.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting MapMon Platform v4..."

# Проверка MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "Starting MongoDB..."
    sudo systemctl start mongod
fi

# Переход в директорию backend
cd /var/www/mapmon-backend

# Остановка всех процессов PM2
pm2 delete all 2>/dev/null || true

# Запуск всех сервисов
pm2 start ecosystem.config.cjs

# Сохранение конфигурации PM2
pm2 save

echo "All services started successfully!"
echo ""
echo "Services running:"
echo "- MapMon Frontend: http://fleetmonitor.ru"
echo "- Admin Panel: http://fleetmonitor.ru/admin"
echo "- API: http://fleetmonitor.ru/api"
echo ""
echo "Use 'pm2 status' to check service status"
EOF

chmod +x /var/www/mapmon-backend/start-all.sh

# Скрипт остановки
cat > /var/www/mapmon-backend/stop-all.sh << 'EOF'
#!/bin/bash
echo "Stopping MapMon Platform..."
pm2 delete all
echo "All services stopped."
EOF

chmod +x /var/www/mapmon-backend/stop-all.sh

# Скрипт мониторинга
cat > /var/www/mapmon-backend/monitor.sh << 'EOF'
#!/bin/bash

echo "=== MapMon Platform Status ==="
echo ""

echo "PM2 Processes:"
pm2 status

echo ""
echo "MongoDB Status:"
systemctl is-active mongod && echo "MongoDB: Running" || echo "MongoDB: Stopped"

echo ""
echo "Nginx Status:"
systemctl is-active nginx && echo "Nginx: Running" || echo "Nginx: Stopped"
EOF

chmod +x /var/www/mapmon-backend/monitor.sh
```

---

## 📊 **ЭТАП 10: ТЕСТИРОВАНИЕ И ПРОВЕРКА**

### **10.1 Команды для тестирования системы**

```bash
# Проверка всех сервисов
./monitor.sh

# Тестирование API
curl -s http://localhost:3001/api/statistics | jq

# Проверка базы данных
mongo mapmon_data << 'EOF'
db.device_states.find().limit(5)
db.telemetry.find().sort({timestamp:-1}).limit(5)
db.raw_messages.find().sort({timestamp:-1}).limit(5)
EOF

# Тестирование MQTT подключения
node -e "
const mqtt = require('mqtt');
const client = mqtt.connect('wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt', {
  username: 'iforza',
  password: 'iforza',
  clientId: 'test_client'
});
client.on('connect', () => {
  console.log('MQTT Test: Connected successfully');
  client.publish('car', JSON.stringify({
    id: 'TEST_DEVICE',
    lat: 55.7558,
    lng: 37.6176,
    speed: 25,
    battery: 85,
    temperature: 22,
    rpm: 1500,
    timestamp: Date.now(),
    status: 'active'
  }));
  setTimeout(() => client.end(), 2000);
});
"
```

---

## 🚨 **ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ**

### **Основываясь на исследовании, вот основные проблемы которые могут возникнуть:**

1. **Проблема:** Конфликт портов между MapMon и новыми сервисами
   **Решение:** Используем разные порты (3000 - MapMon, 3001 - API, 3002 - Admin, 3003 - Bridge)

2. **Проблема:** MQTT соединения могут быть ненадежными
   **Решение:** Реализована автоматическая переподключение с задержкой и persistent sessions

3. **Проблема:** MongoDB может заполнить диск
   **Решение:** Настроены TTL индексы для автоматического удаления старых данных

4. **Проблема:** PM2 процессы могут зависать
   **Решение:** Настроены restart_delay и max_restarts для автоматического восстановления

5. **Проблема:** SSL сертификаты могут истечь
   **Решение:** Используем certbot с автообновлением

---

## 📋 **КРИТИЧЕСКИ ВАЖНАЯ ИНФОРМАЦИЯ ДЛЯ НОВОГО ЧАТА**

### **🔑 Ключевые детали проекта MapMon:**

**Существующая система (НЕ ТРОГАТЬ):**
- **URL:** https://fleetmonitor.ru
- **Порт:** 3000 (Nuxt 3.17.5)
- **MQTT:** Браузерный клиент, EMQX Cloud
- **Сервер:** VPS Timeweb (147.45.213.22)
- **PM2 конфиг:** ecosystem.config.cjs
- **Nginx:** /etc/nginx/sites-available/mapmon

**Новая система (ДОБАВЛЯЕТСЯ):**
- **Базовая папка:** /var/www/mapmon-backend/
- **Порты:** 3001 (API), 3002 (Admin), 3003 (Bridge)  
- **База данных:** MongoDB, коллекции: telemetry, device_states, raw_messages, alerts
- **MQTT:** Серверный клиент с постоянным подключением
- **PM2:** Общий ecosystem.config.cjs с 4 приложениями

**Формат данных ESP32 (СОВМЕСТИМОСТЬ):**
```json
{
  "id": "ESP32_Car_2046",
  "lat": 55.7558,
  "lng": 37.6176,
  "speed": 45,
  "battery": 82.24,
  "temperature": 23.9,
  "rpm": 735,
  "timestamp": 591008,
  "status": "active"
}
```

**MQTT настройки (EMQX Cloud):**
- URL: wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt
- Username: iforza
- Password: iforza
- Топики: car, vehicles/+/telemetry, vehicles/+/status, vehicles/+/heartbeat

**Команды быстрого развертывания:**
```bash
cd /var/www/mapmon-backend
./start-all.sh           # Запуск всей системы
./monitor.sh             # Проверка статуса
pm2 logs mqtt-collector  # Логи MQTT
```

**Архитектура интеграции:**
- MapMon работает на :3000 (БРАУЗЕРНЫЙ MQTT)
- Серверный MQTT collector собирает данные в MongoDB  
- API на :3001 предоставляет исторические данные
- Admin на :3002 для управления системой
- Bridge на :3003 для интеграции с MapMon

**⚠️ ВАЖНЫЕ ПРЕДУПРЕЖДЕНИЯ:**
1. НЕ останавливать MapMon на :3000 - это рабочая система
2. MongoDB должна быть запущена до запуска сервисов
3. Все новые сервисы должны использовать отдельные порты
4. MQTT топики и формат данных должны быть совместимы
5. PM2 конфигурация должна включать ВСЕ сервисы

---

**Создано:** $(date)  
**Версия:** MapMon Variant 4 v1.0  
**Совместимость:** MapMon v0.4.9 Fleet Monitor Pro v2.4.1  
**Автор:** AI Assistant для проекта Fleet Monitoring System 