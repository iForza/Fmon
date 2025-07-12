#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ===== КОНФИГУРАЦИЯ =====
// WiFi настройки
const char* ssid = "Xiaomi12";
const char* password = "12345678";

// WQTT.RU Брокер настройки
const char* mqtt_server = "m9.wqtt.ru";
const int mqtt_port = 20264;
const char* mqtt_username = "u_MZEPA5";
const char* mqtt_password = "L3YAUTS6";
const char* vehicle_id = "ESP32_Car_2046";

// ===== ТОПИКИ MQTT v2.0 =====
// Исходящие данные (ESP32 → Сервер)
String topic_telemetry = "mapmon/vehicles/" + String(vehicle_id) + "/data/telemetry";
String topic_gps = "mapmon/vehicles/" + String(vehicle_id) + "/data/gps";
String topic_sensors = "mapmon/vehicles/" + String(vehicle_id) + "/data/sensors";
String topic_connection = "mapmon/vehicles/" + String(vehicle_id) + "/status/connection";
String topic_health = "mapmon/vehicles/" + String(vehicle_id) + "/status/health";
String topic_alerts_critical = "mapmon/vehicles/" + String(vehicle_id) + "/alerts/critical";
String topic_alerts_warnings = "mapmon/vehicles/" + String(vehicle_id) + "/alerts/warnings";

// Входящие команды (Сервер → ESP32)
String topic_commands = "mapmon/vehicles/" + String(vehicle_id) + "/control/commands";
String topic_config = "mapmon/vehicles/" + String(vehicle_id) + "/control/config";
String topic_fleet_commands = "mapmon/fleet/commands";

// Обратная совместимость (legacy топики)
String topic_legacy_car = "car";
String topic_legacy_telemetry = "vehicles/" + String(vehicle_id) + "/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);

// ===== ДАННЫЕ УСТРОЙСТВА =====
// GPS и движение
float base_lat = 55.7558;
float base_lng = 37.6176;
float current_lat = base_lat;
float current_lng = base_lng;
float speed = 0;
float heading = 0;
float acceleration = 0;

// Двигатель и питание
int rpm = 0;
String engine_status = "stopped";
float battery_voltage = 12.6;
float battery_current = 0;
float battery_percentage = 85.5;

// Окружающая среда
float temperature = 22.5;
float humidity = 60.0;

// Система
unsigned long system_uptime = 0;
int wifi_rssi = 0;
uint32_t free_memory = 0;
int mqtt_reconnects = 0;

// ===== ТАЙМЕРЫ И ИНТЕРВАЛЫ =====
unsigned long lastTelemetryMsg = 0;
unsigned long lastGpsMsg = 0;
unsigned long lastSensorsMsg = 0;
unsigned long lastHealthMsg = 0;
unsigned long lastReconnectAttempt = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastMovementChange = 0;
unsigned long lastSystemInfo = 0;

const unsigned long TELEMETRY_INTERVAL = 5000;     // Основная телеметрия каждые 5 секунд
const unsigned long GPS_INTERVAL_MOVING = 2000;    // GPS при движении каждые 2 секунды
const unsigned long GPS_INTERVAL_STOPPED = 10000;  // GPS в покое каждые 10 секунд
const unsigned long SENSORS_INTERVAL = 10000;      // Датчики каждые 10 секунд
const unsigned long HEALTH_INTERVAL = 30000;       // Состояние здоровья каждые 30 секунд
const unsigned long RECONNECT_INTERVAL = 3000;     // Переподключение каждые 3 секунды
const unsigned long WIFI_CHECK_INTERVAL = 15000;   // Проверка WiFi каждые 15 секунд
const unsigned long SYSTEM_INFO_INTERVAL = 120000; // Системная информация каждые 2 минуты

