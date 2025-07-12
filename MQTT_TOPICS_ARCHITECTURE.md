# 🏗️ Архитектура MQTT топиков MapMon v0.6

## 📋 **Общая структура топиков:**

```
mapmon/
├── fleet/                          # Управление парком
│   ├── discovery                   # Автоматическое обнаружение устройств
│   ├── status                      # Общий статус системы
│   └── commands                    # Глобальные команды
├── vehicles/                       # Индивидуальные устройства
│   └── {vehicle_id}/              # ID конкретного устройства
│       ├── data/                   # Данные устройства
│       │   ├── telemetry          # Основная телеметрия
│       │   ├── gps                # GPS координаты (высокочастотные)
│       │   ├── sensors            # Данные датчиков
│       │   └── diagnostics        # Диагностические данные
│       ├── status/                # Статусы устройства
│       │   ├── connection         # Статус подключения
│       │   ├── health             # Состояние здоровья
│       │   └── battery            # Статус батареи
│       ├── control/               # Управление устройством
│       │   ├── commands           # Команды устройству
│       │   ├── config             # Конфигурация
│       │   └── firmware           # Обновления прошивки
│       └── alerts/                # Уведомления и тревоги
│           ├── critical           # Критические уведомления
│           ├── warnings           # Предупреждения
│           └── info               # Информационные сообщения
└── system/                         # Системные топики
    ├── logs                        # Системные логи
    ├── metrics                     # Метрики производительности
    └── heartbeat                   # Системный heartbeat
```

## 🚜 **Топики для ESP32 устройств:**

### **Исходящие данные (ESP32 → Сервер):**
- `mapmon/vehicles/{vehicle_id}/data/telemetry` - основная телеметрия (5 сек)
- `mapmon/vehicles/{vehicle_id}/data/gps` - GPS данные (1-2 сек при движении)
- `mapmon/vehicles/{vehicle_id}/data/sensors` - данные датчиков (10 сек)
- `mapmon/vehicles/{vehicle_id}/status/connection` - статус подключения
- `mapmon/vehicles/{vehicle_id}/status/health` - состояние системы (30 сек)
- `mapmon/vehicles/{vehicle_id}/alerts/critical` - критические уведомления
- `mapmon/vehicles/{vehicle_id}/alerts/warnings` - предупреждения

### **Входящие команды (Сервер → ESP32):**
- `mapmon/vehicles/{vehicle_id}/control/commands` - команды управления
- `mapmon/vehicles/{vehicle_id}/control/config` - изменение конфигурации
- `mapmon/fleet/commands` - глобальные команды для всех устройств

## 🖥️ **Топики для сервера:**

### **Подписки (входящие):**
- `mapmon/vehicles/+/data/+` - все данные от всех устройств
- `mapmon/vehicles/+/status/+` - все статусы устройств
- `mapmon/vehicles/+/alerts/+` - все уведомления
- `mapmon/fleet/discovery` - обнаружение новых устройств

### **Публикации (исходящие):**
- `mapmon/fleet/status` - общий статус системы
- `mapmon/vehicles/{vehicle_id}/control/commands` - команды устройствам
- `mapmon/system/metrics` - метрики сервера

## 📊 **Структура сообщений:**

### **Телеметрия (telemetry):**
```json
{
  "timestamp": 1720012345678,
  "vehicle_id": "ESP32_Car_2046",
  "location": {
    "lat": 55.75580,
    "lng": 37.61760,
    "altitude": 156.5,
    "accuracy": 3.2
  },
  "motion": {
    "speed": 25.3,
    "heading": 135.7,
    "acceleration": 0.8
  },
  "engine": {
    "rpm": 2450,
    "status": "active",
    "load": 65.2
  },
  "power": {
    "battery": 84.5,
    "voltage": 12.6,
    "current": 2.3
  },
  "environment": {
    "temperature": 24.1,
    "humidity": 62.3
  }
}
```

### **GPS данные (высокочастотные):**
```json
{
  "timestamp": 1720012345678,
  "vehicle_id": "ESP32_Car_2046",
  "lat": 55.75580,
  "lng": 37.61760,
  "speed": 25.3,
  "heading": 135.7
}
```

