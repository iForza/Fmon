# 🔧 Исправление проблемы .nuxt на VPS MapMon

## 📋 Проблема
Папка `.nuxt` была ошибочно добавлена в Git репозиторий, что вызывает конфликты при обновлении на сервере.

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

### 4. Прервите текущий merge:
```bash
git merge --abort
```

### 5. Полностью очистите временные файлы:
```bash
rm -rf .nuxt .output node_modules
```

### 6. Сбросьте Git состояние:
```bash
git reset --hard HEAD
git clean -fd
```

### 7. Получите обновления:
```bash
git pull origin master
```

### 8. Установите зависимости:
```bash
yarn install
```

### 9. Соберите проект:
```bash
export NODE_OPTIONS="--max-old-space-size=1536"
yarn build
```

### 10. Создайте PM2 конфигурацию:
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

### 12. Проверьте статус:
```bash
pm2 list
pm2 logs --lines 20
```

### 13. Сохраните конфигурацию:
```bash
pm2 save
```

## ✅ Ожидаемый результат:
- ✅ 3 процесса online: mapmon, mapmon-api, mqtt-collector
- ✅ Сайт доступен на https://fleetmonitor.ru
- ✅ Исправлены ошибки консоли (404 для MQTT API, onUnmounted, NaN координаты)
- ✅ MQTT настройки работают через UI
- ✅ Графики отображают данные корректно

## 🔍 Проверка исправлений:

### 1. Проверьте MQTT API:
```bash
curl http://localhost:3001/api/mqtt/status
```

### 2. Проверьте веб-интерфейс:
- Откройте https://fleetmonitor.ru
- Нажмите F12 для открытия консоли браузера
- Убедитесь что нет ошибок 404 для `/api/mqtt/status`
- Нажмите на шестеренку в заголовке - должны открыться MQTT настройки

### 3. Проверьте логи:
```bash
pm2 logs mapmon --lines 10
```

## 🆘 Если проблемы:
```bash
# Проверка статуса процессов
pm2 status

# Просмотр логов
pm2 logs --lines 50

# Перезапуск при необходимости
pm2 restart all
```

---

**Дата:** 19.12.2024  
**Версия:** MapMon v0.5.3+  
**Статус:** Исправлены критические ошибки консоли и Git конфликты 