// ===== СЧЕТЧИКИ И СОСТОЯНИЕ =====
unsigned long messageCount = 0;
unsigned long gpsMessageCount = 0;
unsigned long sensorMessageCount = 0;
unsigned long reconnectCount = 0;
bool mqtt_connected = false;
bool is_moving = false;
unsigned long connectionTime = 0;
int alertsCount_critical = 0;
int alertsCount_warnings = 0;
int alertsCount_info = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("==========================================");
  Serial.println("    ESP32 Fleet Tracker v2.0 (WQTT.RU)   ");
  Serial.println("==========================================");
  Serial.println("🚜 Vehicle ID: " + String(vehicle_id));
  Serial.println("🌐 MQTT Broker: " + String(mqtt_server) + ":" + String(mqtt_port));
  Serial.println("👤 Username: " + String(mqtt_username));
  Serial.println("");
  Serial.println("📡 MQTT ТОПИКИ v2.0:");
  Serial.println("  📊 Telemetry: " + topic_telemetry);
  Serial.println("  📍 GPS: " + topic_gps);
  Serial.println("  🔧 Sensors: " + topic_sensors);
  Serial.println("  💓 Health: " + topic_health);
  Serial.println("  🔌 Connection: " + topic_connection);
  Serial.println("  ⚠️ Alerts: " + topic_alerts_critical);
  Serial.println("  🎯 Commands: " + topic_commands);
  Serial.println("");
  
  // Инициализация WiFi
  setup_wifi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setKeepAlive(120);
  client.setSocketTimeout(15);
  
  Serial.println("🚀 ESP32 Fleet Tracker v2.0 готов к работе!");
  Serial.println("==========================================");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("🌐 Подключение к WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("✅ WiFi подключен успешно!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("");
    Serial.println("❌ ОШИБКА: WiFi не подключен!");
    Serial.println("🔄 Перезагрузка через 20 секунд...");
    delay(20000);
    ESP.restart();
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("📨 Команда [" + topicStr + "]: " + message);
  
  // Обработка команд
  if (topicStr == topic_commands || topicStr == topic_fleet_commands) {
    handleCommand(message);
  } else if (topicStr == topic_config) {
    handleConfig(message);
  }
}

void handleCommand(String command) {
  if (command == "start" || command == "start_engine") {
    speed = random(15, 35);
    rpm = random(1500, 2800);
    engine_status = "active";
    is_moving = true;
    Serial.println("▶️ КОМАНДА: Запуск двигателя");
    
  } else if (command == "stop" || command == "stop_engine") {
    speed = 0;
    rpm = random(700, 900);
    engine_status = "stopped";
    is_moving = false;
    Serial.println("🛑 КОМАНДА: Остановка двигателя");
    
  } else if (command == "reboot" || command == "restart") {
    Serial.println("🔄 КОМАНДА: Перезагрузка через 3 сек");
    sendAlert("info", "Получена команда перезагрузки", "normal");
    delay(3000);
    ESP.restart();
    
  } else if (command == "status" || command == "health_check") {
    Serial.println("📊 КОМАНДА: Отправка статуса здоровья");
    sendHealthMessage();
    
  } else if (command == "emergency_stop") {
    speed = 0;
    rpm = 0;
    engine_status = "emergency_stop";
    is_moving = false;
    Serial.println("🚨 КОМАНДА: Экстренная остановка!");
    sendAlert("critical", "Выполнена экстренная остановка", "high");
  }
}

void handleConfig(String config) {
  // Обработка изменений конфигурации
  Serial.println("⚙️ Получена новая конфигурация: " + config);
  
  // Парсинг JSON конфигурации
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, config);
  
  if (error) {
    Serial.println("❌ Ошибка парсинга конфигурации");
    return;
  }
  
  // Применение настроек
  if (doc.containsKey("telemetry_interval")) {
    Serial.println("⏱️ Новый интервал телеметрии: " + String(doc["telemetry_interval"].as<int>()));
  }
}

bool reconnect() {
  if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
    return false;
  }
  
  lastReconnectAttempt = millis();
  
  Serial.print("🔄 MQTT подключение (попытка #" + String(++reconnectCount) + ")...");
  
  String clientId = String(vehicle_id) + "_" + String(millis());
  
  if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
    Serial.println(" ✅ ПОДКЛЮЧЕН К WQTT.RU!");
    
    mqtt_connected = true;
    reconnectCount = 0;
    connectionTime = millis();
    
    // Подписки на команды
    client.subscribe(topic_commands.c_str());
    client.subscribe(topic_config.c_str());
    client.subscribe(topic_fleet_commands.c_str());
    Serial.println("📡 Подписки настроены");
    
    // Отправляем статус подключения
    sendConnectionStatus("connected");
    sendHealthMessage();
    
    return true;
  } else {
    Serial.print(" ❌ ОШИБКА, код: ");
    Serial.println(client.state());
    mqtt_connected = false;
    
    if (reconnectCount > 30) {
      Serial.println("🔄 Слишком много попыток. Перезагрузка...");
      delay(5000);
      ESP.restart();
    }
    
    return false;
  }
}

void sendTelemetryMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<600> doc;
  
  // Обновляем симуляцию
  updateSimulation();
  
  // Основные данные
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  
  // Местоположение
  JsonObject location = doc.createNestedObject("location");
  location["lat"] = round(current_lat * 100000) / 100000.0;
  location["lng"] = round(current_lng * 100000) / 100000.0;
  location["altitude"] = random(150, 170);
  location["accuracy"] = random(2, 5);
  
  // Движение
  JsonObject motion = doc.createNestedObject("motion");
  motion["speed"] = round(speed * 10) / 10.0;
  motion["heading"] = round(heading * 10) / 10.0;
  motion["acceleration"] = round(acceleration * 100) / 100.0;
  
  // Двигатель
  JsonObject engine = doc.createNestedObject("engine");
  engine["rpm"] = rpm;
  engine["status"] = engine_status;
  engine["load"] = random(30, 85);
  
  // Питание
  JsonObject power = doc.createNestedObject("power");
  power["battery"] = round(battery_percentage * 100) / 100.0;
  power["voltage"] = round(battery_voltage * 10) / 10.0;
  power["current"] = round(battery_current * 10) / 10.0;
  
  // Окружающая среда
  JsonObject environment = doc.createNestedObject("environment");
  environment["temperature"] = round(temperature * 10) / 10.0;
  environment["humidity"] = round(humidity * 10) / 10.0;
  
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем основную телеметрию (QoS 1)
  if (client.publish(topic_telemetry.c_str(), payload.c_str(), false)) {
    messageCount++;
    Serial.println("📊 [" + String(messageCount) + "] ТЕЛЕМЕТРИЯ → WQTT.RU");
    Serial.println("    📍 " + String(current_lat, 5) + ", " + String(current_lng, 5) + 
                   " | 🏃 " + String(speed, 1) + " км/ч | 🔋 " + String(battery_percentage, 1) + 
                   "% | 🌡️ " + String(temperature, 1) + "°C | " + engine_status);
    
    // Отправляем legacy формат для обратной совместимости
    sendLegacyTelemetry();
  } else {
    Serial.println("❌ ОШИБКА ТЕЛЕМЕТРИИ! Код: " + String(client.state()));
    mqtt_connected = false;
  }
}

void sendGpsMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<200> doc;
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  doc["lat"] = round(current_lat * 100000) / 100000.0;
  doc["lng"] = round(current_lng * 100000) / 100000.0;
  doc["speed"] = round(speed * 10) / 10.0;
  doc["heading"] = round(heading * 10) / 10.0;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(topic_gps.c_str(), payload.c_str(), false)) {
    gpsMessageCount++;
    Serial.println("📍 [" + String(gpsMessageCount) + "] GPS → WQTT.RU");
  }
}

void sendSensorsMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<300> doc;
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["fuel_level"] = random(20, 95);
  sensors["oil_pressure"] = random(2, 5);
  sensors["coolant_temp"] = random(80, 95);
  sensors["hydraulic_pressure"] = random(150, 200);
  
  JsonObject diagnostics = doc.createNestedObject("diagnostics");
  diagnostics["engine_hours"] = random(1200, 5000);
  diagnostics["service_due"] = false;
  diagnostics["error_codes"] = 0;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(topic_sensors.c_str(), payload.c_str(), false)) {
    sensorMessageCount++;
    Serial.println("🔧 [" + String(sensorMessageCount) + "] SENSORS → WQTT.RU");
  }
}

void sendHealthMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<400> doc;
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  
  // Системная информация
  JsonObject system = doc.createNestedObject("system");
  system["uptime"] = millis() / 1000;
  system["free_memory"] = ESP.getFreeHeap();
  system["cpu_usage"] = random(20, 60);
  system["wifi_rssi"] = WiFi.RSSI();
  system["mqtt_reconnects"] = reconnectCount;
  
  // Состояние датчиков
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["gps_fix"] = true;
  sensors["temperature_sensor"] = "ok";
  sensors["battery_sensor"] = "ok";
  sensors["engine_sensor"] = "ok";
  
  // Счетчики уведомлений
  JsonObject alerts_count = doc.createNestedObject("alerts_count");
  alerts_count["critical"] = alertsCount_critical;
  alerts_count["warnings"] = alertsCount_warnings;
  alerts_count["info"] = alertsCount_info;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(topic_health.c_str(), payload.c_str(), true)) { // Retained
    Serial.println("💓 HEALTH → WQTT.RU (uptime: " + String(millis()/1000) + "s)");
  }
}

void sendConnectionStatus(String status) {
  if (!client.connected() && status != "disconnected") return;
  
  StaticJsonDocument<150> doc;
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  doc["status"] = status;
  doc["rssi"] = WiFi.RSSI();
  doc["broker"] = "WQTT.RU";
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(topic_connection.c_str(), payload.c_str(), true)) { // Retained
    Serial.println("🔌 CONNECTION STATUS: " + status);
  }
}

void sendAlert(String level, String message, String priority) {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<200> doc;
  doc["timestamp"] = millis();
  doc["vehicle_id"] = vehicle_id;
  doc["level"] = level;
  doc["message"] = message;
  doc["priority"] = priority;
  
  String payload;
  serializeJson(doc, payload);
  
  String alertTopic;
  if (level == "critical") {
    alertTopic = topic_alerts_critical;
    alertsCount_critical++;
  } else {
    alertTopic = topic_alerts_warnings;
    alertsCount_warnings++;
  }
  
  if (client.publish(alertTopic.c_str(), payload.c_str(), false)) {
    Serial.println("⚠️ ALERT [" + level + "]: " + message);
  }
}

void sendLegacyTelemetry() {
  // Обратная совместимость со старым форматом
  StaticJsonDocument<300> doc;
  doc["id"] = vehicle_id;
  doc["vehicle_id"] = vehicle_id;
  doc["lat"] = current_lat;
  doc["lng"] = current_lng;
  doc["speed"] = speed;
  doc["status"] = engine_status;
  doc["battery"] = battery_percentage;
  doc["temperature"] = temperature;
  doc["rpm"] = rpm;
  doc["timestamp"] = millis();
  doc["messageCount"] = messageCount;
  doc["broker"] = "WQTT.RU";
  
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем в legacy топики
  client.publish(topic_legacy_car.c_str(), payload.c_str(), false);
  client.publish(topic_legacy_telemetry.c_str(), payload.c_str(), false);
}

