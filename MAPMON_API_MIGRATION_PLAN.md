# 🔄 **ПЛАН МИГРАЦИИ MapMon: MQTT → API**

## 🎯 **Цель миграции**
Убрать дублирование MQTT подключений и перейти на архитектуру где frontend получает данные только через серверный API.

---

## 📊 **ТЕКУЩАЯ ПРОБЛЕМА (v0.6)**

### ❌ Дублирование MQTT подключений:
```
ESP32 → EMQX Cloud MQTT Broker
            ↓
    ┌───────────────────────────┐
    ↓                           ↓
🖥️ Серверный MQTT           🌐 Браузерный MQTT
(mqtt-collector.cjs)        (useMqtt.ts)
    ↓                           ↓
💾 SQLite База              📱 Frontend
    ↓
🔗 API Server
    ↓
🌐 Frontend (через HTTP)
```

### 🚨 Проблемы:
- **Избыточность:** Два клиента получают одни данные
- **Нагрузка:** Двойная нагрузка на MQTT брокер
- **Конфликты:** Возможные конфликты client ID
- **Сложность:** Сложная синхронизация данных

---

## ✅ **ЦЕЛЕВАЯ АРХИТЕКТУРА (v0.7)**

### 🎯 Оптимизированный поток данных:
```
ESP32 → EMQX Cloud MQTT Broker
            ↓
    🖥️ ТОЛЬКО Серверный MQTT (mqtt-collector.cjs)
            ↓
    💾 SQLite База + WebSocket broadcast
            ↓
    🔗 API Server (3001) + WebSocket Server
            ↓
    🌐 Frontend (API + WebSocket)
```

### 🚀 Преимущества:
- **Единое подключение:** Один MQTT клиент на сервере
- **Централизация:** Все данные через SQLite
- **Производительность:** Меньше нагрузки на брокер
- **Надежность:** Кэширование в базе данных
- **Масштабируемость:** Легко добавлять новых клиентов

---

## 📋 **ПЛАН ДЕЙСТВИЙ**

### **ЭТАП 1: Подготовка файлов локально** ✅
- [x] Скачать все файлы с сервера
- [x] Создать `composables/useApi.ts`
- [x] Создать `app-api.vue` с новой архитектурой
- [x] Проанализировать текущую структуру

### **ЭТАП 2: Тестирование локально**
```bash
# 1. Запустить локально новую версию
mv app.vue app-mqtt.vue.backup
mv app-api.vue app.vue

# 2. Запустить локальный dev сервер
yarn dev

# 3. Проверить работу API подключения
# Frontend должен получать данные через /api/telemetry
```

### **ЭТАП 3: Обновление серверного API** 
Нужно добавить WebSocket поддержку в `api-server.cjs`:

```javascript
// Добавить WebSocket сервер для real-time обновлений
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast функция для отправки обновлений всем клиентам
function broadcastVehicleUpdate(vehicleData) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'vehicle_update',
                data: vehicleData
            }));
        }
    });
}
```

### **ЭТАП 4: Развертывание на сервере**
```bash
# 1. Загрузить новые файлы на сервер
scp composables/useApi.ts root@147.45.213.22:/var/www/mapmon/composables/
scp app.vue root@147.45.213.22:/var/www/mapmon/

# 2. Обновить серверный API
# Добавить WebSocket поддержку в api-server.cjs

# 3. Перезапустить сервисы
pm2 restart mapmon
pm2 restart mapmon-api

# 4. Проверить работу
curl http://localhost:3001/api/status
```

### **ЭТАП 5: Валидация и тестирование**
- [ ] Проверить что frontend получает данные от ESP32
- [ ] Проверить WebSocket соединение
- [ ] Проверить обновления в реальном времени
- [ ] Убедиться что MQTT клиент в браузере отключен

---

## 🔧 **ТЕХНИЧЕСКИЕ ДЕТАЛИ**

### **Файлы для изменения:**
1. **`app.vue`** - заменить на API версию
2. **`composables/useApi.ts`** - новый API клиент  
3. **`server/api-server.cjs`** - добавить WebSocket
4. **`components/MapComponent.vue`** - проверить совместимость

### **API эндпоинты (остаются без изменений):**
- `GET /api/status` - статус сервера
- `GET /api/vehicles` - список техники
- `GET /api/telemetry` - последние данные
- `GET /api/telemetry/latest` - то же что telemetry

### **Новые возможности:**
- **WebSocket:** `ws://fleetmonitor.ru:8080` для real-time
- **Polling:** Автоматическое обновление каждые 5 секунд
- **Кэширование:** Сохранение состояния при разрывах связи

---

## 🎯 **РЕЗУЛЬТАТ МИГРАЦИИ**

### ✅ **После успешной миграции:**
- Frontend работает только через API
- Убран браузерный MQTT клиент
- Один MQTT клиент на сервере
- Стабильная работа с ESP32 данными
- WebSocket для real-time обновлений

### 📊 **Новая версия: MapMon v0.7**
- Архитектура: Серверный API + WebSocket
- MQTT: Только серверный коллектор
- Frontend: API-ориентированный
- Производительность: Оптимизирована

---

## 📝 **КОМАНДЫ ДЛЯ РАЗВЕРТЫВАНИЯ**

### 1. Резервное копирование:
```bash
ssh root@147.45.213.22
cd /var/www/mapmon
cp app.vue app-mqtt.vue.backup
cp composables/useMqtt.ts composables/useMqtt.ts.backup
```

### 2. Загрузка новых файлов:
```bash
scp app-api.vue root@147.45.213.22:/var/www/mapmon/app.vue
scp composables/useApi.ts root@147.45.213.22:/var/www/mapmon/composables/
```

### 3. Перезапуск:
```bash
ssh root@147.45.213.22
cd /var/www/mapmon
pm2 restart mapmon
```

### 4. Проверка:
```bash
curl https://fleetmonitor.ru/api/status
# Должен вернуть: {"status":"API Server running with SQLite","database":"connected"}
```

---

**📅 Дата создания:** 17 июня 2025  
**🏷️ Цель:** Переход с v0.6 на v0.7  
**⚡ Приоритет:** Высокий (убрать дублирование MQTT) 