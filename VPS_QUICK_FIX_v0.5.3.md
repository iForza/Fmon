# 🔧 Быстрое исправление MapMon v0.5.3 на сервере

## Проблема
Конфликт в `package.json` при обновлении - на сервере отсутствуют серверные зависимости.

## ✅ Решение (5 минут)

### 1. На сервере настройте Git и получите обновления:
```bash
cd /var/www/mapmon
git config user.email "mapmon@server.local"
git config user.name "MapMon Server"
git add package.json
git commit -m "Разрешен конфликт package.json при обновлении v0.5.3"
git pull origin master
```

### 2. Установите зависимости и пересоберите:
```bash
yarn install
rm -rf .nuxt .output
export NODE_OPTIONS="--max-old-space-size=1536"
yarn build
```

### 3. Создайте PM2 конфигурацию:
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

### 4. Запустите процессы:
```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

### 5. Проверьте результат:
```bash
pm2 status
curl -I http://localhost:3000
curl http://localhost:3001/api/mqtt/status
```

## ✅ Ожидаемый результат:
- ✅ 3 процесса online: mapmon, mapmon-api, mqtt-collector  
- ✅ Сайт доступен на https://fleetmonitor.ru
- ✅ MQTT настройки работают (шестеренка в заголовке)
- ✅ Нет ошибок форматирования времени в консоли

## 🆘 Если проблемы:
```bash
pm2 logs --lines 50
``` 