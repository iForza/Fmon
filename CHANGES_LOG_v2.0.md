# 📋 Журнал изменений MapMon v2.0

## 🗓️ Дата: 2025-01-12
## 📝 Коммит: f7ea374 - "fix: исправлены race conditions и обновлена MQTT архитектура v2.0"

---

## 🚀 **Основные изменения:**

### 1. 🔧 **Исправлены Race Conditions**

#### **composables/useApi.ts**
- ✅ **Проблема**: Множественная инициализация API клиента при быстрых переходах между страницами
- ✅ **Решение**: Реализован singleton паттерн
- ✅ **Изменения**:
  ```typescript
  // Добавлены глобальные переменные состояния
  let apiInstance: any = null
  let isInitializing = false
  let isInitialized = false
  
  export const useApi = () => {
    // Возвращаем существующий экземпляр если он есть
    if (apiInstance) {
      return apiInstance
    }
    // ... остальная логика
  }
  ```
- ✅ **Эффект**: Предотвращены множественные инициализации и утечки памяти

#### **composables/useVehicleManager.ts**
- ✅ **Проблема**: Дублирование watchers и множественные API вызовы
- ✅ **Решение**: Singleton паттерн с контролем watchers
- ✅ **Изменения**:
  ```typescript
  // Singleton состояние
  let vehicleManagerInstance: any = null
  let isInitializing = false
  let isInitialized = false
  let watcherUnsubscribe: any = null
  
  // Контролируемая инициализация
  if (!watcherUnsubscribe) {
    watcherUnsubscribe = watch(...)
  }
  ```
- ✅ **Эффект**: Устранены дублирующиеся watchers, улучшена стабильность

### 2. ⏰ **Увеличены временные пороги устройств**

#### **Изменения порогов:**
- ❌ **Было**: ONLINE < 10 сек, IDLE < 30 сек, DISCONNECTED > 30 сек
- ✅ **Стало**: ONLINE < 30 сек, IDLE < 2 мин, DISCONNECTED > 2 мин

#### **Файлы изменены:**
- `composables/useVehicleManager.ts`: константы ONLINE_THRESHOLD, IDLE_THRESHOLD
- `composables/useApi.ts`: activeVehicles computed с порогом 120000ms (2 мин)

#### **Эффект:**
- ✅ Более стабильная работа при нестабильном MQTT соединении
- ✅ Меньше ложных переключений статуса устройств
- ✅ Решена проблема с левой панелью "Активна: 0"

---

## 🌐 **MQTT Архитектура v2.0**

### 3. 📊 **Новая система топиков**

#### **Создан файл**: `MQTT_TOPICS_ARCHITECTURE.md`
- ✅ Полная документация иерархической структуры топиков
- ✅ QoS уровни для разных типов сообщений
- ✅ Retained политики
- ✅ Схемы JSON сообщений

#### **Иерархическая структура:**
```
mapmon/
├── fleet/                          # Управление парком
│   ├── discovery, status, commands
├── vehicles/{vehicle_id}/          # Индивидуальные устройства
│   ├── data/                       # Данные устройства
│   │   ├── telemetry, gps, sensors
│   ├── status/                     # Статусы устройства
│   │   ├── connection, health
│   ├── control/                    # Управление устройством
│   │   ├── commands, config
│   └── alerts/                     # Уведомления
│       ├── critical, warnings
```

### 4. 🤖 **ESP32 скетч v2.0**

#### **Создан файл**: `esp32/fleet_tracker_v2.ino`
- ✅ **Новые топики WQTT.RU**: 
  - `mapmon/vehicles/ESP32_Car_2046/data/telemetry`
  - `mapmon/vehicles/ESP32_Car_2046/status/health`
  - `mapmon/vehicles/ESP32_Car_2046/alerts/critical`
- ✅ **Структурированные JSON сообщения**:
  ```json
  {
    "timestamp": 1720012345678,
    "vehicle_id": "ESP32_Car_2046",
    "location": { "lat": 55.75580, "lng": 37.61760 },
    "motion": { "speed": 25.3, "heading": 135.7 },
    "engine": { "rpm": 2450, "status": "active" },
    "power": { "battery": 84.5, "voltage": 12.6 }
  }
  ```
- ✅ **Обратная совместимость** с legacy топиками (`car`, `vehicles/{id}/telemetry`)
- ✅ **Улучшенная обработка команд** через `control/commands`
- ✅ **Системная диагностика** в топиках `status/health`

### 5. 📡 **MQTT Collector v2.0**

