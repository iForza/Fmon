# 🔧 ПЛАН РЕШЕНИЯ: Некорректная конфигурация PM2

## 🚨 ПРОБЛЕМА
**В ecosystem.config.cjs настроены 3 процесса, но должно быть 2 + неоптимальные настройки**

### Текущая конфигурация:
```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon-api',
      script: './server-backup/api-server.cjs',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 3001 }
    },
    {
      name: 'mapmon-frontend',
      script: 'yarn',
      args: 'build && yarn preview',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'mapmon-mqtt',
      script: './server-backup/mqtt-collector.cjs',
      env: { NODE_ENV: 'production' }
    }
  ]
}
```

### Проблемы:
1. ❌ `mapmon-frontend` не должен быть PM2 процессом (статика)
2. ❌ `yarn build && yarn preview` неэффективно
3. ❌ Нет настроек restart policy
4. ❌ Нет логирования
5. ❌ Нет мониторинга ресурсов

## 🎯 ЦЕЛЬ
Оптимизировать PM2 конфигурацию для стабильной работы на VPS

## 📋 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Анализ архитектуры после решения проблемы #3

#### Если выбран Nuxt API (рекомендуемый):
```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon-app',
      script: './.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NUXT_PORT: 3000,
        NUXT_HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mapmon-mqtt',
      script: './server-backup/mqtt-collector.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

#### Если остается Fastify архитектура:
```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon-api',
      script: './server-backup/api-server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'mapmon-mqtt',
      script: './server-backup/mqtt-collector.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

### Шаг 2: Добавить оптимальные настройки PM2

```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon-app',
      script: './.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      
      // Restart policy
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 1000,
      
      // Memory management
      max_memory_restart: '512M',
      
      // Logging
      log_file: './logs/mapmon-app.log',
      error_file: './logs/mapmon-app-error.log',
      out_file: './logs/mapmon-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Environment
      env: {
        NODE_ENV: 'production',
        NUXT_PORT: 3000,
        NUXT_HOST: '0.0.0.0'
      },
      
      // Monitoring
      pmx: true,
      
      // Process management
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Watch (только для development)
      watch: false,
      ignore_watch: ['logs', 'node_modules', '.git']
    },
    {
      name: 'mapmon-mqtt',
      script: './server-backup/mqtt-collector.cjs',
      instances: 1,
      exec_mode: 'fork',
      
      // Restart policy
      autorestart: true,
      max_restarts: 10, // MQTT может чаще обрываться
      min_uptime: '5s',
      restart_delay: 2000,
      
      // Memory management
      max_memory_restart: '256M',
      
      // Logging
      log_file: './logs/mapmon-mqtt.log',
      error_file: './logs/mapmon-mqtt-error.log',
      out_file: './logs/mapmon-mqtt-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Environment
      env: {
        NODE_ENV: 'production'
      },
      
      // Monitoring
      pmx: true
    }
  ]
}
```

### Шаг 3: Настройка Nginx для статики (вместо PM2 frontend)

```nginx
# /etc/nginx/sites-available/mapmon
server {
    listen 80;
    server_name 147.45.213.22;
    
    # Статические файлы Nuxt
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API прокси (если используется отдельный Fastify)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Шаг 4: Создать папку для логов

```bash
mkdir -p logs
touch logs/.gitkeep
```

### Шаг 5: Обновить .gitignore

```gitignore
# PM2 logs
logs/*.log
```

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Валидация конфигурации
```bash
pm2 ecosystem ecosystem.config.cjs
```

### Тест 2: Запуск и мониторинг
```bash
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs
pm2 monit
```

### Тест 3: Тест перезапуска
```bash
# Симуляция крэша
pm2 stop mapmon-app
# Проверить автоматический перезапуск
pm2 status
```

### Тест 4: Тест нагрузки памяти
```bash
# Мониторинг использования памяти
pm2 monit
# Проверить что процессы перезапускаются при превышении лимита
```

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Проблема 1: Права доступа к логам
```bash
# Решение: Установить правильные права
sudo chown -R $USER:$USER logs/
chmod 755 logs/
```

### Проблема 2: Порты заняты
```bash
# Проверить занятые порты
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Остановить конфликтующие процессы
sudo fuser -k 3000/tcp
```

### Проблема 3: Нехватка памяти
```javascript
// Уменьшить лимиты памяти для VPS 2GB
max_memory_restart: '300M', // для основного приложения
max_memory_restart: '128M', // для MQTT коллектора
```

## 📊 ОПТИМИЗАЦИЯ ДЛЯ VPS 2GB RAM

```javascript
// Специальная конфигурация для малого VPS
module.exports = {
  apps: [
    {
      name: 'mapmon-app',
      script: './.output/server/index.mjs',
      instances: 1, // НЕ cluster mode для экономии памяти
      exec_mode: 'fork',
      max_memory_restart: '400M',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=512'
      }
    },
    {
      name: 'mapmon-mqtt',
      script: './server-backup/mqtt-collector.cjs',
      instances: 1,
      max_memory_restart: '128M',
      node_args: '--max-old-space-size=256'
    }
  ]
}
```

## 📋 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

- [ ] Определиться с архитектурой (Nuxt API vs Fastify)
- [ ] Обновить ecosystem.config.cjs
- [ ] Создать папку logs/
- [ ] Обновить .gitignore
- [ ] Настроить Nginx (если нужно)
- [ ] Протестировать PM2 конфигурацию
- [ ] Проверить автоматические перезапуски
- [ ] Настроить мониторинг
- [ ] Развернуть на VPS

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

- ✅ Только 2 необходимых PM2 процесса
- ✅ Автоматические перезапуски при сбоях
- ✅ Логирование всех событий
- ✅ Мониторинг использования ресурсов
- ✅ Оптимизация для VPS 2GB RAM
- ✅ Стабильная работа 24/7 