#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi настройки
const char* ssid = "Xiaomi12";
const char* password = "12345678";

// ===== Eclipse Mosquitto Test Broker настройки =====
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;                      // TCP
const int mqtt_ssl_port = 8883;                  // TLS
const int mqtt_ws_port = 8080;                   // WebSocket
const int mqtt_wss_port = 8081;                  // WebSocket TLS
// Аутентификация НЕ ТРЕБУЕТСЯ для публичного брокера
const char* mqtt_client_id = "ESP32_Car_2046";

// Топики
const char* telemetry_topic = "car";
const char* status_topic = "vehicles/ESP32_Car_2046/status";
const char* heartbeat_topic = "vehicles/ESP32_Car_2046/heartbeat";

WiFiClient espClient;
PubSubClient client(espClient);

// Симуляция GPS координат (Москва, Россия)
float base_lat = 55.7558;
float base_lng = 37.6176;
float current_lat = base_lat;
float current_lng = base_lng;

// Симуляция данных техники
float speed = 0;
float battery = 85.5; // Начинаем с реалистичного значения
float temperature = 22.5; // Комнатная температура
int rpm = 0;
String status_str = "stopped";

// Таймеры
unsigned long lastTelemetryMsg = 0;
unsigned long lastHeartbeatMsg = 0;
unsigned long lastReconnectAttempt = 0;

// Интервалы (в миллисекундах)
const unsigned long TELEMETRY_INTERVAL = 3000;  // Телеметрия каждые 3 секунды
const unsigned long HEARTBEAT_INTERVAL = 5000;   // Heartbeat каждые 5 секунд
const unsigned long RECONNECT_INTERVAL = 5000;   // Попытки переподключения каждые 5 секунд

// Счетчики для диагностики
unsigned long messageCount = 0;
unsigned long reconnectCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=================================");
  Serial.println("  ESP32 Mosquitto Fleet Monitor ");
  Serial.println("=================================");
  Serial.println("Брокер: " + String(mqtt_server));
  Serial.println("Порт: " + String(mqtt_port) + " (TCP)");
  Serial.println("WebSocket: " + String(mqtt_ws_port));
  Serial.println("WebSocket TLS: " + String(mqtt_wss_port));
  Serial.println("Аутентификация: НЕ ТРЕБУЕТСЯ");
  
  // Подключение к WiFi
  setup_wifi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setKeepAlive(60); // Увеличиваем keep-alive
  
  Serial.println("ESP32 готов к работе!");
  Serial.println("Отправка телеметрии каждые " + String(TELEMETRY_INTERVAL/1000) + " секунд");
  Serial.println("Heartbeat каждые " + String(HEARTBEAT_INTERVAL/1000) + " секунд");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Подключение к WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("✅ WiFi подключен успешно!");
    Serial.print("IP адрес: ");
    Serial.println(WiFi.localIP());
    Serial.print("Сила сигнала: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("");
    Serial.println("❌ Ошибка подключения к WiFi!");
    Serial.println("Перезагрузка через 10 секунд...");
    delay(10000);
    ESP.restart();
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📨 Получено [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
}

bool reconnect() {
  if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
    return false; // Еще рано для попытки переподключения
  }
  
  lastReconnectAttempt = millis();
  
  Serial.print("🔄 Попытка подключения к Mosquitto (попытка #");
  Serial.print(++reconnectCount);
  Serial.print(")...");
  
  // Создаем уникальный client ID с timestamp
  String clientId = String(mqtt_client_id) + "_" + String(millis());
  
  // Подключение БЕЗ аутентификации (публичный брокер)
  if (client.connect(clientId.c_str())) {
    Serial.println(" ✅ ПОДКЛЮЧЕН К MOSQUITTO!");
    reconnectCount = 0; // Сбрасываем счетчик при успешном подключении
    
    // Отправляем статус подключения
    sendStatusMessage("connected");
    
    // Подписываемся на команды
    String commandTopic = "vehicles/" + String(mqtt_client_id) + "/commands";
    if (client.subscribe(commandTopic.c_str())) {
      Serial.println("📡 Подписка на команды: " + commandTopic);
    }
    
    return true;
  } else {
    Serial.print(" ❌ ОШИБКА, код: ");
    Serial.println(client.state());
    
    // Если много неудачных попыток, перезагружаемся
    if (reconnectCount > 10) {
      Serial.println("🔄 Слишком много неудачных попыток. Перезагрузка...");
      delay(5000);
      ESP.restart();
    }
    
    return false;
  }
}

