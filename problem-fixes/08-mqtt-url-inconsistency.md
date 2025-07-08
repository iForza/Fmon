# 🔧 ПЛАН РЕШЕНИЯ: Несогласованность MQTT URL

## 🚨 ПРОБЛЕМА
**Разные MQTT брокеры и порты используются в разных компонентах системы**

### Текущее состояние:
- ESP32: `test.mosquitto.org:1883` (TCP)
- Веб: `test.mosquitto.org:8081` (WebSocket) 
- mqtt-collector: возможно другой URL

## 🎯 ЦЕЛЬ
Унифицировать MQTT конфигурацию и создать централизованные настройки

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Создать конфигурационный файл
```javascript
// config/mqtt.js
export const MQTT_CONFIG = {
  BROKER_TCP: 'test.mosquitto.org',
  BROKER_WS: 'test.mosquitto.org',
  PORT_TCP: 1883,
  PORT_WS: 8080,
  TOPICS: {
    TELEMETRY: 'vehicles/+/telemetry',
    STATUS: 'vehicles/+/status',
    HEARTBEAT: 'vehicles/+/heartbeat',
    LEGACY: 'car'
  }
}
```

### Шаг 2: Обновить все компоненты
- Использовать единую конфигурацию
- Проверить URL во всех файлах

### Шаг 3: Переменные окружения
```bash
# .env
MQTT_BROKER_TCP=test.mosquitto.org
MQTT_BROKER_WS=test.mosquitto.org
MQTT_PORT_TCP=1883
MQTT_PORT_WS=8080
```

## 🧪 ТЕСТИРОВАНИЕ
- Проверить подключение всех компонентов
- Убедиться в совместимости портов

## ✅ ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ
- Единая конфигурация MQTT
- Легкость изменения настроек 