#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// WiFi настройки
const char* ssid = "Xiaomi12";
const char* password = "12345678";

// ===== HiveMQ Cloud настройки =====
// HiveMQ Cloud бесплатный план поддерживает до 100 подключений
const char* mqtt_server = "broker.hivemq.com";      // Публичный HiveMQ брокер
const int mqtt_port = 1883;                          // TCP без TLS
const int mqtt_tls_port = 8883;                      // TCP с TLS
const char* mqtt_client_id = "ESP32_Car_2046";

// Для HiveMQ Cloud (если используете платный план):
// const char* mqtt_server = "YOUR_CLUSTER.s1.eu.hivemq.cloud"; 
// const char* mqtt_username = "YOUR_USERNAME";
// const char* mqtt_password = "YOUR_PASSWORD";

// Топики с уникальным префиксом для избежания конфликтов
const char* telemetry_topic = "mapmon/vehicles/ESP32_Car_2046/telemetry";
const char* status_topic = "mapmon/vehicles/ESP32_Car_2046/status";
const char* heartbeat_topic = "mapmon/vehicles/ESP32_Car_2046/heartbeat";

WiFiClient espClient;  // Для обычного TCP
 WiFiClientSecure espClientSecure;  // Для TLS (раскомментируйте если нужен TLS)
PubSubClient client(espClient);

// Симуляция GPS координат (Москва, Россия)
float base_lat = 55.7558;
float base_lng = 37.6176;
float current_lat = base_lat;
float current_lng = base_lng;

// Симуляция данных техники
float speed = 0;
float battery = 85.5;
float temperature = 22.5;
int rpm = 0;
String status_str = "stopped";

// Таймеры и интервалы
unsigned long lastTelemetryMsg = 0;
unsigned long lastHeartbeatMsg = 0;
unsigned long lastReconnectAttempt = 0;
unsigned long lastWiFiCheck = 0;

const unsigned long TELEMETRY_INTERVAL = 5000;      // Телеметрия каждые 5 секунд
const unsigned long HEARTBEAT_INTERVAL = 30000;     // Heartbeat каждые 30 секунд
const unsigned long RECONNECT_INTERVAL = 5000;      // Попытки переподключения каждые 5 секунд
const unsigned long WIFI_CHECK_INTERVAL = 10000;    // Проверка WiFi каждые 10 секунд

// Счетчики и состояние
unsigned long messageCount = 0;
unsigned long reconnectCount = 0;
bool mqtt_connected = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=========================================");
  Serial.println("     ESP32 HiveMQ Fleet Monitor v2.0    ");
  Serial.println("=========================================");
  Serial.println("БРОКЕР: " + String(mqtt_server));
  Serial.println("ПОРТ: " + String(mqtt_port) + " (TCP)");
  Serial.println("Client ID: " + String(mqtt_client_id));
  Serial.println("");
  Serial.println("MQTT ТОПИКИ:");
  Serial.println("  📊 Телеметрия: " + String(telemetry_topic));
  Serial.println("  📡 Статус: " + String(status_topic));
  Serial.println("  💓 Heartbeat: " + String(heartbeat_topic));
  Serial.println("  🔧 Команды: mapmon/vehicles/" + String(mqtt_client_id) + "/commands");
  Serial.println("");
  
  // Инициализация WiFi
  setup_wifi();
  
  // Настройка MQTT клиента
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setKeepAlive(90);              // Keep-alive 90 секунд
  client.setSocketTimeout(30);          // Таймаут сокета 30 секунд
  
  // Для TLS соединения (раскомментируйте если нужно):
  // espClientSecure.setInsecure(); // Отключить проверку сертификата
  // client.setClient(espClientSecure);
  // client.setServer(mqtt_server, mqtt_tls_port);
  
  Serial.println("🚀 ESP32 готов к работе!");
  Serial.println("📡 Отправка данных каждые " + String(TELEMETRY_INTERVAL/1000) + " секунд");
  Serial.println("💓 Heartbeat каждые " + String(HEARTBEAT_INTERVAL/1000) + " секунд");
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
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("✅ WiFi подключен успешно!");
    Serial.print("📍 IP адрес: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Сила сигнала: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("");
    Serial.println("❌ КРИТИЧЕСКАЯ ОШИБКА: WiFi не подключен!");
    Serial.println("🔄 Перезагрузка через 15 секунд...");
    delay(15000);
    ESP.restart();
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📨 Получена команда [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Обработка команд
  if (message == "stop") {
    speed = 0;
    status_str = "stopped";
    Serial.println("🛑 Получена команда STOP");
  } else if (message == "start") {
    speed = random(10, 30);
    status_str = "active";
    Serial.println("▶️ Получена команда START");
  }
}

bool reconnect() {
  if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
    return false;
  }
  
  lastReconnectAttempt = millis();
  
  Serial.print("🔄 Попытка подключения к HiveMQ (попытка #");
  Serial.print(++reconnectCount);
  Serial.print(")...");
  
  // Создаем уникальный client ID
  String clientId = String(mqtt_client_id) + "_" + String(millis());
  
  // Подключение к HiveMQ
  // Для публичного брокера аутентификация не требуется
  if (client.connect(clientId.c_str())) {
    Serial.println(" ✅ ПОДКЛЮЧЕН К HIVEMQ!");
    
    mqtt_connected = true;
    reconnectCount = 0;
    
    // Отправляем статус подключения
    sendStatusMessage("connected");
    
    // Подписываемся на команды
    String commandTopic = "mapmon/vehicles/" + String(mqtt_client_id) + "/commands";
    if (client.subscribe(commandTopic.c_str())) {
      Serial.println("📡 Подписка на команды: " + commandTopic);
    }
    
    // Отправляем первый heartbeat
    sendHeartbeatMessage();
    
    return true;
  } else {
    Serial.print(" ❌ ОШИБКА, код: ");
    Serial.println(client.state());
    
    mqtt_connected = false;
    
    // Если много неудачных попыток, перезагружаемся
    if (reconnectCount > 20) {
      Serial.println("🔄 Слишком много неудачных попыток. Перезагрузка...");
      delay(5000);
      ESP.restart();
    }
    
    return false;
  }
}

