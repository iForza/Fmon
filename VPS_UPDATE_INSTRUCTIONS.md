# 🚀 Инструкции по обновлению VPS MapMon v0.5.2

## 📋 Обзор обновления

**Версия:** 0.5.2  
**Дата:** 19.12.2024  
**Сервер:** 147.45.213.22 (mapmon@user)

### ✨ Новые возможности v0.5.2:
- ✅ **Фиксированные временные диапазоны** - графики всегда показывают полный выбранный период
- ✅ **Сохранение состояния зума** - увеличение графика не сбрасывается при обновлении данных
- ✅ **Инертность данных 10 сек** - последние значения сохраняются при кратковременных сбоях связи
- ✅ **Интерполяция данных** - заполнение пропусков во временных рядах
- ✅ **Локальное кеширование** - оптимизация производительности графиков
- ✅ **MQTT настройки через UI** - интерфейс управления MQTT подключением
- ✅ **SQLite интеграция** - поддержка температуры и RPM в базе данных

---

## 🔧 Пошаговое обновление

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
# Остановка PM2 процессов
pm2 stop all
pm2 delete all

# Проверка что все остановлено
pm2 list
```

### 4. Резервное копирование (рекомендуется)
```bash
# Создание резервной копии текущей версии
sudo cp -r /var/www/mapmon /var/www/mapmon-backup-$(date +%Y%m%d-%H%M%S)

# Резервная копия базы данных
cp telemetry.db telemetry-backup-$(date +%Y%m%d-%H%M%S).db
```

### 5. Получение обновлений из Git
```bash
# Проверка текущей ветки
git branch

# Получение последних изменений
git fetch origin
git pull origin master

# Проверка версии
git log --oneline -5
```

### 6. Обновление зависимостей
```bash
# Frontend (Nuxt)
yarn install

# Backend зависимости (если изменились)
cd server-backup
npm install
cd ..
```

### 7. Сборка обновленного frontend
```bash
# Очистка старой сборки
rm -rf .output dist

# Новая сборка с оптимизацией памяти
export NODE_OPTIONS="--max-old-space-size=1536"
yarn build

# Проверка успешной сборки
ls -la .output
```

### 8. Обновление PM2 конфигурации
Создайте файл `ecosystem.config.js`:
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mapmon',
      script: '.output/server/index.mjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0'
      },
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
      env: {
        NODE_ENV: 'production'
      },
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
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/mqtt-error.log',
      out_file: './logs/mqtt-out.log',
      log_file: './logs/mqtt-combined.log',
      time: true
    }
  ]
}
EOF
```

### 9. Создание папки для логов
```bash
mkdir -p logs
```

### 10. Запуск обновленных процессов
```bash
# Запуск через PM2
pm2 start ecosystem.config.js

# Проверка статуса
pm2 list
pm2 logs --lines 20
```

### 11. Сохранение конфигурации PM2
```bash
# Сохранение текущей конфигурации
pm2 save

# Автозапуск при перезагрузке сервера
pm2 startup
```

---

## 🔍 Проверка работоспособности

### 1. Проверка процессов
```bash
pm2 list
# Все процессы должны быть в статусе "online"
```

### 2. Проверка портов
```bash
sudo netstat -tlnp | grep -E ":(3000|3001)"
# Должны быть открыты порты 3000 (Nuxt) и 3001 (API)
```

### 3. Проверка логов
```bash
# Основной лог Nuxt
pm2 logs mapmon --lines 20

# Лог API сервера  
pm2 logs mapmon-api --lines 20

# Лог MQTT коллектора
pm2 logs mqtt-collector --lines 20
```

### 4. Тестирование API endpoints
```bash
# Проверка статуса API
curl http://localhost:3001/api/status

# Проверка техники
curl http://localhost:3001/api/vehicles

# Проверка телеметрии
curl http://localhost:3001/api/telemetry/latest
```

### 5. Проверка веб-интерфейса
- Откройте http://147.45.213.22:3000
- Проверьте, что загружается главная страница
- Перейдите на страницу аналитики `/analytics`
- Убедитесь что графики работают корректно:
  - **Временные диапазоны**: выберите "Последний час" - график должен показать полный час
  - **Зум**: увеличьте график Ctrl+колесико, подождите обновления - зум должен сохраниться
  - **Данные**: при отключении ESP32 значения должны сохраняться 10 секунд
- Проверьте MQTT настройки через кнопку шестеренки в заголовке

---

## 🐛 Диагностика проблем

### Проблема: Сайт не загружается
```bash
# Проверка статуса PM2
pm2 list

# Если процессы не запущены
pm2 start ecosystem.config.js

# Проверка портов
sudo netstat -tlnp | grep 3000
```

### Проблема: Ошибки сборки
```bash
# Очистка node_modules и повторная установка
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Проблема: Нехватка памяти при сборке
```bash
# Увеличение лимита памяти Node.js
export NODE_OPTIONS="--max-old-space-size=2048"
yarn build

# Если все равно не хватает памяти - остановите PM2
pm2 stop all
yarn build
pm2 start ecosystem.config.js
```

### Проблема: Графики не работают
```bash
# Проверка API сервера
curl http://localhost:3001/api/telemetry/history?range=1h

# Проверка логов API
pm2 logs mapmon-api

# Проверка MQTT коллектора
pm2 logs mqtt-collector
```

### Проблема: MQTT не подключается
```bash
# Проверка MQTT коллектора
pm2 logs mqtt-collector --lines 50

# Перезапуск MQTT коллектора
pm2 restart mqtt-collector

# Проверка файла настроек MQTT (если есть)
ls -la server-backup/SQLiteManager.cjs
```

---

## 🔄 Откат к предыдущей версии

### Если что-то пошло не так:

1. **Остановка процессов:**
```bash
pm2 stop all
pm2 delete all
```

2. **Восстановление из резервной копии:**
```bash
# Найти резервную копию
ls /var/www/mapmon-backup-*

# Восстановить
sudo rm -rf /var/www/mapmon
sudo mv /var/www/mapmon-backup-YYYYMMDD-HHMMSS /var/www/mapmon
cd /var/www/mapmon
```

3. **Запуск старой версии:**
```bash
pm2 start ecosystem.config.js
```

---

## 📊 Проверочный чеклист

После обновления убедитесь что:

- [ ] ✅ Сайт доступен по адресу http://147.45.213.22:3000
- [ ] ✅ Все 3 процесса запущены в PM2 (mapmon, mapmon-api, mqtt-collector)
- [ ] ✅ API отвечает на http://147.45.213.22:3001/api/status
- [ ] ✅ Страница аналитики загружается (/analytics)
- [ ] ✅ Графики отображают данные с фиксированными временными диапазонами
- [ ] ✅ Зум сохраняется при обновлении данных
- [ ] ✅ MQTT настройки доступны через UI (кнопка шестеренки)
- [ ] ✅ ESP32 данные отображаются на карте (если устройства подключены)
- [ ] ✅ Нет критических ошибок в логах PM2

---

## 📞 Поддержка

При возникновении проблем:

1. **Сохраните логи:**
```bash
pm2 logs > /tmp/mapmon-logs-$(date +%Y%m%d-%H%M%S).txt
```

2. **Проверьте системные ресурсы:**
```bash
free -h
df -h
top
```

3. **Опишите проблему** с указанием:
   - Какие действия выполнялись
   - Текст ошибки
   - Содержимое логов
   - Результат команды `pm2 list`

---

**Обновление завершено! 🎉**  
MapMon v0.5.2 с улучшенными графиками готов к работе. 