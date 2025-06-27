#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi настройки - ЗАМЕНИТЕ НА ВАШИ!
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT брокер (публичный test.mosquitto.org)
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;  // TCP порт (не WebSocket!)
const char* device_id = "ESP32_Car_2046";

WiFiClient espClient;
PubSubClient client(espClient);

// Переменные для данных
unsigned long lastMsg = 0;
unsigned long messageCount = 0;
float lat = 55.7558;  // Координаты Москвы 
float lng = 37.6176;
int speed = 0;
float battery = 85.0;
float temperature = 25.0;
int rpm = 0;

void setup() {
  Serial.begin(115200);
  
  // Подключение к WiFi
  setup_wifi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  Serial.println("ESP32 MQTT Live Test готов!");
  Serial.println("Отправляет данные в топики:");
  Serial.println("- car (телеметрия)");
  Serial.println("- vehicles/ESP32_Car_2046/status");
  Serial.println("- vehicles/ESP32_Car_2046/heartbeat");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Подключение к WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi подключен!");
  Serial.print("IP адрес: ");
  Serial.println(WiFi.localIP());
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Получено сообщение [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Подключение к MQTT...");
    
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println(" подключен!");
      
      // Отправляем статус подключения
      sendStatus();
      
    } else {
      Serial.print(" ошибка, rc=");
      Serial.print(client.state());
      Serial.println(" повтор через 5 секунд");
      delay(5000);
    }
  }
}

void sendTelemetry() {
  // Симулируем движение техники
  lat += (random(-100, 100) / 100000.0);  // Небольшие изменения координат
  lng += (random(-100, 100) / 100000.0);
  speed = random(0, 60);                   // Скорость 0-60 км/ч
  battery = 85.0 + random(-5, 5);          // Батарея 80-90%
  temperature = 25.0 + random(-5, 10);     // Температура 20-35°C
  rpm = speed * 50 + random(-100, 100);    // RPM зависит от скорости
  
  // Создаем JSON объект
  StaticJsonDocument<400> doc;
  doc["id"] = device_id;
  doc["device_id"] = device_id;
  doc["vehicle_id"] = device_id;
  doc["lat"] = lat;
  doc["lng"] = lng;
  doc["speed"] = speed;
  doc["battery"] = battery;
  doc["temperature"] = temperature;
  doc["rpm"] = rpm;
  doc["timestamp"] = millis() / 1000;
  doc["messageCount"] = ++messageCount;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["broker"] = "Eclipse Mosquitto";
  doc["status"] = (speed > 0) ? "active" : "stopped";
  
  // Преобразуем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем в топик "car" (основной топик для телеметрии)
  client.publish("car", payload.c_str());
  
  Serial.println("📡 Телеметрия отправлена:");
  Serial.println(payload);
}

void sendHeartbeat() {
  StaticJsonDocument<200> doc;
  doc["device_id"] = device_id;
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["status"] = "online";
  
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем heartbeat
  String topic = "vehicles/" + String(device_id) + "/heartbeat";
  client.publish(topic.c_str(), payload.c_str());
  
  Serial.println("💓 Heartbeat отправлен: " + payload);
}

void sendStatus() {
  StaticJsonDocument<150> doc;
  doc["device_id"] = device_id;
  doc["status"] = "active";
  doc["rssi"] = WiFi.RSSI();
  doc["ip"] = WiFi.localIP().toString();
  
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем статус
  String topic = "vehicles/" + String(device_id) + "/status";
  client.publish(topic.c_str(), payload.c_str());
  
  Serial.println("📊 Статус отправлен: " + payload);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  
  // Отправляем телеметрию каждые 3 секунды
  if (now - lastMsg > 3000) {
    lastMsg = now;
    
    sendTelemetry();
    
    // Heartbeat каждые 15 секунд
    if (messageCount % 5 == 0) {
      sendHeartbeat();
    }
    
    // Статус каждые 30 секунд  
    if (messageCount % 10 == 0) {
      sendStatus();
    }
  }
  
  delay(100);
} 