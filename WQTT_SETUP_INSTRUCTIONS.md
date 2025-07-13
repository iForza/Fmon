# 🚀 Инструкция по настройке WQTT.RU брокера

## ✅ Что уже сделано:

### 1. **Создан ESP32 скетч**: `esp32/wqtt_fleet_tracker.ino`
- Подключение к `m9.wqtt.ru:20264` с аутентификацией
- Логин: `u_MZEPA5`, Пароль: `L3YAUTS6`
- Улучшенная диагностика и мониторинг
- Автоматическое переподключение при сбоях
- Топики с префиксом `mapmon/` для избежания конфликтов

### 2. **Обновлен MQTT collector**: `server-backup/mqtt-collector.cjs`
- Переключен на `m9.wqtt.ru:20264`
- Добавлена аутентификация с предоставленными учетными данными
- Подписка на новые топики `mapmon/vehicles/+/...`
- Сохранена обратная совместимость со старыми топиками

## 🔧 Пошаговая инструкция:

### **Шаг 1: Загрузить ESP32 скетч**
```arduino
1. Откройте Arduino IDE
2. Загрузите файл: esp32/wqtt_fleet_tracker.ino
3. Измените WiFi данные:
   const char* ssid = "ВАШ_WIFI";
   const char* password = "ВАШ_ПАРОЛЬ";
4. Проверьте настройки WQTT.RU (уже настроены):
   const char* mqtt_server = "m9.wqtt.ru";
   const int mqtt_port = 20264;
   const char* mqtt_username = "u_MZEPA5";
   const char* mqtt_password = "L3YAUTS6";
5. Загрузите на ESP32
6. Откройте Serial Monitor (115200 baud)
```

### **Шаг 2: Перезапустить MQTT collector на VPS**
```bash
cd /var/www/mapmon
pm2 stop mqtt-collector
pm2 start mqtt-collector
pm2 logs mqtt-collector --lines 30
```

### **Шаг 3: Проверить подключение**

**В Serial Monitor ESP32 должны увидеть:**
```
✅ MQTT Connected - WQTT.RU
📡 Подписка на команды: mapmon/vehicles/ESP32_Car_2046/commands
🎉 Готов к передаче данных!
📊 [1] ТЕЛЕМЕТРИЯ → WQTT.RU
```

**В логах VPS должны увидеть:**
```bash
pm2 logs mqtt-collector --lines 20

# Должно быть:
✅ MQTT Connected - WQTT.RU
🔐 Аутентификация прошла успешно
📊 Подписка на телеметрию: mapmon/vehicles/+/telemetry
📡 MQTT Received topic: mapmon/vehicles/ESP32_Car_2046/telemetry
💾 SAVED TO SQLITE - ID: 12345
```

## 🔍 **Настройки WQTT.RU брокера:**

```javascript
// Данные подключения (уже в коде):
Сервер: m9.wqtt.ru
Порт TCP: 20264
Порт TLS: 20265
WebSocket TLS: 20267
Пользователь: u_MZEPA5
Пароль: L3YAUTS6
```

## 📊 **Топики MQTT:**

### **Новые топики (рекомендуемые):**
- `mapmon/vehicles/ESP32_Car_2046/telemetry` - основные данные телеметрии
- `mapmon/vehicles/ESP32_Car_2046/status` - статус подключения/отключения
- `mapmon/vehicles/ESP32_Car_2046/heartbeat` - проверка связи
- `mapmon/vehicles/ESP32_Car_2046/commands` - команды устройству

### **Legacy топики (для совместимости):**
- `car` - старый формат телеметрии
- `vehicles/ESP32_Car_2046/telemetry`
- `vehicles/ESP32_Car_2046/status`
- `vehicles/ESP32_Car_2046/heartbeat`

## 🚀 **Улучшения в ESP32 скетче:**

### **Диагностика и мониторинг:**
- ✅ Подробные логи подключения с расшифровкой ошибок
- ✅ Системная информация каждые 2 минуты
- ✅ Мониторинг качества WiFi сигнала
- ✅ Счетчики сообщений и переподключений
- ✅ Время соединения с MQTT брокером

### **Стабильность:**
- ✅ Улучшенная логика переподключения (до 30 попыток)
- ✅ Проверка WiFi каждые 15 секунд
- ✅ Автоматическая перезагрузка при критических сбоях
- ✅ Watchdog защита от зависания

### **Симуляция данных:**
- ✅ Реалистичное движение с переменными скоростями (10-50 км/ч)
- ✅ Плавное изменение координат GPS
- ✅ Симуляция разряда батареи и температуры
- ✅ Режим "low_battery" при низком заряде