void sendTelemetryMessage() {
  if (!mqtt_connected) return;
  
  // Создаем JSON документ
  StaticJsonDocument<400> doc;
  
  // Симулируем движение и обновляем датчики
  simulateMovement();
  
  // Заполняем основные данные
  doc["id"] = mqtt_client_id;
  doc["vehicle_id"] = mqtt_client_id;  // Дублируем для совместимости с API
  doc["lat"] = round(current_lat * 100000) / 100000.0;  // 5 знаков после запятой
  doc["lng"] = round(current_lng * 100000) / 100000.0;
  doc["speed"] = round(speed * 10) / 10.0;
  doc["status"] = status_str;
  doc["battery"] = round(battery * 100) / 100.0;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["rpm"] = rpm;
  doc["timestamp"] = millis();
  
  // Дополнительные данные для диагностики
  doc["messageCount"] = ++messageCount;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "HiveMQ";
  doc["uptime"] = millis() / 1000;
  
  // Конвертируем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем сообщение с QoS 0 (быстро, но без гарантии доставки)
  if (client.publish(telemetry_topic, payload.c_str(), false)) {
    Serial.println("📊 [" + String(messageCount) + "] ТЕЛЕМЕТРИЯ → HiveMQ");
    Serial.println("    📍 " + String(current_lat, 5) + ", " + String(current_lng, 5) + 
                   " | 🏃 " + String(speed, 1) + " км/ч | 🔋 " + String(battery, 1) + 
                   "% | 🌡️ " + String(temperature, 1) + "°C | " + status_str);
  } else {
    Serial.println("❌ ОШИБКА ОТПРАВКИ ТЕЛЕМЕТРИИ! Код: " + String(client.state()));
    mqtt_connected = false;
  }
}

void sendHeartbeatMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<200> doc;
  doc["id"] = mqtt_client_id;
  doc["type"] = "heartbeat";
  doc["timestamp"] = millis();
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "HiveMQ";
  doc["messageCount"] = messageCount;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(heartbeat_topic, payload.c_str(), false)) {
    Serial.println("💓 HEARTBEAT → HiveMQ (uptime: " + String(millis()/1000) + "s, msg: " + String(messageCount) + ")");
  } else {
    Serial.println("❌ ОШИБКА HEARTBEAT! Код: " + String(client.state()));
    mqtt_connected = false;
  }
}