void updateSimulation() {
  static unsigned long lastMovement = 0;
  static int direction = 0;
  static bool wasMoving = false;
  static unsigned long movementStartTime = 0;
  
  // Изменение состояния движения каждые 25-45 секунд
  unsigned long movementInterval = random(25000, 45000);
  
  if (millis() - lastMovement > movementInterval) {
    is_moving = !is_moving;
    lastMovement = millis();
    movementStartTime = millis();
    
    if (is_moving) {
      speed = random(10, 50);
      rpm = random(1500, 3500);
      engine_status = "active";
      direction = random(0, 4);
      heading = direction * 90 + random(-30, 30);
      acceleration = random(5, 15) / 10.0;
      Serial.println("🚜 Начало движения: " + String(speed, 1) + " км/ч, направление: " + String(heading, 1) + "°");
      
      if (!wasMoving) {
        sendAlert("info", "Техника начала движение", "normal");
      }
    } else {
      speed = 0;
      rpm = random(700, 1100);
      engine_status = "stopped";
      acceleration = 0;
      Serial.println("⏸️ Остановка (отдых " + String(movementInterval/1000) + " сек)");
      
      if (wasMoving) {
        sendAlert("info", "Техника остановлена", "normal");
      }
    }
    wasMoving = is_moving;
  }
  
  // Обновление координат при движении
  if (is_moving && speed > 0) {
    float timeSinceStart = (millis() - movementStartTime) / 1000.0;
    float movement = (speed / 3600.0) * (timeSinceStart / 111000.0);
    
    switch (direction) {
      case 0: current_lat += movement * 0.0003; break;  // Север
      case 1: current_lng += movement * 0.0003; break;  // Восток
      case 2: current_lat -= movement * 0.0003; break;  // Юг
      case 3: current_lng -= movement * 0.0003; break;  // Запад
    }
    
    // Ограничения области
    current_lat = constrain(current_lat, base_lat - 0.025, base_lat + 0.025);
    current_lng = constrain(current_lng, base_lng - 0.025, base_lng + 0.025);
  }
  
  // Обновление батареи и температуры
  if (is_moving) {
    battery_percentage -= random(1, 5) / 1000.0;
    battery_current = random(20, 45) / 10.0;
    temperature += random(-10, 40) / 100.0;
  } else {
    battery_percentage -= random(1, 2) / 1000.0;
    battery_current = random(5, 15) / 10.0;
    temperature += random(-30, 10) / 100.0;
  }
  
  battery_percentage = constrain(battery_percentage, 15.0, 100.0);
  battery_voltage = 11.5 + (battery_percentage / 100.0) * 1.5;
  temperature = constrain(temperature, 20.0, 90.0);
  humidity = constrain(humidity + random(-10, 10) / 10.0, 40.0, 80.0);
  
  // Предупреждения
  if (battery_percentage < 20.0 && alertsCount_warnings < 3) {
    sendAlert("warning", "Низкий заряд батареи: " + String(battery_percentage, 1) + "%", "high");
  }
  
  if (temperature > 80.0 && alertsCount_warnings < 5) {
    sendAlert("warning", "Высокая температура: " + String(temperature, 1) + "°C", "medium");
  }
}

void checkWiFiConnection() {
  if (millis() - lastWiFiCheck < WIFI_CHECK_INTERVAL) return;
  lastWiFiCheck = millis();
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi отключен! Переподключение...");
    mqtt_connected = false;
    setup_wifi();
  }
}

void printSystemInfo() {
  if (millis() - lastSystemInfo < SYSTEM_INFO_INTERVAL) return;
  lastSystemInfo = millis();
  
  Serial.println("");
  Serial.println("🔍 === СИСТЕМНАЯ ИНФОРМАЦИЯ ===");
  Serial.println("⏰ Uptime: " + String(millis() / 1000) + " сек");
  Serial.println("🔗 MQTT: " + String((millis() - connectionTime) / 1000) + " сек");
  Serial.println("📊 Сообщений: T=" + String(messageCount) + " G=" + String(gpsMessageCount) + " S=" + String(sensorMessageCount));
  Serial.println("🔄 Переподключений: " + String(reconnectCount));
  Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("🧠 RAM: " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("⚠️ Уведомления: C=" + String(alertsCount_critical) + " W=" + String(alertsCount_warnings));
  Serial.println("===============================");
  Serial.println("");
}

void loop() {
  checkWiFiConnection();
  printSystemInfo();
  
  if (!client.connected()) {
    mqtt_connected = false;
    if (reconnect()) {
      // Успешно переподключились
    }
  } else {
    client.loop();
    
    unsigned long now = millis();
    
    // Основная телеметрия
    if (now - lastTelemetryMsg >= TELEMETRY_INTERVAL) {
      lastTelemetryMsg = now;
      sendTelemetryMessage();
    }
    
    // GPS данные (частота зависит от движения)
    unsigned long gpsInterval = is_moving ? GPS_INTERVAL_MOVING : GPS_INTERVAL_STOPPED;
    if (now - lastGpsMsg >= gpsInterval) {
      lastGpsMsg = now;
      sendGpsMessage();
    }
    
    // Данные датчиков
    if (now - lastSensorsMsg >= SENSORS_INTERVAL) {
      lastSensorsMsg = now;
      sendSensorsMessage();
    }
    
    // Состояние здоровья
    if (now - lastHealthMsg >= HEALTH_INTERVAL) {
      lastHealthMsg = now;
      sendHealthMessage();
    }
  }
  
  delay(50);
}