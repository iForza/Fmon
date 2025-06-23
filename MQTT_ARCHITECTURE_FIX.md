# 🔧 ИСПРАВЛЕНИЕ АРХИТЕКТУРЫ MQTT В MAPMON v0.5

## 📋 АНАЛИЗ ПРОБЛЕМ

### ✅ **РЕШЕННЫЕ ПРОБЛЕМЫ:**

#### **Проблема 4: ecosystem.config.cjs**
- ✅ **ИСПРАВЛЕНО**: Создан полный ecosystem.config.cjs для PM2
- 📁 **Файл**: `ecosystem.config.cjs`
- 🔄 **Откат**: `rm ecosystem.config.cjs`

#### **Проблема 8: MQTT API endpoints**  
- ✅ **ИСПРАВЛЕНО**: Добавлено проксирование к реальному API серверу
- 📁 **Файлы**: `server/index.ts`, `server-backup/api-server.cjs`, `server-backup/mqtt-collector.cjs`
- 🔄 **Откат**: `git checkout HEAD~3`

### 🔴 **КРИТИЧЕСКАЯ ПРОБЛЕМА: Протоколы ESP32 ↔ Веб**

**Текущая ситуация:**
- **ESP32**: TCP MQTT (порт 1883) + PubSubClient библиотека
- **Веб**: WebSocket MQTT (порт 8084) + MQTT.js
- **Сервер**: MQTT коллектор TCP (порт 1883) ✅ РАБОТАЕТ

**РЕКОМЕНДАЦИЯ**: Оставить ESP32 на TCP, улучшить серверную архитектуру

---

## 🏗️ НОВАЯ АРХИТЕКТУРА СИСТЕМЫ

```
ESP32 Devices
     ↓ TCP MQTT (1883)
EMQX Cloud Broker
     ↓ WebSocket MQTT (8084)  
MQTT Collector (server-backup/mqtt-collector.cjs)
     ↓ HTTP API
API Server (server-backup/api-server.cjs:3001)
     ↓ HTTP Proxy
Main Nuxt App (server/index.ts:3000)
     ↓ WebSocket/HTTP
Browser Frontend
```

---

## 🚀 ПЛАН РАЗВЕРТЫВАНИЯ

### **ШАГ 1: Проверка файлов на сервере**

```bash
# Подключаемся к серверу
ssh user@147.45.213.22

# Проверяем наличие всех файлов
cd /var/www/mapmon
ls -la ecosystem.config.cjs
ls -la server-backup/mqtt-collector.cjs
ls -la server-backup/api-server.cjs
ls -la server-backup/SQLiteManager.cjs
```

### **ШАГ 2: Установка зависимостей**

```bash
# Устанавливаем недостающие зависимости для MQTT
npm install mqtt @fastify/cors

# Проверяем установку
npm list mqtt
npm list @fastify/cors
```

### **ШАГ 3: Запуск PM2 с новой конфигурацией**

```bash
# Останавливаем существующие процессы
pm2 stop all
pm2 delete all

# Проверяем что ecosystem.config.cjs существует
cat ecosystem.config.cjs

# Запускаем с новой конфигурацией
pm2 start ecosystem.config.cjs

# Проверяем статус
pm2 status
pm2 logs --lines 50
```

### **ШАГ 4: Проверка работы системы**

```bash
# Проверяем основное приложение (порт 3000)
curl http://localhost:3000/api/vehicles

# Проверяем API сервер (порт 3001) 
curl http://localhost:3001/api/mqtt/status

# Проверяем MQTT endpoints через проксирование
curl http://localhost:3000/api/mqtt/status

# Проверяем логи MQTT коллектора
pm2 logs mqtt-collector --lines 20
```

---

## 🔧 КОМАНДЫ ДЛЯ СЕРВЕРА

### **Быстрое развертывание:**

```bash
#!/bin/bash
echo "🚀 Развертывание исправлений MQTT архитектуры..."

# Переходим в директорию проекта
cd /var/www/mapmon

# Получаем последние изменения
git pull origin master

# Устанавливаем зависимости
npm install

# Перезапускаем PM2 с новой конфигурацией
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.cjs

# Проверяем статус
sleep 5
pm2 status

# Проверяем API endpoints
echo "🧪 Тестирование API endpoints..."
curl -s http://localhost:3000/api/mqtt/status | jq
curl -s http://localhost:3001/api/mqtt/status | jq

echo "✅ Развертывание завершено!"
```

### **Команды диагностики:**