void sendTelemetryMessage() {
  // Создаем JSON документ
  StaticJsonDocument<300> doc;
  
  // Симулируем движение и обновляем датчики
  simulateMovement();
  
  // Заполняем основные данные
  doc["id"] = mqtt_client_id;
  doc["lat"] = current_lat;
  doc["lng"] = current_lng;
  doc["speed"] = speed;
  doc["status"] = status_str;
  doc["battery"] = round(battery * 100) / 100.0; // Округляем до 2 знаков
  doc["temperature"] = round(temperature * 10) / 10.0; // Округляем до 1 знака
  doc["rpm"] = rpm;
  doc["timestamp"] = millis();
  
  // Дополнительные данные для диагностики
  doc["messageCount"] = ++messageCount;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "Eclipse Mosquitto";
  
  // Конвертируем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем сообщение
  if (client.publish(telemetry_topic, payload.c_str(), false)) { // QoS 0, не retain
    Serial.println("📊 Телеметрия #" + String(messageCount) + " отправлена в Mosquitto");
    Serial.println("   Координаты: " + String(current_lat, 5) + ", " + String(current_lng, 5));
    Serial.println("   Скорость: " + String(speed) + " км/ч, Статус: " + status_str);
    Serial.println("   Батарея: " + String(battery, 1) + "%, Температура: " + String(temperature, 1) + "°C");
  } else {
    Serial.println("❌ Ошибка отправки телеметрии!");
  }
}

void sendHeartbeatMessage() {
  StaticJsonDocument<150> doc;
  doc["id"] = mqtt_client_id;
  doc["type"] = "heartbeat";
  doc["timestamp"] = millis();
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "Eclipse Mosquitto";
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(heartbeat_topic, payload.c_str(), false)) {
    Serial.println("💓 Heartbeat отправлен в Mosquitto (uptime: " + String(millis()/1000) + "s)");
  }
}

void sendStatusMessage(String status) {
  StaticJsonDocument<150> doc;
  doc["id"] = mqtt_client_id;
  doc["status"] = status;
  doc["timestamp"] = millis();
  doc["rssi"] = WiFi.RSSI();
  doc["broker"] = "Eclipse Mosquitto";
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(status_topic, payload.c_str(), true)) { // Retain = true для статуса
    Serial.println("📡 Статус отправлен в Mosquitto: " + status);
  }
}

void simulateMovement() {
  static unsigned long lastMovement = 0;
  static int direction = 0; // 0-север, 1-восток, 2-юг, 3-запад
  static bool isMoving = false;
  static unsigned long movementStartTime = 0;
  
  // Каждые 15-25 секунд меняем состояние движения
  unsigned long movementInterval = random(15000, 25000);
  
  if (millis() - lastMovement > movementInterval) {
    isMoving = !isMoving;
    lastMovement = millis();
    movementStartTime = millis();
    
    if (isMoving) {
      speed = random(5, 35); // Скорость 5-35 км/ч
      rpm = random(1200, 2800);
      status_str = "active";
      direction = random(0, 4);
      Serial.println("🚜 Начинаем движение: " + String(speed) + " км/ч, направление: " + String(direction));
    } else {
      speed = 0;
      rpm = random(700, 900); // Холостой ход
      status_str = "stopped";
      Serial.println("⏸️ Остановка");
    }
  }
  
  // Если движемся, обновляем координаты
  if (isMoving && speed > 0) {
    // Более реалистичное движение с учетом времени
    float timeInMovement = (millis() - movementStartTime) / 1000.0; // секунды
    float movement = (speed / 3600.0) * (timeInMovement / 111000.0); // Примерное смещение в градусах
    
    switch (direction) {
      case 0: // Север
        current_lat += movement * 0.0001;
        break;
      case 1: // Восток
        current_lng += movement * 0.0001;
        break;
      case 2: // Юг
        current_lat -= movement * 0.0001;
        break;
      case 3: // Запад
        current_lng -= movement * 0.0001;
        break;
    }
    
    // Ограничиваем область движения (в пределах Москвы)
    current_lat = constrain(current_lat, base_lat - 0.01, base_lat + 0.01);
    current_lng = constrain(current_lng, base_lng - 0.01, base_lng + 0.01);
  }
  
  // Симулируем изменение батареи и температуры
  if (isMoving) {
    battery -= random(1, 5) / 100.0; // Разряжается на 0.01-0.05% за цикл
    temperature += random(-10, 30) / 100.0; // Температура может колебаться
  } else {
    battery -= random(1, 2) / 100.0; // Медленнее разряжается в покое
    temperature += random(-20, 10) / 100.0; // Остывает
  }
  
  // Ограничиваем значения
  battery = constrain(battery, 5.0, 100.0); // Не даем полностью разрядиться
  temperature = constrain(temperature, 15.0, 85.0); // Реалистичный диапазон температур
  
  // Если батарея критично низкая, "выключаем" технику
  if (battery < 10.0) {
    speed = 0;
    rpm = 0;
    status_str = "low_battery";
  }
}

void loop() {
  // Проверяем WiFi подключение
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi отключен! Переподключение...");
    setup_wifi();
    return;
  }
  
  // Поддерживаем MQTT соединение
  if (!client.connected()) {
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
  
  delay(100); // Небольшая задержка для стабильности
} 
