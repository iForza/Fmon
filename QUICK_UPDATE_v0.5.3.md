# 🚀 Быстрое обновление MapMon v0.5.3

## ⚡ Краткие команды для обновления сервера

### 1. Подключение и остановка
```bash
ssh mapmon@147.45.213.22
cd /var/www/mapmon
pm2 stop all
pm2 delete all
```

### 2. Обновление кода
```bash
git pull origin master
yarn install
```

### 3. Сборка
```bash
rm -rf .output
export NODE_OPTIONS="--max-old-space-size=1536"
yarn build
```

### 4. Создание PM2 конфигурации (если нет ecosystem.config.cjs)
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

### 5. Запуск
```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

### 6. Проверка
```bash
pm2 status
curl -I http://localhost:3000
curl http://localhost:3001/api/mqtt/status
```

## ✅ Ожидаемый результат:
- 3 процесса online: mapmon, mapmon-api, mqtt-collector
- Сайт доступен на https://fleetmonitor.ru
- MQTT настройки работают (шестеренка в заголовке)
- Графики с фиксированными диапазонами времени
- Нет ошибок форматирования времени в консоли

## 🚨 Если что-то не работает:
```bash
pm2 logs --lines 50
```

**Время обновления:** ~5 минут 