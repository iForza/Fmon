# 🚀 Инструкция по переходу на HiveMQ

## ✅ Что уже сделано:

### 1. **Создан новый ESP32 скетч**: `esp32/hivemq_fleet_tracker.ino`
- Подключение к `broker.hivemq.com:1883`
- Улучшенная стабильность соединения
- Автоматическое переподключение при сбоях
- Более надежная обработка WiFi
- Топики с префиксом `mapmon/` для избежания конфликтов

### 2. **Обновлен MQTT collector**: `server-backup/mqtt-collector.cjs`
- Изменен брокер с `test.mosquitto.org` на `broker.hivemq.com`
- Добавлены настройки стабильности (keepalive, reconnectPeriod, connectTimeout)
- Поддержка новых топиков с префиксом `mapmon/`
- Сохранена обратная совместимость со старыми топиками

## 🔧 Что нужно сделать:

### **Шаг 1: Загрузить новый скетч на ESP32**
```arduino
// Загрузите файл: esp32/hivemq_fleet_tracker.ino
// В Arduino IDE:
// 1. Откройте hivemq_fleet_tracker.ino
// 2. Укажите ваши WiFi данные:
const char* ssid = "ВАШ_WIFI";
const char* password = "ВАШ_ПАРОЛЬ";
// 3. Загрузите на ESP32
```

### **Шаг 2: Перезапустить MQTT collector на VPS**
```bash
# На VPS:
cd /var/www/mapmon
pm2 stop mqtt-collector
pm2 start mqtt-collector
pm2 logs mqtt-collector --lines 50
```

### **Шаг 3: Проверить подключение**
```bash
# Должны увидеть в логах:
# ✅ MQTT Connected - HiveMQ
# 📡 Subscribed to all ESP32 topics (HiveMQ + legacy)
```

## 🔍 **Основные улучшения**:

### **ESP32 скетч:**
- ✅ **Стабильность**: Улучшенное переподключение WiFi и MQTT
- ✅ **Диагностика**: Подробные логи с эмодзи для легкого чтения
- ✅ **Надежность**: Watchdog для предотвращения зависания
- ✅ **Топики**: Префикс `mapmon/` для избежания конфликтов на публичном брокере
- ✅ **Интервалы**: Телеметрия каждые 5 сек, heartbeat каждые 30 сек

### **MQTT Collector:**
- ✅ **HiveMQ**: Переход на более стабильный брокер
- ✅ **Совместимость**: Поддержка старых и новых топиков
- ✅ **Настройки**: Оптимизированные параметры подключения

### **Новые топики (с префиксом mapmon/):**
- `mapmon/vehicles/ESP32_Car_2046/telemetry` - телеметрия
- `mapmon/vehicles/ESP32_Car_2046/status` - статус подключения
- `mapmon/vehicles/ESP32_Car_2046/heartbeat` - проверка связи
- `mapmon/vehicles/ESP32_Car_2046/commands` - команды устройству

## 🐛 **Решенные проблемы**:

1. **Стабильность MQTT**: HiveMQ более надежен чем test.mosquitto.org
2. **Конфликты топиков**: Префикс `mapmon/` изолирует ваши данные
3. **Переподключения**: Улучшенная логика восстановления соединения
4. **Диагностика**: Подробные логи для отладки

## 📊 **Мониторинг**:

### **Проверка ESP32:**
```arduino
// В Serial Monitor должны видеть:
// 📊 [123] ТЕЛЕМЕТРИЯ → HiveMQ
// 📍 55.75580, 37.61760 | 🏃 15.2 км/ч | 🔋 84.5% | 🌡️ 23.1°C | active
// 💓 HEARTBEAT → HiveMQ (uptime: 245s, msg: 49)
```

### **Проверка VPS:**
```bash
pm2 logs mqtt-collector --lines 20
# Должны видеть:
# 📡 MQTT Received topic: mapmon/vehicles/ESP32_Car_2046/telemetry
# 💾 SAVED TO SQLITE - ID: 12345
```

### **Проверка API:**
```bash
curl -s http://localhost:3001/api/vehicles | jq
curl -s http://localhost:3001/api/telemetry/latest | jq
```

## 🆘 **Troubleshooting**:

### **Если ESP32 не подключается:**
1. Проверьте WiFi данные
2. Проверьте Serial Monitor (115200 baud)
3. Убедитесь что WiFi работает

### **Если не приходят данные на VPS:**
1. Проверьте логи MQTT collector: `pm2 logs mqtt-collector`
2. Проверьте что collector подключен к HiveMQ
3. Проверьте что ESP32 отправляет данные в Serial Monitor

### **Если панель не показывает устройства:**
1. Сначала решите race conditions (из предыдущего анализа)
2. Проверьте что API получает данные: `curl http://localhost:3001/api/vehicles`
3. Проверьте временные пороги в useVehicleManager.ts

## 🔄 **Откат назад** (если что-то пошло не так):
```bash
# Остановить новый collector
pm2 stop mqtt-collector

# Вернуть старый код
git checkout HEAD -- server-backup/mqtt-collector.cjs

# Запустить старый collector
pm2 start mqtt-collector
```

## 📝 **Дополнительно**:

### **Для продакшн использования рекомендуется:**
1. **HiveMQ Cloud** (платный план) для лучшей производительности
2. **TLS шифрование** (порт 8883) 
3. **Аутентификация** с username/password
4. **Retained messages** для важных статусов

### **Настройка TLS** (опционально):
В ESP32 скетче раскомментируйте:
```arduino
WiFiClientSecure espClientSecure;
espClientSecure.setInsecure();
client.setClient(espClientSecure);
client.setServer(mqtt_server, 8883);
```