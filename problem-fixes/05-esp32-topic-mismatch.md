# 🔧 ПЛАН РЕШЕНИЯ: Несоответствие MQTT топиков ESP32

## 🚨 ПРОБЛЕМА
**ESP32 отправляет данные в топик `car`, а веб-отладчик ожидает `vehicles/+/telemetry`**

### Текущее состояние:
- ESP32 отправляет: `car`, `vehicles/ESP32_Car_2046/heartbeat`, `vehicles/ESP32_Car_2046/status`
- Веб ожидает: `vehicles/+/telemetry`, `vehicles/+/status`, `vehicles/+/heartbeat`, `car`
- Результат: Основные телеметрические данные не попадают в веб-интерфейс

## 🎯 ЦЕЛЬ
Унифицировать MQTT топики для корректной работы ESP32 с веб-отладчиком

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Обновить ESP32 скетч для стандартизации топиков

#### Текущий код в mqtt_live_test.ino:
```cpp
// Отправляет только в "car"
client.publish("car", payload.c_str());
```

#### Обновленный код:
```cpp
// В начале скетча добавить константы
const String DEVICE_ID = "ESP32_Car_2046";
const String BASE_TOPIC = "vehicles/" + DEVICE_ID;

// В функции отправки телеметрии
void sendTelemetry() {
  String payload = createTelemetryPayload();
  
  // Отправка в стандартный топик для веб-отладчика
  String telemetryTopic = BASE_TOPIC + "/telemetry";
  client.publish(telemetryTopic.c_str(), payload.c_str());
  
  // Дублирование в основной топик для совместимости
  client.publish("car", payload.c_str());
  
  Serial.println("Telemetry sent to: " + telemetryTopic + " and car");
}

// В функции отправки статуса
void sendStatus() {
  String statusPayload = createStatusPayload();
  String statusTopic = BASE_TOPIC + "/status";
  client.publish(statusTopic.c_str(), statusPayload.c_str());
  Serial.println("Status sent to: " + statusTopic);
}

// В функции отправки heartbeat
void sendHeartbeat() {
  String heartbeatPayload = createHeartbeatPayload();
  String heartbeatTopic = BASE_TOPIC + "/heartbeat";
  client.publish(heartbeatTopic.c_str(), heartbeatPayload.c_str());
  Serial.println("Heartbeat sent to: " + heartbeatTopic);
}
```

### Шаг 2: Создать функции для формирования payload

```cpp
String createTelemetryPayload() {
  DynamicJsonDocument doc(1024);
  
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = millis();
  doc["location"]["lat"] = 55.7558 + random(-100, 100) / 10000.0;
  doc["location"]["lng"] = 37.6176 + random(-100, 100) / 10000.0;
  doc["speed"] = random(0, 80);
  doc["heading"] = random(0, 360);
  doc["fuel"] = random(20, 100);
  doc["engine_temp"] = random(80, 105);
  doc["rpm"] = random(800, 3000);
  
  String payload;
  serializeJson(doc, payload);
  return payload;
}

String createStatusPayload() {
  DynamicJsonDocument doc(512);
  
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = millis();
  doc["status"] = "active";
  doc["battery"] = random(70, 100);
  doc["signal_strength"] = random(-80, -40);
  doc["uptime"] = millis() / 1000;
  
  String payload;
  serializeJson(doc, payload);
  return payload;
}

String createHeartbeatPayload() {
  DynamicJsonDocument doc(256);
  
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = millis();
  doc["alive"] = true;
  doc["last_seen"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  return payload;
}
```

### Шаг 3: Обновить веб-отладчик для лучшей совместимости

#### В pages/history.vue добавить обработку всех топиков:
```javascript
const MQTT_TOPICS = [
  'car',                                    // Основной топик
  'vehicles/+/telemetry',                   // Стандартная телеметрия
  'vehicles/+/status',                      // Статус устройства
  'vehicles/+/heartbeat',                   // Heartbeat
  'vehicles/ESP32_Car_2046/telemetry',      // Конкретное устройство
  'vehicles/ESP32_Car_2046/status',
  'vehicles/ESP32_Car_2046/heartbeat',
  'fleet/+/telemetry',                      // Альтернативный формат
  'iot/+/data'                             // IoT формат
];

// Подписка на все топики
MQTT_TOPICS.forEach(topic => {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`✅ Subscribed to: ${topic}`);
    } else {
      console.error(`❌ Failed to subscribe to: ${topic}`, err);
    }
  });
});
```

### Шаг 4: Добавить интеллектуальную фильтрацию сообщений

