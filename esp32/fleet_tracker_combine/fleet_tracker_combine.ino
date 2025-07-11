/*
 * Fleet Monitor ESP32 Tracker - COMBINE HARVESTER
 * Скетч для второго ESP32 модуля (комбайн)
 * 
 * Имитирует работу комбайна и передает:
 * - GPS координаты (с имитацией движения)
 * - Скорость
 * - Уровень топлива
 * - Заряд батареи
 * - Температура двигателя
 * - RPM двигателя
 * 
 * Автор: Fleet Monitor Team
 * Версия: 1.0
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== НАСТРОЙКИ СЕТИ =====
const char* ssid = "Xiaomi12";        // Замените на имя вашей WiFi сети
const char* password = "12345678"; // Замените на пароль WiFi

// ===== НАСТРОЙКИ MQTT =====
const char* mqtt_server = "test.mosquitto.org";  // Eclipse Mosquitto Test брокер
const int mqtt_port = 1883;                      // TCP порт для ESP32
// Аутентификация НЕ ТРЕБУЕТСЯ для публичного брокера
const char* mqtt_topic = "vehicles/esp32_combine/telemetry";

// ===== НАСТРОЙКИ УСТРОЙСТВА =====
const char* vehicle_id = "esp32_combine_002";
const char* vehicle_name = "Комбайн ESP32-02";

// ===== ИМИТАЦИЯ GPS КООРДИНАТ =====
// Начальные координаты (отличаются от трактора - поле рядом)
float base_lat = 55.7600;  // Чуть севернее трактора
float base_lng = 37.6200;  // Чуть восточнее трактора

// Текущие координаты
float current_lat = base_lat;
float current_lng = base_lng;

// Переменные движения (комбайн движется медленнее)
float direction = 90.0;       // Начальное направление (восток)
float move_distance = 0.0008; // Дистанция за шаг (меньше чем у трактора - 80 метров)

// ===== ИМИТАЦИЯ ДАТЧИКОВ КОМБАЙНА =====
float fuel_level = 70.0;      // Уровень топлива (%)
float battery_level = 88.0;   // Заряд батареи (%)
float speed = 0.0;            // Скорость (км/ч)
float temperature = 22.0;     // Температура двигателя (°C)
int rpm = 0;                  // Обороты двигателя
bool engine_running = false;   // Двигатель включен
bool harvesting = false;      // Режим уборки

// ===== СЕТЕВЫЕ ОБЪЕКТЫ =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== ТАЙМЕРЫ =====
unsigned long lastTelemetryTime = 0;
unsigned long telemetryInterval = 6000;  // Отправка данных каждые 6 секунд (чуть медленнее трактора)

unsigned long lastMovementTime = 0;
unsigned long movementInterval = 3000;   // Обновление движения каждые 3 секунды

unsigned long lastStatusChange = 0;
unsigned long statusChangeInterval = 30000; // Изменение режима каждые 30 секунд

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=================================");
  Serial.println("   Fleet Monitor ESP32 COMBINE   ");
  Serial.println("=================================");
  
  // Инициализация случайного генератора с другим сидом
  randomSeed(analogRead(0) + 1000);
  
  // Подключение к WiFi
  setupWiFi();
  
  // Настройка MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(onMqttMessage);
  client.setKeepAlive(60); // Добавляем keepAlive как в рабочем mqtt_test
  
  Serial.println("Инициализация завершена!");
  Serial.println("Комбайн готов к работе...");
}

void loop() {
  // Поддерживаем MQTT соединение
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Изменяем режим работы периодически
  updateWorkMode();
  
  // Обновляем движение комбайна
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
    
    // Создаем уникальный client ID с timestamp (как в рабочем mqtt_test)
    String clientId = "ESP32Combine_";
    clientId += String(millis());
    
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
    rpm = 800; // Холостой ход
    temperature = 25.0;
    Serial.println("Двигатель комбайна запущен!");
  } else if (doc["command"] == "stop_engine") {
    engine_running = false;
    harvesting = false;
    speed = 0;
    rpm = 0;
    Serial.println("Двигатель комбайна остановлен!");
  } else if (doc["command"] == "start_harvest") {
    if (engine_running) {
      harvesting = true;
      Serial.println("Начата уборка урожая!");
    }
  } else if (doc["command"] == "stop_harvest") {
    harvesting = false;
    Serial.println("Уборка урожая остановлена!");
  }
}

void updateWorkMode() {
  if (millis() - lastStatusChange < statusChangeInterval) {
    return;
  }
  lastStatusChange = millis();
  
  if (!engine_running) {
    // Случайно запускаем двигатель
    if (random(0, 100) < 20) { // 20% шанс
      engine_running = true;
      rpm = 800;
      temperature = 25.0;
      Serial.println("Автозапуск двигателя комбайна");
    }
  } else {
    // Если двигатель работает, меняем режимы
    int mode = random(0, 100);
    if (mode < 30 && !harvesting) {
      harvesting = true;
      Serial.println("Начата автоматическая уборка");
    } else if (mode < 60 && harvesting) {
      harvesting = false;
      Serial.println("Уборка приостановлена");
    } else if (mode < 10) {
      engine_running = false;
      harvesting = false;
      speed = 0;
      rpm = 0;
      Serial.println("Двигатель остановлен");
    }
  }
}

void updateMovement() {
  if (millis() - lastMovementTime < movementInterval) {
    return;
  }
  lastMovementTime = millis();
  
  if (engine_running) {
    if (harvesting) {
      // Режим уборки - медленная скорость (3-8 км/ч)
      speed = random(3, 9);
      rpm = random(1200, 1800);
      temperature = random(45, 65); // Рабочая температура
    } else {
      // Режим переезда - быстрее (8-15 км/ч)
      speed = random(8, 16);
      rpm = random(900, 1400);
      temperature = random(35, 50);
    }
    
    // Изменяем направление более плавно (комбайн поворачивает медленнее)
    direction += random(-15, 16); // Поворот до 15 градусов
    if (direction < 0) direction += 360;
    if (direction >= 360) direction -= 360;
    
    // Рассчитываем новые координаты
    float rad_direction = direction * PI / 180.0;
    current_lat += move_distance * cos(rad_direction);
    current_lng += move_distance * sin(rad_direction);
    
    // Ограничиваем движение областью (радиус ~800 м от начальной точки)
    float distance_from_base = sqrt(pow(current_lat - base_lat, 2) + pow(current_lng - base_lng, 2));
    if (distance_from_base > 0.008) { // Если слишком далеко
      // Разворачиваемся к базе
      direction = atan2(base_lng - current_lng, base_lat - current_lat) * 180.0 / PI;
      if (direction < 0) direction += 360;
    }
    
  } else {
    // Двигатель выключен
    speed = 0;
    rpm = 0;
    temperature = max(20.0, temperature - 0.5); // Остывание
  }
}

void updateSensors() {
  // Имитация расхода топлива (комбайн расходует больше при уборке)
  if (engine_running && speed > 0) {
    if (harvesting) {
      fuel_level -= 0.02; // Больший расход при уборке
    } else {
      fuel_level -= 0.015; // Обычный расход
    }
    if (fuel_level < 0) fuel_level = 0;
  }
  
  // Имитация разряда батареи
  if (engine_running) {
    if (harvesting) {
      battery_level -= 0.008; // Больший расход при уборке (освещение, гидравлика)
    } else {
      battery_level -= 0.005; // Обычный расход
    }
  } else {
    battery_level -= 0.001; // Медленный разряд в покое
  }
  if (battery_level < 0) battery_level = 0;
  
  // Добавляем небольшие случайные вариации
  fuel_level += random(-3, 4) / 100.0;
  battery_level += random(-2, 3) / 100.0;
  temperature += random(-2, 3) / 10.0;
  
  // Ограничиваем значения
  fuel_level = constrain(fuel_level, 0, 100);
  battery_level = constrain(battery_level, 0, 100);
  temperature = constrain(temperature, 15, 85);
}

void sendTelemetry() {
  if (millis() - lastTelemetryTime < telemetryInterval) {
    return;
  }
  lastTelemetryTime = millis();
  
  // Создаем JSON документ
  StaticJsonDocument<350> doc;
  
  // Основные данные (используем правильные поля для совместимости)
  doc["vehicleId"] = vehicle_id;
  doc["vehicle_id"] = vehicle_id;  // Дублируем для совместимости
  doc["device_id"] = vehicle_id;   // Дублируем для MQTT collector
  doc["name"] = vehicle_name;
  doc["timestamp"] = millis();
  
  // GPS координаты
  doc["lat"] = current_lat;
  doc["lng"] = current_lng;
  
  // Данные датчиков
  doc["speed"] = speed;
  doc["fuel"] = round(fuel_level * 10) / 10.0;
  doc["battery"] = round(battery_level * 10) / 10.0;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["rpm"] = rpm;
  
  // Статус
  doc["engine"] = engine_running;
  doc["harvesting"] = harvesting;
  doc["status"] = engine_running ? "active" : "stopped";
  
  // Дополнительные данные
  doc["direction"] = round(direction);
  doc["rssi"] = WiFi.RSSI();
  doc["vehicle_type"] = "combine";
  
  // Преобразуем в строку
  String payload;
  serializeJson(doc, payload);
  
  // Отправляем по MQTT
  if (client.publish(mqtt_topic, payload.c_str())) {
    Serial.println("Телеметрия комбайна отправлена:");
    Serial.println("  Координаты: " + String(current_lat, 5) + ", " + String(current_lng, 5));
    Serial.println("  Скорость: " + String(speed) + " км/ч");
    Serial.println("  Топливо: " + String(fuel_level, 1) + "%");
    Serial.println("  Батарея: " + String(battery_level, 1) + "%");
    Serial.println("  Температура: " + String(temperature, 1) + "°C");
    Serial.println("  RPM: " + String(rpm));
    Serial.println("  Статус: " + String(engine_running ? "Работает" : "Остановлен"));
    Serial.println("  Уборка: " + String(harvesting ? "Да" : "Нет"));
    Serial.println();
  } else {
    Serial.println("Ошибка отправки телеметрии!");
  }
}

// Дополнительные функции для управления

void printStatus() {
  Serial.println("=== СТАТУС КОМБАЙНА ===");
  Serial.println("ID: " + String(vehicle_id));
  Serial.println("Координаты: " + String(current_lat, 5) + ", " + String(current_lng, 5));
  Serial.println("Скорость: " + String(speed) + " км/ч");
  Serial.println("Направление: " + String(direction) + "°");
  Serial.println("Топливо: " + String(fuel_level, 1) + "%");
  Serial.println("Батарея: " + String(battery_level, 1) + "%");
  Serial.println("Температура: " + String(temperature, 1) + "°C");
  Serial.println("RPM: " + String(rpm));
  Serial.println("Двигатель: " + String(engine_running ? "Работает" : "Остановлен"));
  Serial.println("Уборка: " + String(harvesting ? "Активна" : "Неактивна"));
  Serial.println("WiFi сигнал: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("MQTT: " + String(client.connected() ? "Подключен" : "Отключен"));
  Serial.println("========================");
}