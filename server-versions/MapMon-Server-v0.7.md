# 🚀 MapMon Server v0.7 - API Архитектура

> **⚠️ НЕ РЕДАКТИРОВАТЬ ЭТОТ ФАЙЛ!** Только копировать для создания новой версии.

**Дата создания:** 17 июня 2025  
**Основные изменения:** Убрано дублирование MQTT, переход на API архитектуру

---

## 🏗️ Архитектура сервера

### 🖥️ Сервер
- **IP:** 147.45.213.22
- **Домен:** fleetmonitor.ru (с SSL)
- **OS:** Ubuntu 22.04
- **Ресурсы:** 1 CPU, 2GB RAM, 30GB NVMe

### 🔧 Установленные сервисы
- **Node.js:** v20 LTS
- **PM2:** Управление процессами
- **Nginx:** Reverse proxy + SSL (Let's Encrypt)
- **SQLite3:** База данных
- **better-sqlite3:** Node.js драйвер

---

## 📊 Архитектура приложения

### 🔄 PM2 Процессы
```
┌─────┬─────────────────┬────────┬─────┬──────────┬─────────┬──────────┐
│ id  │ name            │ mode   │ ↺   │ status   │ cpu     │ memory   │
├─────┼─────────────────┼────────┼─────┼──────────┼─────────┼──────────┤
│ 3   │ mapmon          │ fork   │ 0   │ online   │ 0%      │ 80.4mb   │
│ 1   │ mapmon-api      │ fork   │ 1   │ online   │ 0%      │ 60.2mb   │
│ 4   │ mqtt-collector  │ fork   │ 0   │ online   │ 0%      │ 55mb     │
└─────┴─────────────────┴────────┴─────┴──────────┴─────────┴──────────┘
```

**1. mapmon (Frontend):**
- **Команда:** `yarn dev --host 0.0.0.0 --port 3000`
- **Назначение:** Nuxt 3 приложение с API клиентом
- **Порт:** 3000

**2. mapmon-api (Backend API):**
- **Файл:** `/var/www/mapmon/server/api-server.cjs`
- **Порт:** 3001

**3. mqtt-collector (MQTT клиент):**
- **Файл:** `/var/www/mapmon/server/mqtt-collector.cjs`

---

## 🔄 Поток данных

### ✅ **НОВАЯ АРХИТЕКТУРА v0.7:**
```
ESP32 → EMQX Cloud MQTT
         ↓
🖥️ Серверный MQTT коллектор (mqtt-collector.cjs)
         ↓
💾 SQLite база данных
         ↓
🔗 API сервер (api-server.cjs:3001)
         ↓
🌐 Frontend с API клиентом (useApi.ts)
```

### ❌ **УБРАНО из v0.6:**
- **Браузерный MQTT клиент** (useMqtt.ts) - больше не используется
- **Дублирование подключений** к EMQX Cloud
- **Конфликты client ID** при множественных подключениях

---

## 🗄️ База данных SQLite

### 📁 Расположение
- **Файл:** `/var/www/mapmon/sqlite/mapmon.db`
- **Схема:** `/var/www/mapmon/sqlite/schema.sql`
- **Менеджер:** `/var/www/mapmon/sqlite/SQLiteManager.cjs`

### 📋 Структура таблиц
```sql
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    vehicle_id TEXT, 
    timestamp INTEGER, 
    lat REAL, 
    lng REAL, 
    speed REAL, 
    battery REAL
);
```

---

## 🌐 API Эндпоинты

**База:** http://localhost:3001/api/

```
GET /api/status           - Статус API и БД
GET /api/vehicles         - Список всей техники
GET /api/telemetry        - Последние 100 записей
GET /api/telemetry/latest - То же что /api/telemetry
```

---

## 📡 MQTT Конфигурация

### 🔗 EMQX Cloud (только серверный клиент)
- **URL:** `wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt`
- **Username:** `iforza`
- **Password:** `iforza`
- **Client ID:** `mapmon-server-` + timestamp

### 📋 Топики
```
- car
- vehicles/+/telemetry  
- vehicles/+/status
- vehicles/+/heartbeat
```

---

## 🔧 Frontend изменения

### 📁 Новые файлы
- **`composables/useApi.ts`** - API клиент вместо MQTT
- **Обновленный `app.vue`** - интерфейс с API архитектурой

### 🔄 Как работает Frontend
1. **Инициализация:** `useApi().initialize()`
2. **Получение данных:** HTTP запросы к `/api/telemetry`
3. **Real-time обновления:** Polling каждые 5 секунд
4. **WebSocket:** Подготовлено для будущего real-time

### 📊 Интерфейс
- **Вкладка "Техника":** Список ESP32 устройств
- **Вкладка "API":** Статус серверного API, архитектура
- **Вкладка "Аналитика":** Статистика (подготовлено)

---

## 🔄 Ключевые изменения в v0.7

### ❌ Удалено
- **Браузерный MQTT клиент** - полностью убран
- **useMqtt.ts** - больше не используется в frontend
- **Дублирование MQTT подключений**
- **MQTT зависимость** из package.json frontend

### ✅ Добавлено  
- **useApi.ts** - новый API клиент
- **API архитектура** в app.vue
- **Централизованный поток данных** через сервер
- **Polling механизм** для обновлений

### 🔧 Исправлено
- **Производительность:** Меньше нагрузки на MQTT брокер
- **Стабильность:** Один источник данных
- **Масштабируемость:** Легко добавлять новых клиентов

---

## 🎯 Статус работы

### ✅ Что работает
- **Frontend:** https://fleetmonitor.ru (с API клиентом)
- **MQTT:** Только серверный коллектор получает данные
- **SQLite:** Централизованное хранение данных
- **API:** Отдает данные frontend через HTTP

### 🚀 Улучшения
- **Меньше подключений:** 1 MQTT клиент вместо 2
- **Надежность:** Кэширование в SQLite
- **Простота:** Один поток данных
- **Отзывчивость:** Polling каждые 5 секунд

---

## 🔐 Nginx конфигурация

### 🔄 Прокси (без изменений)
```nginx
# Frontend
location / {
    proxy_pass http://127.0.0.1:3000;
}

# API
location /api/ {
    proxy_pass http://127.0.0.1:3001;
}
```

---

## 📝 Команды развертывания v0.7

### 1. Git обновление:
```bash
cd /var/www/mapmon
git pull origin master
```

### 2. Установка зависимостей:
```bash
yarn install
```

### 3. Перезапуск:
```bash
pm2 restart mapmon
```

### 4. Проверка:
```bash
curl https://fleetmonitor.ru/api/status
# {"status":"API Server running with SQLite","database":"connected"}
```

---

## 📊 Сравнение версий

| Аспект | v0.6 (MQTT дублирование) | v0.7 (API архитектура) |
|--------|---------------------------|-------------------------|
| MQTT клиенты | 2 (сервер + браузер) | 1 (только сервер) |
| Источник данных | MQTT + SQLite | Только SQLite через API |
| Производительность | Избыточность | Оптимизирована |
| Сложность | Высокая | Упрощена |
| Надежность | Конфликты возможны | Стабильная |

---

**📅 Дата:** 17 июня 2025  
**🏷️ Версия:** MapMon v0.7  
**✅ Статус:** API архитектура без дублирования MQTT** 