```javascript
// В обработчике MQTT сообщений
client.on('message', (topic, message) => {
  try {
    const messageStr = message.toString();
    let parsedMessage;
    
    // Попытка парсинга JSON
    try {
      parsedMessage = JSON.parse(messageStr);
    } catch (e) {
      parsedMessage = { raw: messageStr };
    }
    
    // Определение типа сообщения по топику
    let messageType = 'unknown';
    if (topic.includes('telemetry') || topic === 'car') {
      messageType = 'telemetry';
    } else if (topic.includes('status')) {
      messageType = 'status';
    } else if (topic.includes('heartbeat')) {
      messageType = 'heartbeat';
    }
    
    // Добавление метаданных
    const enrichedMessage = {
      id: Date.now() + Math.random(),
      topic,
      message: messageStr,
      parsed: parsedMessage,
      type: messageType,
      timestamp: new Date().toISOString(),
      device_id: parsedMessage.device_id || extractDeviceFromTopic(topic)
    };
    
    mqttMessages.value.unshift(enrichedMessage);
    
    // Обновление статистики
    updateStatistics(messageType, enrichedMessage.device_id);
    
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Функция для извлечения device_id из топика
function extractDeviceFromTopic(topic) {
  const match = topic.match(/vehicles\/([^\/]+)\//);
  return match ? match[1] : 'unknown';
}
```

### Шаг 5: Создать резервный ESP32 скетч с конфигурируемыми топиками

```cpp
// esp32/mqtt_configurable_test/mqtt_configurable_test.ino

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

Preferences preferences;

// Конфигурируемые параметры
String device_id = "ESP32_Car_2046";
String base_topic = "vehicles";
String legacy_topic = "car";
bool use_legacy = true;

void setup() {
  Serial.begin(115200);
  
  // Загрузка конфигурации из EEPROM
  preferences.begin("mqtt_config", false);
  device_id = preferences.getString("device_id", "ESP32_Car_2046");
  base_topic = preferences.getString("base_topic", "vehicles");
  legacy_topic = preferences.getString("legacy_topic", "car");
  use_legacy = preferences.getBool("use_legacy", true);
  
  setupWiFi();
  setupMQTT();
}

void publishToAllTopics(String payload, String messageType) {
  String standardTopic = base_topic + "/" + device_id + "/" + messageType;
  
  // Отправка в стандартный топик
  client.publish(standardTopic.c_str(), payload.c_str());
  Serial.println("Sent to: " + standardTopic);
  
  // Отправка в legacy топик для совместимости
  if (use_legacy && messageType == "telemetry") {
    client.publish(legacy_topic.c_str(), payload.c_str());
    Serial.println("Sent to legacy: " + legacy_topic);
  }
}
```

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Проверка топиков ESP32
```bash
# Мониторинг MQTT топиков
mosquitto_sub -h test.mosquitto.org -p 1883 -t "vehicles/+/telemetry" -v
mosquitto_sub -h test.mosquitto.org -p 1883 -t "car" -v
```

### Тест 2: Веб-отладчик
1. Открыть страницу /history
2. Убедиться что подключение установлено
3. Проверить получение сообщений от ESP32
4. Убедиться что статистика обновляется

### Тест 3: Интеграционный тест
1. Загрузить обновленный скетч на ESP32
2. Запустить веб-отладчик
3. Проверить что все типы сообщений отображаются
4. Убедиться в корректной фильтрации

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Проблема 1: Дублирование сообщений
```javascript
// Решение: Дедупликация по device_id + timestamp
const messageKey = `${enrichedMessage.device_id}_${enrichedMessage.timestamp}`;
if (!seenMessages.has(messageKey)) {
  seenMessages.add(messageKey);
  mqttMessages.value.unshift(enrichedMessage);
}
```

### Проблема 2: Переполнение памяти ESP32
```cpp
// Решение: Ограничить размер JSON payload
DynamicJsonDocument doc(512); // Уменьшить с 1024
```

### Проблема 3: Потеря сообщений
```cpp
// Решение: Добавить QoS и retain
client.publish(topic.c_str(), payload.c_str(), true); // retain = true
```

## 📊 ТОПИК СХЕМА (ФИНАЛЬНАЯ)

```
vehicles/
├── ESP32_Car_2046/
│   ├── telemetry     (основные данные)
│   ├── status        (статус устройства)
│   └── heartbeat     (проверка связи)
├── ESP32_Car_XXXX/   (другие устройства)
└── ...

car                   (legacy топик для совместимости)
```

## 📋 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

- [ ] Обновить ESP32 скетч с новыми топиками
- [ ] Добавить функции формирования payload
- [ ] Обновить веб-отладчик для всех топиков
- [ ] Добавить интеллектуальную фильтрацию
- [ ] Создать конфигурируемую версию скетча
- [ ] Протестировать все типы сообщений
- [ ] Проверить дедупликацию
- [ ] Протестировать на VPS

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

- ✅ ESP32 отправляет в правильные топики
- ✅ Веб-отладчик получает все сообщения
- ✅ Поддержка legacy совместимости
- ✅ Интеллектуальная типизация сообщений
- ✅ Конфигурируемость топиков
- ✅ Нет дублирования сообщений 