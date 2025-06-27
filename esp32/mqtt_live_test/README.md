# 📡 ESP32 MQTT Live Test

Простой скетч для тестирования MQTT отладчика MapMon v0.5

## 🔧 **НАСТРОЙКА:**

1. **Замените WiFi данные** в `mqtt_live_test.ino`:
```cpp
const char* ssid = "YOUR_WIFI_SSID";      // Ваш WiFi
const char* password = "YOUR_WIFI_PASSWORD"; // Пароль WiFi
```

2. **Установите библиотеки** в Arduino IDE:
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon
   - `WiFi` (встроенная в ESP32)

## 📡 **ЧТО ОТПРАВЛЯЕТ:**

### **Телеметрия (каждые 3 сек) → топик `car`:**
```json
{
  "id": "ESP32_Car_2046",
  "lat": 55.7558,
  "lng": 37.6176, 
  "speed": 45,
  "battery": 87.3,
  "temperature": 28.5,
  "rpm": 2250,
  "messageCount": 123
}
```

### **Heartbeat (каждые 15 сек) → `vehicles/ESP32_Car_2046/heartbeat`:**
```json
{
  "device_id": "ESP32_Car_2046",
  "uptime": 1850,
  "rssi": -45,
  "freeHeap": 234567
}
```

### **Статус (каждые 30 сек) → `vehicles/ESP32_Car_2046/status`:**
```json
{
  "device_id": "ESP32_Car_2046", 
  "status": "active",
  "rssi": -45,
  "ip": "192.168.1.100"
}
```

## 🎯 **КАК ИСПОЛЬЗОВАТЬ:**

1. Загрузите скетч на ESP32
2. Откройте Serial Monitor (115200 baud)
3. Дождитесь подключения к WiFi и MQTT
4. Откройте MapMon → История → MQTT Отладка
5. Увидите live данные в консоли отладчика

## ⚡ **ПОЛЕЗНЫЕ КОМАНДЫ:**

### **Мониторинг MQTT (Linux/Mac):**
```bash
# Подписка на все топики ESP32
mosquitto_sub -h test.mosquitto.org -t "car" -t "vehicles/+/+"

# Только телеметрия
mosquitto_sub -h test.mosquitto.org -t "car"
```

### **Отправка тестового сообщения:**
```bash
mosquitto_pub -h test.mosquitto.org -t "car" -m '{"test":"message"}'
```

## 🐛 **ОТЛАДКА:**

### **ESP32 не подключается к WiFi:**
- Проверьте SSID и пароль
- Убедитесь что WiFi 2.4GHz (не 5GHz)

### **MQTT не подключается:**
- Проверьте интернет соединение
- test.mosquitto.org иногда недоступен - попробуйте позже

### **Данные не видны в отладчике:**
- Откройте DevTools → Network → WS 
- Должно быть соединение с test.mosquitto.org:8081
- Если нет - активируется демо режим

## 📊 **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**

В MQTT отладчике MapMon увидите:
- 🟢 **TELEMETRY**: координаты, скорость, батарея
- 🔵 **HEARTBEAT**: uptime, RSSI, память  
- 🟣 **STATUS**: статус устройства
- 📈 **Статистика**: количество сообщений и устройств

---
**Создано для MapMon v0.5 MQTT Live Debugger** 🚀 