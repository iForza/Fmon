# 🔍 ДИАГНОСТИКА ДАННЫХ ESP32 НА VPS

## 🎯 **ЦЕЛЬ:**
Найти где реально хранятся данные ESP32 и откуда левая панель пытается их получить.

## 📊 **КОМАНДЫ ДИАГНОСТИКИ ДАННЫХ:**

### **1. Найти базу данных и проверить содержимое:**
```bash
# Найти все SQLite базы данных
find /var/www/mapmon -name "*.db" -type f

# Проверить размер и дату изменения БД
ls -la /var/www/mapmon/server-backup/mapmon.db

# Посмотреть структуру таблиц в БД
cd /var/www/mapmon
sqlite3 server-backup/mapmon.db ".tables"

# Посмотреть последние записи в таблицах
sqlite3 server-backup/mapmon.db "SELECT * FROM vehicles LIMIT 5;"
sqlite3 server-backup/mapmon.db "SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 10;"
```

### **2. Проверить API эндпоинты с реальными данными:**
```bash
# API статус
curl -s http://localhost:3001/api/status | jq

# Список техники через API
curl -s http://localhost:3001/api/vehicles | jq

# Последние данные телеметрии
curl -s http://localhost:3001/api/telemetry/latest | jq

# Данные конкретного устройства ESP32_Car_2046
curl -s "http://localhost:3001/api/telemetry/latest?vehicleId=ESP32_Car_2046" | jq
```

### **3. Проверить MQTT сборщик данных:**
```bash
# Логи MQTT collector
pm2 logs mqtt-collector --lines 20

# Проверить конфигурацию MQTT
cat /var/www/mapmon/server-backup/mqtt-collector.cjs | grep -A 10 -B 10 "ESP32"

# Проверить куда MQTT сохраняет данные
grep -n "INSERT\|UPDATE" /var/www/mapmon/server-backup/mqtt-collector.cjs
```

### **4. Проверить API сервер и его подключение к БД:**
```bash
# Логи API сервера
pm2 logs mapmon-api --lines 20

# Проверить как API подключается к БД
cat /var/www/mapmon/server-backup/api-server.cjs | grep -A 5 -B 5 "sqlite\|database"

# Проверить SQL запросы в API
grep -n "SELECT\|FROM" /var/www/mapmon/server-backup/api-server.cjs
```

### **5. Тест внешних запросов к API:**
```bash
# Через nginx (как делает frontend)
curl -s "https://fleetmonitor.ru/api/vehicles" | jq
curl -s "https://fleetmonitor.ru/api/telemetry/latest" | jq

# Прямо к API (минуя nginx)
curl -s "http://localhost:3001/api/vehicles" | jq
curl -s "http://localhost:3001/api/telemetry/latest" | jq
```

## 🔍 **КОМАНДЫ ДЛЯ АНАЛИЗА FRONTEND:**

### **6. Найти код левой панели:**
```bash
# Найти компоненты левой панели
find /var/www/mapmon -name "*.vue" -type f | grep -i "panel\|sidebar\|vehicle"

# Найти где определяется список техники
find /var/www/mapmon -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "vehicles\|техник"

# Проверить композабл useApi
cat /var/www/mapmon/composables/useApi.ts | grep -A 10 -B 10 "vehicles"
```

### **7. Проверить новые компоненты левой панели:**
```bash
# VehicleListPanel - главная панель
cat /var/www/mapmon/components/VehicleListPanel.vue | grep -A 5 -B 5 "api\|fetch\|vehicles"

# VehicleManager - менеджер устройств  
cat /var/www/mapmon/composables/useVehicleManager.ts | grep -A 10 -B 10 "api\|fetch"

# Главный app.vue
cat /var/www/mapmon/app.vue | grep -A 10 -B 10 "VehicleListPanel\|api"
```

### **8. Проверить URL'ы API запросов:**
```bash
# Найти все API запросы в коде
find /var/www/mapmon -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -n "'/api/" 

# Найти базовые URL для API
find /var/www/mapmon -name "*.ts" -o -name "*.js" | xargs grep -n "baseURL\|BASE_URL\|apiUrl"

# Проверить настройки среды разработки
cat /var/www/mapmon/.env.example
cat /var/www/mapmon/nuxt.config.ts | grep -A 10 -B 10 "api\|proxy"
```

## 📊 **ПРОВЕРКА ЛОГОВ В РЕАЛЬНОМ ВРЕМЕНИ:**

### **9. Мониторинг запросов в реальном времени:**
```bash
# Логи nginx в реальном времени (что запрашивает frontend)
sudo tail -f /var/log/nginx/mapmon.access.log | grep "/api/"

# Логи PM2 в реальном времени
pm2 logs --lines 0

# Следить за базой данных
watch -n 2 "sqlite3 /var/www/mapmon/server-backup/mapmon.db 'SELECT COUNT(*) FROM vehicles; SELECT COUNT(*) FROM telemetry;'"
```

### **10. Сравнить данные между разными источниками:**
```bash
# Данные в БД
echo "=== ДАННЫЕ В БД ==="
sqlite3 /var/www/mapmon/server-backup/mapmon.db "SELECT id, name FROM vehicles;"

# Данные через API localhost
echo "=== ДАННЫЕ ЧЕРЕЗ API LOCALHOST ==="
curl -s http://localhost:3001/api/vehicles | jq '.data[].id'

# Данные через Nginx
echo "=== ДАННЫЕ ЧЕРЕЗ NGINX ==="
curl -s https://fleetmonitor.ru/api/vehicles | jq '.data[].id'
```

---

**🎯 ЦЕЛЬ:** Понять полный путь данных:
ESP32 → MQTT → База данных → API → Nginx → Frontend → Левая панель

Найти где происходит разрыв в этой цепочке!