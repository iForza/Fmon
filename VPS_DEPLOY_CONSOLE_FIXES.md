# 🚀 Развертывание исправлений консоли MapMon v0.5.3 на сервере

## 📋 Обзор
Развертывание исправлений критических ошибок консоли на VPS сервере 147.45.213.22

### ✅ Исправленные проблемы:
- MQTT API endpoints (404 ошибки)
- onUnmounted lifecycle hook ошибки
- Валидация координат техники (NaN ошибки)
- Конфигурация @nuxt/icon (404 для иконок)

---

## 🔧 Команды для развертывания

### 1. Подключение к серверу
```bash
ssh mapmon@147.45.213.22
```

### 2. Переход в папку проекта
```bash
cd /var/www/mapmon
```

### 3. Остановка всех процессов
```bash
pm2 stop all
```

### 4. Получение обновлений из Git
```bash
# Проверка текущего состояния
git status

# Получение последних изменений
git pull origin master
```

### 5. Проверка полученных изменений
```bash
# Просмотр последних коммитов
git log --oneline -3

# Проверка что файлы обновились
ls -la server/index.ts
ls -la components/MapComponentFree.vue
ls -la CONSOLE_ERRORS_FIX.md
```

### 6. Установка зависимостей (если нужно)
```bash
yarn install
```

### 7. Очистка и пересборка
```bash
# Очистка старой сборки
rm -rf .output .nuxt

# Установка лимита памяти для сборки
export NODE_OPTIONS="--max-old-space-size=1536"

# Новая сборка
yarn build
```

### 8. Запуск процессов
```bash
# Запуск всех процессов
pm2 start ecosystem.config.js

# Или если нет ecosystem.config.js:
pm2 start .output/server/index.mjs --name "mapmon"
pm2 start server-backup/api-server.cjs --name "mapmon-api"
pm2 start server-backup/mqtt-collector.cjs --name "mqtt-collector"
```

### 9. Проверка статуса
```bash
# Проверка процессов
pm2 list

# Проверка логов
pm2 logs --lines 20
```

### 10. Тестирование исправлений
```bash
# Проверка MQTT API endpoints
curl http://localhost:3001/api/mqtt/status
curl http://localhost:3001/api/mqtt/config

# Проверка основного API
curl http://localhost:3001/api/status

# Проверка веб-интерфейса
curl -I http://localhost:3000
```

---

## 🔍 Проверка результата

### 1. Откройте сайт
- Перейдите на https://fleetmonitor.ru
- Откройте консоль браузера (F12)

### 2. Проверьте исправления
- ✅ **Нет 404 ошибок** для `/api/mqtt/status`
- ✅ **Нет ошибок onUnmounted** lifecycle hooks
- ✅ **Нет ошибок NaN координат** в MapLibre
- ✅ **Нет 404 для иконок** heroicons

### 3. Проверьте MQTT настройки
- Нажмите кнопку шестеренки в заголовке
- Откройте настройки MQTT
- Убедитесь что нет ошибок при загрузке статуса

### 4. Проверьте карту
- Убедитесь что карта загружается без ошибок
- Проверьте что маркеры техники отображаются корректно

---

## 🐛 Диагностика проблем

### Если сборка не удалась:
```bash
# Проверка памяти
free -h

# Если мало памяти - остановите PM2
pm2 stop all

# Увеличьте лимит памяти
export NODE_OPTIONS="--max-old-space-size=2048"

# Пересоберите
yarn build

# Запустите обратно
pm2 start ecosystem.config.js
```

### Если процессы не запускаются:
```bash
# Проверка логов
pm2 logs mapmon --lines 50
pm2 logs mapmon-api --lines 50

# Перезапуск проблемного процесса
pm2 restart mapmon
```

### Если MQTT API не работает:
```bash
# Проверка что API сервер запущен
pm2 list | grep api

# Проверка портов
netstat -tlnp | grep 3001

# Перезапуск API сервера
pm2 restart mapmon-api
```

---

## 📊 Ожидаемый результат

После успешного развертывания:

- ✅ **3 процесса online** в PM2: mapmon, mapmon-api, mqtt-collector
- ✅ **Сайт доступен** на https://fleetmonitor.ru
- ✅ **Чистая консоль** без критических ошибок
- ✅ **MQTT настройки работают** через UI
- ✅ **Карта загружается** без ошибок валидации
- ✅ **API endpoints отвечают** корректно

---

## 🔄 Быстрый откат (если нужно)

```bash
# Остановка процессов
pm2 stop all

# Откат к предыдущему коммиту
git log --oneline -5
git reset --hard HEAD~1

# Пересборка
yarn build

# Запуск
pm2 start ecosystem.config.js
```

---

**Время развертывания:** ~5-10 минут  
**Версия:** MapMon v0.5.3+  
**Статус:** Критические ошибки консоли исправлены ✅ 