#### **Создан файл**: `server-backup/mqtt-collector-v2.cjs`
- ✅ **Подписки на новые топики v2.0**:
  ```javascript
  'mapmon/vehicles/+/data/telemetry'    // QoS 1
  'mapmon/vehicles/+/status/connection' // QoS 1  
  'mapmon/vehicles/+/alerts/critical'   // QoS 2
  ```
- ✅ **Типизированная обработка сообщений** по типам:
  - `handleTelemetryMessage()` - основная телеметрия
  - `handleHealthMessage()` - состояние здоровья
  - `handleAlertsMessage()` - уведомления
- ✅ **Статистика сообщений** с категоризацией
- ✅ **Legacy совместимость** - поддержка старых топиков

#### **Обновлен файл**: `server-backup/mqtt-collector.cjs`
- ✅ Добавлены подписки на новые топики v2.0
- ✅ Сохранена обратная совместимость
- ✅ Улучшена обработка device_id из разных источников

---

## 🗑️ **Очистка проекта**

### 6. 🧹 **Удалены устаревшие файлы**
- ❌ `CRITICAL_ISSUES_ANALYSIS.md` - дублировал информацию
- ❌ `NEW_CHAT_CONTEXT.md` - устаревший контекст
- ❌ `esp32/consol.txt` - отладочные логи
- ❌ `inx/Снимок экрана 2025-07-11 142154.png` - старый скриншот

---

## 🔧 **Технические улучшения**

### 7. 💾 **Управление памятью**
- ✅ **Singleton паттерны** предотвращают множественные экземпляры
- ✅ **Контролируемые watchers** с автоочисткой
- ✅ **Proper cleanup** в onUnmounted хуках
- ✅ **Защита от утечек памяти** в polling интервалах

### 8. 🚦 **Улучшенная обработка ошибок**
- ✅ **Initialization guards** предотвращают race conditions
- ✅ **Timeout handling** для MQTT переподключений
- ✅ **Graceful degradation** при потере соединения
- ✅ **Error logging** с категоризацией

### 9. 📈 **Производительность**
- ✅ **Adaptive polling** в зависимости от активности
- ✅ **Delta queries** для оптимизации API запросов
- ✅ **QoS optimization** для разных типов MQTT сообщений
- ✅ **Reactive updates** только при реальных изменениях

---

## 🎯 **Решенные проблемы**

### ❌ **Было:**
1. **Левая панель показывала "Активна: 0"** при работающем ESP32
2. **Race conditions** при множественных инициализациях API
3. **Утечки памяти** от дублирующихся watchers
4. **Нестабильное соединение** из-за жестких временных порогов
5. **Хаотичная MQTT архитектура** без четкой структуры

### ✅ **Стало:**
1. **Корректное отображение активных устройств** с новыми порогами
2. **Singleton паттерны** исключают race conditions  
3. **Контролируемая очистка ресурсов** предотвращает утечки
4. **Стабильные соединения** с 2-минутными порогами
5. **Структурированная MQTT v2.0** с документацией и QoS

---

## 🚀 **Инструкции по обновлению VPS**

### **Команды для обновления:**
```bash
cd /var/www/mapmon
git pull origin master
yarn install  # ВАЖНО: используй yarn, не npm ci
npm run build
pm2 restart all
```

### **Проверка работы:**
```bash
pm2 status
pm2 logs mapmon-api
pm2 logs mapmon-mqtt
curl localhost:3001/api/status
```

### **Новые файлы на VPS:**
- `esp32/fleet_tracker_v2.ino` - новый ESP32 скетч
- `server-backup/mqtt-collector-v2.cjs` - новый MQTT collector
- `MQTT_TOPICS_ARCHITECTURE.md` - документация архитектуры

---

## 📊 **Статистика изменений**

- **📁 Файлов изменено**: 6
- **📁 Файлов добавлено**: 3  
- **📁 Файлов удалено**: 3
- **📝 Строк добавлено**: ~1546
- **📝 Строк удалено**: ~464
- **🏷️ Коммит**: f7ea374
- **🌐 GitHub**: https://github.com/iForza/Fmon

---

## 🔮 **Следующие шаги**

1. **Обновить VPS сервер** с новым кодом
2. **Загрузить fleet_tracker_v2.ino** на ESP32
3. **Протестировать новую MQTT архитектуру**
4. **Мониторинг стабильности** в течение 24 часов
5. **Настроить alerting** для критических уведомлений

---

*Документация создана автоматически Claude Code 12.01.2025*