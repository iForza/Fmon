#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// WiFi настройки
const char* ssid = "Xiaomi12";
const char* password = "12345678";

// ===== WQTT.RU Брокер настройки =====
const char* mqtt_server = "m9.wqtt.ru";
const int mqtt_port = 20264;                         // TCP
const int mqtt_tls_port = 20265;                     // TCP с TLS
const int mqtt_ws_tls_port = 20267;                  // WebSocket TLS
const char* mqtt_username = "u_MZEPA5";
const char* mqtt_password = "L3YAUTS6";
const char* mqtt_client_id = "ESP32_Car_2046";

// Топики с уникальным префиксом для избежания конфликтов
const char* telemetry_topic = "mapmon/vehicles/ESP32_Car_2046/telemetry";
const char* status_topic = "mapmon/vehicles/ESP32_Car_2046/status";
const char* heartbeat_topic = "mapmon/vehicles/ESP32_Car_2046/heartbeat";

WiFiClient espClient;  
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
const unsigned long RECONNECT_INTERVAL = 3000;      // Попытки переподключения каждые 3 секунды
const unsigned long WIFI_CHECK_INTERVAL = 15000;    // Проверка WiFi каждые 15 секунд

// Счетчики и состояние
unsigned long messageCount = 0;
unsigned long reconnectCount = 0;
bool mqtt_connected = false;
unsigned long connectionTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=========================================");
  Serial.println("      ESP32 WQTT.RU Fleet Monitor       ");
  Serial.println("=========================================");
  Serial.println("БРОКЕР: " + String(mqtt_server));
  Serial.println("ПОРТ: " + String(mqtt_port) + " (TCP)");
  Serial.println("ПОЛЬЗОВАТЕЛЬ: " + String(mqtt_username));
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
  client.setKeepAlive(120);             // Keep-alive 2 минуты
  client.setSocketTimeout(15);          // Таймаут сокета 15 секунд
  
  Serial.println("🚀 ESP32 готов к работе с WQTT.RU!");
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
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
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
    Serial.print("🔗 Gateway: ");
    Serial.println(WiFi.gatewayIP());
    Serial.print("🌐 DNS: ");
    Serial.println(WiFi.dnsIP());
  } else {
    Serial.println("");
    Serial.println("❌ КРИТИЧЕСКАЯ ОШИБКА: WiFi не подключен!");
    Serial.println("Проверьте SSID и пароль WiFi!");
    Serial.println("🔄 Перезагрузка через 20 секунд...");
    delay(20000);
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
  } else if (message == "reboot") {
    Serial.println("🔄 Получена команда REBOOT - перезагрузка через 3 сек");
    delay(3000);
    ESP.restart();
  }
}

bool reconnect() {
  if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
    return false;
  }
  
  lastReconnectAttempt = millis();
  
  Serial.print("🔄 Попытка подключения к WQTT.RU (попытка #");
  Serial.print(++reconnectCount);
  Serial.print(")...");
  
  // Создаем уникальный client ID с timestamp
  String clientId = String(mqtt_client_id) + "_" + String(millis());
  
  // Подключение к WQTT.RU с аутентификацией
  if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
    Serial.println(" ✅ ПОДКЛЮЧЕН К WQTT.RU!");
    
    mqtt_connected = true;
    reconnectCount = 0;
    connectionTime = millis();
    
    // Отправляем статус подключения
    sendStatusMessage("connected");
    
    // Подписываемся на команды
    String commandTopic = "mapmon/vehicles/" + String(mqtt_client_id) + "/commands";
    if (client.subscribe(commandTopic.c_str())) {
      Serial.println("📡 Подписка на команды: " + commandTopic);
    }
    
    // Отправляем первый heartbeat
    sendHeartbeatMessage();
    
    Serial.println("🎉 Готов к передаче данных!");
    
    return true;
  } else {
    Serial.print(" ❌ ОШИБКА, код: ");
    Serial.println(client.state());
    
    // Расшифровка кодов ошибок
    switch(client.state()) {
      case -4:
        Serial.println("    Таймаут подключения");
        break;
      case -3:
        Serial.println("    Соединение потеряно");
        break;
      case -2:
        Serial.println("    Соединение не удалось");
        break;
      case -1:
        Serial.println("    Клиент отключен");
        break;
      case 1:
        Serial.println("    Неверная версия протокола");
        break;
      case 2:
        Serial.println("    Неверный Client ID");
        break;
      case 3:
        Serial.println("    Сервер недоступен");
        break;
      case 4:
        Serial.println("    Неверные учетные данные");
        break;
      case 5:
        Serial.println("    Не авторизован");
        break;
    }
    
    mqtt_connected = false;
    
    // Если много неудачных попыток, перезагружаемся
    if (reconnectCount > 30) {
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
  StaticJsonDocument<500> doc;
  
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
  doc["broker"] = "WQTT.RU";
  doc["uptime"] = millis() / 1000;
  doc["connectionTime"] = (millis() - connectionTime) / 1000;
  
  // Конвертируем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем сообщение с QoS 0 (быстро, но без гарантии доставки)
  if (client.publish(telemetry_topic, payload.c_str(), false)) {
    Serial.println("📊 [" + String(messageCount) + "] ТЕЛЕМЕТРИЯ → WQTT.RU");
    Serial.println("    📍 " + String(current_lat, 5) + ", " + String(current_lng, 5) + 
                   " | 🏃 " + String(speed, 1) + " км/ч | 🔋 " + String(battery, 1) + 
                   "% | 🌡️ " + String(temperature, 1) + "°C | " + status_str);
    Serial.println("    📡 RSSI: " + String(WiFi.RSSI()) + " dBm | 🧠 RAM: " + String(ESP.getFreeHeap()) + " bytes");
  } else {
    Serial.println("❌ ОШИБКА ОТПРАВКИ ТЕЛЕМЕТРИИ! Код: " + String(client.state()));
    mqtt_connected = false;
  }
}

void sendHeartbeatMessage() {
  if (!mqtt_connected) return;
  
  StaticJsonDocument<300> doc;
  doc["id"] = mqtt_client_id;
  doc["type"] = "heartbeat";
  doc["timestamp"] = millis();
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "WQTT.RU";
  doc["messageCount"] = messageCount;
  doc["connectionTime"] = (millis() - connectionTime) / 1000;
  doc["reconnectCount"] = reconnectCount;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(heartbeat_topic, payload.c_str(), false)) {
    Serial.println("💓 HEARTBEAT → WQTT.RU (uptime: " + String(millis()/1000) + 
                   "s, msg: " + String(messageCount) + ", conn: " + 
                   String((millis() - connectionTime)/1000) + "s)");
  } else {
    Serial.println("❌ ОШИБКА HEARTBEAT! Код: " + String(client.state()));
    mqtt_connected = false;
  }
}