```bash
# Проверка портов
netstat -tulnp | grep -E "(3000|3001|1883|8084)"

# Проверка процессов PM2
pm2 monit

# Просмотр логов в реальном времени
pm2 logs --timestamp

# Проверка подключения к MQTT
telnet o0acf6a7.ala.dedicated.gcp.emqxcloud.com 1883
```

---

## 🔄 ОТКАТ ИЗМЕНЕНИЙ

### **Полный откат до предыдущего состояния:**

```bash
#!/bin/bash
echo "🔙 Откат изменений MQTT архитектуры..."

# Останавливаем PM2
pm2 stop all
pm2 delete all

# Откатываем Git изменения
cd /var/www/mapmon
git checkout HEAD~5  # Откатываем последние 5 коммитов

# Удаляем созданные файлы
rm -f ecosystem.config.cjs
rm -f MQTT_ARCHITECTURE_FIX.md

# Перезапускаем старую конфигурацию
npm run build
pm2 start "npm start" --name mapmon

echo "🔙 Откат завершен. Система в предыдущем состоянии."
```

### **Частичный откат отдельных компонентов:**

```bash
# Откат только ecosystem.config.cjs
rm ecosystem.config.cjs

# Откат только server/index.ts
git checkout HEAD~1 server/index.ts

# Откат MQTT коллектора
git checkout HEAD~1 server-backup/mqtt-collector.cjs

# Откат API сервера
git checkout HEAD~1 server-backup/api-server.cjs
```

---

## 📊 ТЕСТИРОВАНИЕ СИСТЕМЫ

### **1. Тест MQTT коллектора:**

```bash
# Проверяем подключение к MQTT брокеру
pm2 logs mqtt-collector | grep -E "(Connected|Error|📡)"
```

### **2. Тест API endpoints:**

```bash
# Тест статуса MQTT
curl -X GET http://localhost:3000/api/mqtt/status

# Тест конфигурации MQTT
curl -X POST http://localhost:3000/api/mqtt/config \
  -H "Content-Type: application/json" \
  -d '{"server":"test","port":1883}'

# Тест перезапуска MQTT
curl -X POST http://localhost:3000/api/mqtt/restart
```

### **3. Тест веб-интерфейса:**

```bash
# Открываем в браузере
http://147.45.213.22

# Проверяем вкладку "Настройки MQTT"
# Должна отображаться без 404 ошибок
```

---

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### **Проблема: PM2 не может запустить процессы**

```bash
# Решение 1: Проверяем права доступа
chmod +x server-backup/*.cjs
chown -R user:user /var/www/mapmon

# Решение 2: Устанавливаем зависимости глобально
npm install -g mqtt @fastify/cors

# Решение 3: Пересоздаем ecosystem.config.cjs
rm ecosystem.config.cjs
# Скопировать содержимое из этой инструкции заново
```

### **Проблема: MQTT коллектор не подключается**

```bash
# Проверяем сетевое подключение
ping o0acf6a7.ala.dedicated.gcp.emqxcloud.com

# Проверяем порты
telnet o0acf6a7.ala.dedicated.gcp.emqxcloud.com 8084

# Проверяем логи
pm2 logs mqtt-collector --lines 100
```

### **Проблема: API endpoints возвращают 404**

```bash
# Проверяем что API сервер запущен
pm2 status | grep api

# Проверяем прямое подключение к API серверу
curl http://localhost:3001/api/mqtt/status

# Перезапускаем весь стек
pm2 restart all
```

---

## 📈 МОНИТОРИНГ СИСТЕМЫ

### **Команды для постоянного мониторинга:**

```bash
# Мониторинг в реальном времени
watch -n 2 'pm2 status && echo "=== MQTT Status ===" && curl -s http://localhost:3000/api/mqtt/status | jq'

# Мониторинг логов
pm2 logs --timestamp --format

# Мониторинг ресурсов
pm2 monit
```

---

## ✅ КРИТЕРИИ УСПЕХА

**Система работает корректно если:**

1. ✅ PM2 показывает 3 процесса: `mapmon`, `mapmon-api`, `mqtt-collector`
2. ✅ `/api/mqtt/status` возвращает валидный JSON без 404
3. ✅ MQTT коллектор подключен к брокеру и получает данные
4. ✅ Веб-интерфейс отображается без консольных ошибок
5. ✅ Настройки MQTT доступны через веб-интерфейс

**После выполнения всех шагов система будет готова к подключению ESP32 устройств!**

---

*📅 Создано: $(date)*  
*👤 Версия: MapMon v0.5 MQTT Architecture Fix* 