## 🔧 **Команды для ESP32:**

Отправьте в топик `mapmon/vehicles/ESP32_Car_2046/commands`:
- `start` - начать движение
- `stop` - остановиться  
- `reboot` - перезагрузить ESP32

## 📱 **Мониторинг в реальном времени:**

### **ESP32 Serial Monitor:**
```
📊 [123] ТЕЛЕМЕТРИЯ → WQTT.RU
    📍 55.75580, 37.61760 | 🏃 25.3 км/ч | 🔋 84.2% | 🌡️ 24.1°C | active
    📡 RSSI: -45 dBm | 🧠 RAM: 234567 bytes
💓 HEARTBEAT → WQTT.RU (uptime: 245s, msg: 49, conn: 120s)

🔍 === СИСТЕМНАЯ ИНФОРМАЦИЯ ===
⏰ Uptime: 300 секунд
🔗 MQTT соединение: 180 секунд
📊 Сообщений отправлено: 60
🔄 Переподключений: 0
📶 WiFi RSSI: -45 dBm
```

### **VPS Логи:**
```bash
pm2 logs mqtt-collector --lines 10

# Должно быть:
📡 MQTT Received topic: mapmon/vehicles/ESP32_Car_2046/telemetry
📊 Processed data for device ESP32_Car_2046: {...}
💾 SAVED TO SQLITE - ID: 12345
```

### **API Проверка:**
```bash
# Проверить что данные дошли до API:
curl -s http://localhost:3001/api/vehicles | jq
curl -s http://localhost:3001/api/telemetry/latest | jq

# Через Nginx (если настроен):
curl -s https://fleetmonitor.ru/api/vehicles | jq
```

## 🐛 **Troubleshooting:**

### **ESP32 не подключается к WQTT.RU:**
1. **Проверьте WiFi:** Убедитесь что ESP32 подключен к WiFi
2. **Проверьте учетные данные:** `u_MZEPA5` / `L3YAUTS6`
3. **Проверьте порт:** `20264` для TCP
4. **Serial Monitor ошибки:**
   - Код 4 = "Неверные учетные данные"
   - Код 3 = "Сервер недоступен"
   - Код -4 = "Таймаут подключения"

### **VPS не получает данные:**
```bash
# Проверить логи collector:
pm2 logs mqtt-collector --lines 50

# Перезапустить если нужно:
pm2 restart mqtt-collector

# Проверить подключение к WQTT.RU:
# Должно быть "✅ MQTT Connected - WQTT.RU"
```

### **Панель не показывает устройства:**
1. **Сначала убедитесь что данные приходят в API:**
   ```bash
   curl http://localhost:3001/api/vehicles
   ```
2. **Проверьте что timestamp не слишком старый**
3. **Исправьте race conditions** в useVehicleManager.ts
4. **Увеличьте временные пороги** с 30 сек до 2-5 минут

## 🔄 **Откат к старому брокеру** (если нужно):
```bash
# На VPS:
cd /var/www/mapmon
git checkout HEAD -- server-backup/mqtt-collector.cjs
pm2 restart mqtt-collector

# На ESP32:
# Загрузите старый скетч esp32/mqtt_test/mqtt_test.ino
```

## 💡 **Дополнительные возможности WQTT.RU:**

### **TLS подключение** (опционально):
```arduino
// В ESP32 скетче измените:
const int mqtt_tls_port = 20265;
WiFiClientSecure espClientSecure;
espClientSecure.setInsecure(); // Отключить проверку сертификата
client.setClient(espClientSecure);
client.setServer(mqtt_server, mqtt_tls_port);
```

### **WebSocket подключение** (для браузеров):
- Порт: 20267 (WebSocket TLS)
- Можно использовать для прямого подключения frontend к MQTT

### **Мониторинг брокера:**
- WQTT.RU предоставляет веб-интерфейс для мониторинга
- Логин: `u_MZEPA5` / `L3YAUTS6`
- Можно посмотреть активные подключения и статистику

## ✅ **Что это решает:**

1. **Стабильное MQTT соединение** - WQTT.RU надежнее публичных брокеров
2. **Аутентификация** - защищенное подключение с логином/паролем  
3. **Отсутствие конфликтов** - приватные топики с префиксом `mapmon/`
4. **Подробная диагностика** - легче отлаживать проблемы
5. **Автоматическое восстановление** - система сама восстанавливается после сбоев

После настройки WQTT.RU у вас будет стабильный поток данных от ESP32 к серверу!