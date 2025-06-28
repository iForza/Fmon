# 🔧 ПЛАН РЕШЕНИЯ: Захардкоженные WiFi credentials

## 🚨 ПРОБЛЕМА
**WiFi credentials захардкожены в ESP32 скетчах - небезопасно и неудобно**

### Текущий код:
```cpp
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";
```

## 🎯 ЦЕЛЬ
Создать безопасную систему конфигурации WiFi через EEPROM/файл конфигурации

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Создать WiFi Manager
```cpp
#include <WiFiManager.h>
#include <Preferences.h>

void setupWiFiManager() {
  WiFiManager wifiManager;
  
  // Автоматическое подключение или создание AP для настройки
  if (!wifiManager.autoConnect("ESP32-MapMon-Setup")) {
    Serial.println("Failed to connect and hit timeout");
    ESP.restart();
  }
}
```

### Шаг 2: Создать конфигурационный файл
```cpp
// config.h
struct Config {
  char wifi_ssid[32];
  char wifi_password[64];
  char mqtt_broker[64];
  int mqtt_port;
  char device_id[32];
};

void loadConfig();
void saveConfig();
```

### Шаг 3: Web интерфейс настройки
- Создать веб-страницу для настройки параметров
- Сохранение в EEPROM

## 🧪 ТЕСТИРОВАНИЕ
- Проверить создание точки доступа при первом запуске
- Тестировать сохранение настроек

## ✅ ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ
- Безопасное хранение credentials
- Удобная настройка через веб-интерфейс 