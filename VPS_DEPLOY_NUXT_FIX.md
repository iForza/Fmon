# 🔧 Исправление проблемы .nuxt на VPS MapMon

## 📋 Обнаруженные проблемы
1. **404 ошибки для MQTT API endpoints** (`/api/mqtt/status`, `/api/mqtt/config`, `/api/mqtt/restart`)
2. **Отсутствующие серверные зависимости** (`better-sqlite3`, `express`, `mqtt`)
3. **База данных только для чтения** (SQLite permissions)
4. **Папка .nuxt** была ошибочно добавлена в Git репозиторий

## ✅ Решение (выполнить на VPS)

### 1. Подключитесь к серверу:
```bash
ssh mapmon@147.45.213.22
```

### 2. Перейдите в папку проекта:
```bash
cd /var/www/mapmon
```

### 3. Остановите все процессы:
```bash
pm2 stop all
```

### 4. Получите обновления с исправлениями MQTT API:
```bash
git pull origin master
```

### 5. Установите отсутствующие серверные зависимости:
```bash
# Установка зависимостей для server-backup
cd server-backup
npm install better-sqlite3 express mqtt fastify @fastify/cors

# Возврат в корень проекта
cd ..
```

### 6. Исправьте права доступа к базе данных:
```bash
# Создание папки для базы данных если не существует
mkdir -p data

# Установка правильных прав доступа
sudo chown -R mapmon:mapmon /var/www/mapmon
sudo chmod 755 /var/www/mapmon
sudo chmod 644 /var/www/mapmon/server-backup/*.db 2>/dev/null || true
```

### 7. Полностью очистите временные файлы:
```bash
rm -rf .nuxt .output node_modules
```

### 8. Установите зависимости фронтенда:
```bash
yarn install
```

### 9. Соберите проект:
```bash
export NODE_OPTIONS="--max-old-space-size=1536"
yarn build
```

### 10. Создайте обновленную PM2 конфигурацию:
```bash
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mapmon',
      script: '.output/server/index.mjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', NITRO_PORT: 3000, NITRO_HOST: '0.0.0.0' },
      error_file: './logs/mapmon-error.log',
      out_file: './logs/mapmon-out.log',
      log_file: './logs/mapmon-combined.log',
      time: true
    },
    {
      name: 'mapmon-api',
      script: 'server-backup/api-server.cjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      env: { NODE_ENV: 'production' },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'mqtt-collector',
      script: 'server-backup/mqtt-collector.cjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      env: { NODE_ENV: 'production' },
      error_file: './logs/mqtt-error.log',
      out_file: './logs/mqtt-out.log',
      log_file: './logs/mqtt-combined.log',
      time: true
    }
  ]
}
EOF
```

### 11. Создайте папку для логов и запустите:
```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
```

### 12. Проверьте статус и исправления:
```bash
pm2 list
pm2 logs --lines 20

# Проверка MQTT API endpoints
curl http://localhost:3001/api/mqtt/status
curl http://localhost:3001/api/status
```

### 13. Сохраните конфигурацию:
```bash
pm2 save
```

## ✅ Ожидаемый результат:
- ✅ 3 процесса online: mapmon, mapmon-api, mqtt-collector
- ✅ Сайт доступен на https://fleetmonitor.ru
- ✅ **ИСПРАВЛЕНО**: MQTT API endpoints отвечают корректно (больше нет 404)
- ✅ **ИСПРАВЛЕНО**: Серверные зависимости установлены
- ✅ **ИСПРАВЛЕНО**: База данных работает корректно
- ✅ MQTT настройки работают через UI (кнопка шестеренки)
- ✅ Графики отображают данные корректно

## 🔍 Проверка исправлений:

### 1. Проверьте MQTT API (должны работать без 404):
```bash
# Эти команды должны возвращать JSON вместо 404
curl http://localhost:3001/api/mqtt/status
curl -X POST http://localhost:3001/api/mqtt/config -H "Content-Type: application/json" -d '{"test": true}'
```

### 2. Проверьте веб-интерфейс:
- Откройте https://fleetmonitor.ru
- Нажмите F12 для открытия консоли браузера
- **Должно быть исправлено**: больше нет ошибок 404 для `/api/mqtt/status`
- Нажмите на шестеренку в заголовке - должны открыться MQTT настройки **без ошибок**

### 3. Проверьте логи (не должно быть ошибок зависимостей):
```bash
pm2 logs mapmon-api --lines 10
pm2 logs mqtt-collector --lines 10
```

## 🆘 Если проблемы:
```bash
# Проверка статуса процессов
pm2 status

# Просмотр логов для диагностики
pm2 logs --lines 50

# Перезапуск при необходимости
pm2 restart all

# Проверка установленных зависимостей
cd server-backup && npm list
```

## 📝 Что было исправлено:

1. **✅ MQTT API endpoints** - добавлены в `server-backup/api-server.cjs`
2. **✅ Серверные зависимости** - команды установки `better-sqlite3`, `express`, `mqtt`
3. **✅ Права доступа** - исправление прав для SQLite базы данных
4. **✅ Git конфликты** - очистка .nuxt папки из репозитория

---

**Дата:** 22.06.2025  
**Версия:** MapMon v0.5.3+  
**Статус:** Исправлены критические ошибки MQTT API 404 и зависимости 