void sendStatusMessage(String status) {
  if (!client.connected()) return;
  
  StaticJsonDocument<150> doc;
  doc["id"] = mqtt_client_id;
  doc["status"] = status;
  doc["timestamp"] = millis();
  doc["rssi"] = WiFi.RSSI();
  doc["broker"] = "HiveMQ";
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(status_topic, payload.c_str(), true)) { // Retain = true для статуса
    Serial.println("📡 СТАТУС → HiveMQ: " + status);
  } else {
    Serial.println("❌ ОШИБКА СТАТУСА! Код: " + String(client.state()));
  }
}

void simulateMovement() {
  static unsigned long lastMovement = 0;
  static int direction = 0; // 0-север, 1-восток, 2-юг, 3-запад
  static bool isMoving = false;
  static unsigned long movementStartTime = 0;
  
  // Каждые 20-40 секунд меняем состояние движения
  unsigned long movementInterval = random(20000, 40000);
  
  if (millis() - lastMovement > movementInterval) {
    isMoving = !isMoving;
    lastMovement = millis();
    movementStartTime = millis();
    
    if (isMoving) {
      speed = random(8, 45); // Скорость 8-45 км/ч
      rpm = random(1400, 3200);
      status_str = "active";
      direction = random(0, 4);
      Serial.println("🚜 Начинаем движение: " + String(speed, 1) + " км/ч, направление: " + String(direction));
    } else {
      speed = 0;
      rpm = random(600, 1000); // Холостой ход
      status_str = "stopped";
      Serial.println("⏸️ Остановка (отдых " + String(movementInterval/1000) + " сек)");
    }
  }
  
  // Если движемся, обновляем координаты
  if (isMoving && speed > 0) {
    float timeSinceStart = (millis() - movementStartTime) / 1000.0; // секунды
    float movement = (speed / 3600.0) * (timeSinceStart / 111000.0); // Смещение в градусах
    
    switch (direction) {
      case 0: // Север
        current_lat += movement * 0.0002;
        break;
      case 1: // Восток
        current_lng += movement * 0.0002;
        break;
      case 2: // Юг
        current_lat -= movement * 0.0002;
        break;
      case 3: // Запад
        current_lng -= movement * 0.0002;
        break;
    }
    
    // Ограничиваем область движения (в пределах Москвы)
    current_lat = constrain(current_lat, base_lat - 0.02, base_lat + 0.02);
    current_lng = constrain(current_lng, base_lng - 0.02, base_lng + 0.02);
  }
  
  // Реалистичное изменение батареи и температуры
  if (isMoving) {
    battery -= random(2, 8) / 1000.0; // Разряжается на 0.002-0.008% за цикл
    temperature += random(-15, 35) / 100.0; // Нагревается при работе
  } else {
    battery -= random(1, 3) / 1000.0; // Медленнее разряжается в покое
    temperature += random(-25, 5) / 100.0; // Остывает
  }
  
  // Ограничиваем значения
  battery = constrain(battery, 10.0, 100.0);
  temperature = constrain(temperature, 18.0, 95.0);
  
  // Если батарея критично низкая
  if (battery < 15.0) {
    speed = 0;
    rpm = 0;
    status_str = "low_battery";
  }
}

void checkWiFiConnection() {
  if (millis() - lastWiFiCheck < WIFI_CHECK_INTERVAL) return;
  lastWiFiCheck = millis();
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi отключен! Сила сигнала: " + String(WiFi.RSSI()));
    mqtt_connected = false;
    setup_wifi();
  }
}

void loop() {
  // Проверяем WiFi подключение периодически
  checkWiFiConnection();
  
  // Поддерживаем MQTT соединение
  if (!client.connected()) {
    mqtt_connected = false;
    if (reconnect()) {
      // Успешно переподключились
    }
  } else {
    client.loop(); // Обрабатываем входящие сообщения
    
    unsigned long now = millis();
    
    // Отправляем телеметрию
    if (now - lastTelemetryMsg >= TELEMETRY_INTERVAL) {
      lastTelemetryMsg = now;
      sendTelemetryMessage();
    }
    
    // Отправляем heartbeat
    if (now - lastHeartbeatMsg >= HEARTBEAT_INTERVAL) {
      lastHeartbeatMsg = now;
      sendHeartbeatMessage();
    }
  }
  
  // Watchdog для предотвращения зависания
  delay(50);
}