### **Статус здоровья (health):**
```json
{
  "timestamp": 1720012345678,
  "vehicle_id": "ESP32_Car_2046",
  "system": {
    "uptime": 86400,
    "free_memory": 234567,
    "cpu_usage": 45.2,
    "wifi_rssi": -45,
    "mqtt_reconnects": 0
  },
  "sensors": {
    "gps_fix": true,
    "temperature_sensor": "ok",
    "battery_sensor": "ok"
  },
  "alerts_count": {
    "critical": 0,
    "warnings": 1,
    "info": 3
  }
}
```

### **Команды управления:**
```json
{
  "timestamp": 1720012345678,
  "command": "start_engine",
  "parameters": {
    "target_rpm": 1500,
    "duration": 300
  },
  "priority": "normal",
  "timeout": 30
}
```

## 🔧 **QoS уровни:**

### **QoS 0 (At most once):**
- `data/gps` - GPS данные (частые, потеря не критична)
- `data/sensors` - данные датчиков
- `system/metrics` - метрики производительности

### **QoS 1 (At least once):**
- `data/telemetry` - основная телеметрия
- `status/health` - состояние здоровья
- `alerts/warnings` - предупреждения

### **QoS 2 (Exactly once):**
- `control/commands` - команды управления
- `alerts/critical` - критические уведомления
- `status/connection` - статус подключения

## 🏷️ **Retained сообщения:**

### **Всегда Retained:**
- `status/connection` - последний статус подключения
- `status/health` - последнее состояние здоровья
- `fleet/status` - общий статус системы

### **Никогда Retained:**
- `data/gps` - GPS данные (устаревают быстро)
- `data/sensors` - данные датчиков
- `control/commands` - команды (выполняются один раз)

## 🔍 **Фильтрация и маршрутизация:**

### **Frontend подписки:**
```javascript
// Только активные данные
'mapmon/vehicles/+/data/telemetry'
'mapmon/vehicles/+/status/connection'
'mapmon/vehicles/+/alerts/critical'
'mapmon/fleet/status'
```

### **Analytics подписки:**
```javascript
// Все данные для аналитики
'mapmon/vehicles/+/data/+'
'mapmon/vehicles/+/status/+'
'mapmon/system/metrics'
```

### **Alerting подписки:**
```javascript
// Только уведомления
'mapmon/vehicles/+/alerts/+'
'mapmon/system/logs'
```

## 📈 **Масштабирование:**

### **Горизонтальное масштабирование:**
- Каждое устройство использует уникальный `vehicle_id`
- Возможность добавления устройств без конфликтов
- Балансировка нагрузки по топикам

### **Географическое разделение:**
```
mapmon/region/{region_code}/vehicles/{vehicle_id}/...
```

### **Типы устройств:**
```
mapmon/vehicles/{vehicle_id}/type/{device_type}/...
# device_type: tractor, harvester, truck, sensor_node
```

## 🛡️ **Безопасность топиков:**

### **ACL (Access Control Lists):**
```
# ESP32 устройства (только публикация данных):
u_DEVICE_001: pub mapmon/vehicles/ESP32_Car_2046/data/+
u_DEVICE_001: pub mapmon/vehicles/ESP32_Car_2046/status/+
u_DEVICE_001: pub mapmon/vehicles/ESP32_Car_2046/alerts/+
u_DEVICE_001: sub mapmon/vehicles/ESP32_Car_2046/control/+

# Сервер (полный доступ):
u_MZEPA5: pub mapmon/+
u_MZEPA5: sub mapmon/+

# Frontend (только чтение данных):
u_FRONTEND: sub mapmon/vehicles/+/data/+
u_FRONTEND: sub mapmon/vehicles/+/status/+
u_FRONTEND: sub mapmon/fleet/status
```

## 📦 **Обратная совместимость:**

Сохраняем поддержку старых топиков:
- `car` → `mapmon/vehicles/{vehicle_id}/data/telemetry`
- `vehicles/{id}/telemetry` → `mapmon/vehicles/{id}/data/telemetry`
- `vehicles/{id}/status` → `mapmon/vehicles/{id}/status/connection`
- `vehicles/{id}/heartbeat` → `mapmon/vehicles/{id}/status/health`