void sendStatusMessage(String status) {
  if (!client.connected()) return;
  
  StaticJsonDocument<200> doc;
  doc["id"] = mqtt_client_id;
  doc["status"] = status;
  doc["timestamp"] = millis();
  doc["rssi"] = WiFi.RSSI();
  doc["broker"] = "WQTT.RU";
  doc["uptime"] = millis() / 1000;
  
  String payload;
  serializeJson(doc, payload);
  
  if (client.publish(status_topic, payload.c_str(), true)) { // Retain = true для статуса
    Serial.println("📡 СТАТУС → WQTT.RU: " + status);
  } else {
    Serial.println("❌ ОШИБКА СТАТУСА! Код: " + String(client.state()));
  }
}

void simulateMovement() {
  static unsigned long lastMovement = 0;
  static int direction = 0; // 0-север, 1-восток, 2-юг, 3-запад
  static bool isMoving = false;
  static unsigned long movementStartTime = 0;
  
  // Каждые 25-45 секунд меняем состояние движения
  unsigned long movementInterval = random(25000, 45000);
  
  if (millis() - lastMovement > movementInterval) {
    isMoving = !isMoving;
    lastMovement = millis();
    movementStartTime = millis();
    
    if (isMoving) {
      speed = random(10, 50); // Скорость 10-50 км/ч
      rpm = random(1500, 3500);
      status_str = "active";
      direction = random(0, 4);
      Serial.println("🚜 Начинаем движение: " + String(speed, 1) + " км/ч, направление: " + String(direction));
    } else {
      speed = 0;
      rpm = random(700, 1100); // Холостой ход
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
        current_lat += movement * 0.0003;
        break;
      case 1: // Восток
        current_lng += movement * 0.0003;
        break;
      case 2: // Юг
        current_lat -= movement * 0.0003;
        break;
      case 3: // Запад
        current_lng -= movement * 0.0003;
        break;
    }
    
    // Ограничиваем область движения (в пределах Москвы)
    current_lat = constrain(current_lat, base_lat - 0.025, base_lat + 0.025);
    current_lng = constrain(current_lng, base_lng - 0.025, base_lng + 0.025);
  }
  
  // Реалистичное изменение батареи и температуры
  if (isMoving) {
    battery -= random(1, 6) / 1000.0; // Разряжается на 0.001-0.006% за цикл
    temperature += random(-10, 40) / 100.0; // Нагревается при работе
  } else {
    battery -= random(1, 3) / 1000.0; // Медленнее разряжается в покое
    temperature += random(-30, 10) / 100.0; // Остывает
  }
  
  // Ограничиваем значения
  battery = constrain(battery, 15.0, 100.0);
  temperature = constrain(temperature, 20.0, 90.0);
  
  // Если батарея критично низкая
  if (battery < 20.0) {
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
    Serial.println("🔄 Переподключение к WiFi...");
    mqtt_connected = false;
    setup_wifi();
  } else {
    // WiFi работает, проверим качество сигнала
    int rssi = WiFi.RSSI();
    if (rssi < -80) {
      Serial.println("⚠️ Слабый WiFi сигнал: " + String(rssi) + " dBm");
    }
  }
}

void printSystemInfo() {
  static unsigned long lastSystemInfo = 0;
  
  // Печатаем системную информацию каждые 2 минуты
  if (millis() - lastSystemInfo > 120000) {
    lastSystemInfo = millis();
    
    Serial.println("");
    Serial.println("🔍 === СИСТЕМНАЯ ИНФОРМАЦИЯ ===");
    Serial.println("⏰ Uptime: " + String(millis() / 1000) + " секунд");
    Serial.println("🔗 MQTT соединение: " + String((millis() - connectionTime) / 1000) + " секунд");
    Serial.println("📊 Сообщений отправлено: " + String(messageCount));
    Serial.println("🔄 Переподключений: " + String(reconnectCount));
    Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
    Serial.println("🧠 Свободная память: " + String(ESP.getFreeHeap()) + " bytes");
    Serial.println("🔋 Батарея симуляции: " + String(battery, 1) + "%");
    Serial.println("===============================");
    Serial.println("");
  }
}

void loop() {
  // Проверяем WiFi подключение периодически
  checkWiFiConnection();
  
  // Печатаем системную информацию
  printSystemInfo();
  
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