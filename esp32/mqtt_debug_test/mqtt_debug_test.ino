/*
 * ESP32 MQTT Debug Test
 * Простой скетч для отладки MQTT соединения с MapMon
 * 
 * Отправляет тестовые данные каждые 5 секунд:
 * - Координаты (статичные + небольшие отклонения)
 * - Скорость (случайная 0-30 км/ч)
 * - Батарея (случайная 70-100%)
 * - Температура (случайная 20-40°C)
 * - RPM (случайная 800-2500)
 * - Отладочные сообщения
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== НАСТРОЙКИ WIFI =====
const char* ssid = "YOUR_WIFI_NAME";          // Замените на ваш WiFi
const char* password = "YOUR_WIFI_PASSWORD";   // Замените на пароль WiFi

// ===== НАСТРОЙКИ MQTT =====
const char* mqtt_server = "o0acf6a7.ala.dedicated.gcp.emqxcloud.com";
const int mqtt_port = 1883;
const char* mqtt_user = "iforza";
const char* mqtt_password = "iforza";
const char* mqtt_topic = "car";

// Уникальный ID устройства (можно изменить)
const char* device_id = "ESP32_Car_DEBUG";
const char* device_name = "ESP32 Debug Test";

// ===== ПЕРЕМЕННЫЕ =====
WiFiClient espClient;
PubSubClient client(espClient);

// Координаты центра (Москва)
float base_lat = 55.75580;
float base_lng = 37.61760;

// Счетчики и таймеры
unsigned long lastMsg = 0;
unsigned long msgCount = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastDebugInfo = 0;

// Флаги состояния
bool systemOK = true;
int reconnectAttempts = 0;

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("🚀 ESP32 MQTT Debug Test v1.0");
  Serial.println("===============================");
  
  // Настройка LED (встроенный)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH); // Включаем LED при старте
  
  // Подключение к WiFi
  setup_wifi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  Serial.println("✅ Инициализация завершена");
  Serial.println("📡 Начинаем отправку отладочных данных...");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("🔗 Подключение к WiFi: ");
  Serial.println(ssid);

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
    Serial.print("📶 Сигнал: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("");
    Serial.println("❌ Ошибка подключения к WiFi!");
    systemOK = false;
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📩 Получено сообщение [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
}

void reconnect() {
  while (!client.connected() && systemOK) {
    Serial.print("🔄 Попытка подключения к MQTT...");
    
    // Создаем уникальный client ID
    String clientId = "ESP32Debug-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println(" ✅ подключен!");
      
      // Отправляем приветственное сообщение
      sendDebugMessage("system", "🚀 ESP32 Debug подключен к MQTT");
      sendDebugMessage("info", "Device ID: " + String(device_id));
      sendDebugMessage("info", "Client ID: " + clientId);
      
      reconnectAttempts = 0;
      digitalWrite(LED_BUILTIN, LOW); // Выключаем LED при успешном подключении
      
    } else {
      Serial.print(" ❌ ошибка, код: ");
      Serial.print(client.state());
      Serial.println(" повтор через 5 сек");
      
      reconnectAttempts++;
      if (reconnectAttempts > 10) {
        sendDebugMessage("error", "Слишком много попыток переподключения, перезагрузка...");
        delay(1000);
        ESP.restart();
      }
      
      digitalWrite(LED_BUILTIN, HIGH); // Включаем LED при ошибке
      delay(5000);
    }
  }
}

void sendDebugMessage(String type, String message) {
  StaticJsonDocument<200> doc;
  doc["type"] = "debug";
  doc["device_id"] = device_id;
  doc["debug_type"] = type;
  doc["message"] = message;
  doc["timestamp"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = WiFi.RSSI();
  
  String output;
  serializeJson(doc, output);
  
  if (client.connected()) {
    client.publish("debug/esp32", output.c_str());
  }
  
  Serial.println("🐛 [" + type + "] " + message);
}

void sendTelemetryData() {
  // Генерируем случайные данные для тестирования
  float lat = base_lat + (random(-100, 100) / 100000.0); // ±0.001 градуса
  float lng = base_lng + (random(-100, 100) / 100000.0);
  float speed = random(0, 30) + (random(0, 100) / 100.0); // 0-30 км/ч
  float battery = random(70, 100) + (random(0, 100) / 100.0); // 70-100%
  float temperature = random(20, 40) + (random(0, 100) / 100.0); // 20-40°C
  int rpm = random(800, 2500); // 800-2500 RPM
  
  // Определяем статус на основе скорости
  String status = speed > 1.0 ? "active" : "stopped";
  
  // Создаем JSON объект
  StaticJsonDocument<512> doc;
  doc["id"] = device_id;
  doc["name"] = device_name;
  doc["lat"] = lat;
  doc["lng"] = lng;
  doc["speed"] = speed;
  doc["battery"] = battery;
  doc["temperature"] = temperature;
  doc["rpm"] = rpm;
  doc["status"] = status;
  doc["timestamp"] = millis();
  doc["message_count"] = msgCount;
  
  // Добавляем системную информацию
  doc["system"]["free_heap"] = ESP.getFreeHeap();
  doc["system"]["wifi_rssi"] = WiFi.RSSI();
  doc["system"]["uptime"] = millis();
  doc["system"]["core_temp"] = temperatureRead();
  
  String output;
  serializeJson(doc, output);
  
  // Отправляем данные
  if (client.connected()) {
    client.publish(mqtt_topic, output.c_str());
    
    Serial.println("📡 Отправлены данные #" + String(msgCount));
    Serial.println("   📍 Координаты: " + String(lat, 6) + ", " + String(lng, 6));
    Serial.println("   🚗 Скорость: " + String(speed, 1) + " км/ч");
    Serial.println("   🔋 Батарея: " + String(battery, 1) + "%");
    Serial.println("   🌡️ Температура: " + String(temperature, 1) + "°C");
    Serial.println("   ⚙️ RPM: " + String(rpm));
    Serial.println("   📊 Статус: " + status);
    Serial.println();
    
    msgCount++;
  } else {
    Serial.println("❌ MQTT не подключен, данные не отправлены");
  }
}

void sendHeartbeat() {
  StaticJsonDocument<300> doc;
  doc["type"] = "heartbeat";
  doc["device_id"] = device_id;
  doc["name"] = device_name;
  doc["uptime"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["message_count"] = msgCount;
  doc["reconnect_attempts"] = reconnectAttempts;
  doc["core_temp"] = temperatureRead();
  
  String output;
  serializeJson(doc, output);
  
  if (client.connected()) {
    client.publish("heartbeat/esp32", output.c_str());
    Serial.println("💓 Heartbeat отправлен");
  }
}

void sendSystemInfo() {
  sendDebugMessage("info", "Система работает: " + String(millis()/1000) + " сек");
  sendDebugMessage("info", "Свободная память: " + String(ESP.getFreeHeap()) + " байт");
  sendDebugMessage("info", "WiFi сигнал: " + String(WiFi.RSSI()) + " dBm");
  sendDebugMessage("info", "Отправлено сообщений: " + String(msgCount));
  sendDebugMessage("info", "Температура CPU: " + String(temperatureRead()) + "°C");
}

void loop() {
  // Проверка подключения MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  
  // Отправка телеметрии каждые 5 секунд
  if (now - lastMsg > 5000) {
    lastMsg = now;
    sendTelemetryData();
  }
  
  // Отправка heartbeat каждые 30 секунд
  if (now - lastHeartbeat > 30000) {
    lastHeartbeat = now;
    sendHeartbeat();
  }
  
  // Отправка системной информации каждые 60 секунд
  if (now - lastDebugInfo > 60000) {
    lastDebugInfo = now;
    sendSystemInfo();
  }
  
  // Проверка WiFi подключения
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi отключен, переподключение...");
    setup_wifi();
  }
  
  delay(100); // Небольшая задержка для стабильности
} 