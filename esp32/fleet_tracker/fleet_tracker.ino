/*
 * Fleet Monitor ESP32 Tracker
 * Простой код для тестирования системы мониторинга техники
 * 
 * Имитирует работу трактора и передает:
 * - GPS координаты (с имитацией движения)
 * - Скорость
 * - Уровень топлива
 * - Заряд батареи
 * 
 * Автор: Fleet Monitor Team
 * Версия: 1.0
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== НАСТРОЙКИ СЕТИ =====
const char* ssid = "YOUR_WIFI_NAME";        // Замените на имя вашей WiFi сети
const char* password = "YOUR_WIFI_PASSWORD"; // Замените на пароль WiFi

// ===== НАСТРОЙКИ MQTT =====
const char* mqtt_server = "test.mosquitto.org";  // Публичный MQTT брокер для тестов
const int mqtt_port = 1883;                      // Стандартный MQTT порт
const char* mqtt_topic = "vehicles/esp32_tractor/telemetry";

// ===== НАСТРОЙКИ УСТРОЙСТВА =====
const char* vehicle_id = "esp32_tractor_001";
const char* vehicle_name = "Тестовый трактор ESP32";

// ===== ИМИТАЦИЯ GPS КООРДИНАТ =====
// Начальные координаты (центр Москвы)
float base_lat = 55.7558;
float base_lng = 37.6176;

// Текущие координаты
float current_lat = base_lat;
float current_lng = base_lng;

// Переменные движения
float direction = 0.0;        // Направление в градусах
float move_distance = 0.001;  // Дистанция за шаг (примерно 100 метров)

// ===== ИМИТАЦИЯ ДАТЧИКОВ =====
float fuel_level = 80.0;      // Уровень топлива (%)
float battery_level = 95.0;   // Заряд батареи (%)
float speed = 0.0;            // Скорость (км/ч)
bool engine_running = false;   // Двигатель включен

// ===== СЕТЕВЫЕ ОБЪЕКТЫ =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== ТАЙМЕРЫ =====
unsigned long lastTelemetryTime = 0;
unsigned long telemetryInterval = 5000;  // Отправка данных каждые 5 секунд

unsigned long lastMovementTime = 0;
unsigned long movementInterval = 2000;   // Обновление движения каждые 2 секунды

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=================================");
  Serial.println("   Fleet Monitor ESP32 Tracker   ");
  Serial.println("=================================");
  
  // Инициализация случайного генератора
  randomSeed(analogRead(0));
  
  // Подключение к WiFi
  setupWiFi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(onMqttMessage);
  
  Serial.println("Инициализация завершена!");
  Serial.println("Трактор готов к работе...");
}

void loop() {
  // Поддерживаем MQTT соединение
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Обновляем движение трактора
  updateMovement();
  
  // Отправляем телеметрию
  sendTelemetry();
  
  // Обновляем состояние датчиков
  updateSensors();
  
  delay(100);
}

void setupWiFi() {
  Serial.print("Подключение к WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi подключен!");
  Serial.print("IP адрес: ");
  Serial.println(WiFi.localIP());
  Serial.print("Сигнал: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Подключение к MQTT брокеру...");
    
    // Создаем уникальный client ID
    String clientId = "ESP32Tractor-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println(" успешно!");
      
      // Подписываемся на команды
      String commandTopic = "vehicles/" + String(vehicle_id) + "/commands";
      client.subscribe(commandTopic.c_str());
      Serial.println("Подписка на команды: " + commandTopic);
      
    } else {
      Serial.print(" ошибка, код: ");
      Serial.print(client.state());
      Serial.println(" повтор через 5 секунд");
      delay(5000);
    }
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  Serial.print("Получена команда [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Обрабатываем команды
  StaticJsonDocument<200> doc;
  deserializeJson(doc, message);
  
  if (doc["command"] == "start_engine") {
    engine_running = true;
    Serial.println("Двигатель запущен!");
  } else if (doc["command"] == "stop_engine") {
    engine_running = false;
    speed = 0;
    Serial.println("Двигатель остановлен!");
  }
}

void updateMovement() {
  if (millis() - lastMovementTime < movementInterval) {
    return;
  }
  lastMovementTime = millis();
  
  if (engine_running) {
    // Генерируем скорость (5-25 км/ч для трактора)
    speed = random(5, 26);
    
    // Изменяем направление случайным образом
    direction += random(-30, 31); // Поворот до 30 градусов
    if (direction < 0) direction += 360;
    if (direction >= 360) direction -= 360;
    
    // Рассчитываем новые координаты
    float rad_direction = direction * PI / 180.0;
    current_lat += move_distance * cos(rad_direction);
    current_lng += move_distance * sin(rad_direction);
    
    // Ограничиваем движение областью (радиус ~1 км от начальной точки)
    float distance_from_base = sqrt(pow(current_lat - base_lat, 2) + pow(current_lng - base_lng, 2));
    if (distance_from_base > 0.01) { // Если слишком далеко
      // Разворачиваемся к базе
      direction = atan2(base_lng - current_lng, base_lat - current_lat) * 180.0 / PI;
      if (direction < 0) direction += 360;
    }
    
  } else {
    // Двигатель выключен
    speed = 0;
  }
}

void updateSensors() {
  // Имитация расхода топлива
  if (engine_running && speed > 0) {
    fuel_level -= 0.01; // Расход 0.01% в цикл
    if (fuel_level < 0) fuel_level = 0;
  }
  
  // Имитация разряда батареи
  if (engine_running) {
    battery_level -= 0.005; // Разряд при работе двигателя
  } else {
    battery_level -= 0.001; // Медленный разряд в покое
  }
  if (battery_level < 0) battery_level = 0;
  
  // Добавляем небольшие случайные вариации
  fuel_level += random(-5, 6) / 100.0;
  battery_level += random(-3, 4) / 100.0;
  
  // Ограничиваем значения
  fuel_level = constrain(fuel_level, 0, 100);
  battery_level = constrain(battery_level, 0, 100);
}

void sendTelemetry() {
  if (millis() - lastTelemetryTime < telemetryInterval) {
    return;
  }
  lastTelemetryTime = millis();
  
  // Создаем JSON документ
  StaticJsonDocument<300> doc;
  
  // Основные данные
  doc["vehicleId"] = vehicle_id;
  doc["name"] = vehicle_name;
  doc["timestamp"] = millis();
  
  // GPS координаты
  doc["lat"] = current_lat;
  doc["lng"] = current_lng;
  
  // Данные датчиков
  doc["speed"] = speed;
  doc["fuel"] = round(fuel_level * 10) / 10.0;        // Округляем до 1 знака
  doc["battery"] = round(battery_level * 10) / 10.0;   // Округляем до 1 знака
  
  // Статус
  doc["engine"] = engine_running;
  doc["status"] = engine_running ? "active" : "stopped";
  
  // Дополнительные данные
  doc["direction"] = round(direction);
  doc["rssi"] = WiFi.RSSI();
  
  // Преобразуем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем по MQTT
  if (client.publish(mqtt_topic, payload.c_str())) {
    Serial.println("Телеметрия отправлена:");
    Serial.println("  Координаты: " + String(current_lat, 5) + ", " + String(current_lng, 5));
    Serial.println("  Скорость: " + String(speed) + " км/ч");
    Serial.println("  Топливо: " + String(fuel_level, 1) + "%");
    Serial.println("  Батарея: " + String(battery_level, 1) + "%");
    Serial.println("  Статус: " + String(engine_running ? "Работает" : "Остановлен"));
    Serial.println();
  } else {
    Serial.println("Ошибка отправки телеметрии!");
  }
}

// Дополнительные функции для управления

void printStatus() {
  Serial.println("=== СТАТУС ТРАКТОРА ===");
  Serial.println("ID: " + String(vehicle_id));
  Serial.println("Координаты: " + String(current_lat, 5) + ", " + String(current_lng, 5));
  Serial.println("Скорость: " + String(speed) + " км/ч");
  Serial.println("Направление: " + String(direction) + "°");
  Serial.println("Топливо: " + String(fuel_level, 1) + "%");
  Serial.println("Батарея: " + String(battery_level, 1) + "%");
  Serial.println("Двигатель: " + String(engine_running ? "Работает" : "Остановлен"));
  Serial.println("WiFi сигнал: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("MQTT: " + String(client.connected() ? "Подключен" : "Отключен"));
  Serial.println("======================");
} 