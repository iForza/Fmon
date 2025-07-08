# 🚀 Инструкции по обновлению VPS сервера MapMon v0.5

## 📋 Обзор изменений

**Дата обновления**: 2025-01-08  
**Версия**: v0.5 с исправлениями утечек памяти  
**GitHub репозиторий**: https://github.com/iForza/Fmon.git

### ✅ Основные исправления в этом обновлении:
1. **Исправлены утечки памяти в frontend polling**
2. **Улучшена стабильность работы системы**
3. **Добавлена документация и правила разработки**
4. **Создана система откатов для безопасности**

---

## 🔄 Пошаговые инструкции для обновления VPS

### Шаг 1: Создание backup текущей системы

```bash
# Подключитесь к VPS серверу
ssh your-user@your-vps-ip

# Создайте backup текущей системы
cd /path/to/your/mapmon/project
cp -r . ../mapmon-backup-$(date +%Y%m%d-%H%M)

# Остановите текущие процессы PM2 (если работают)
pm2 stop all
pm2 save
```

### Шаг 2: Обновление кода из GitHub

```bash
# Перейдите в папку проекта
cd /path/to/your/mapmon/project

# Сохраните локальные изменения (если есть)
git stash

# Получите последние изменения
git fetch origin
git pull origin master

# Восстановите локальные изменения если нужно
git stash pop
```

### Шаг 3: Обновление зависимостей

```bash
# Обновите Node.js зависимости
npm ci

# Или если есть изменения в package.json
npm install

# Проверьте установку
npm ls
```

### Шаг 4: Проверка конфигурации

```bash
# Проверьте файл окружения
cp env.example .env
nano .env

# Убедитесь что настроены:
# - База данных SQLite
# - MQTT настройки (если используете приватный брокер)
# - Порты и URL
```

### Шаг 5: Сборка проекта

```bash
# Соберите Nuxt приложение для production
npm run build

# Проверьте что сборка прошла успешно
ls -la .output/
```

### Шаг 6: Перезапуск сервисов

```bash
# Запустите сервисы через PM2
pm2 start ecosystem.config.cjs

# Проверьте статус
pm2 status

# Проверьте логи
pm2 logs
```

---

## 🔍 Проверка работоспособности

### Проверка API сервера:
```bash
# Проверьте API
curl http://localhost:3001/api/status

# Должен вернуть:
# {"status":"API Server running with SQLite"}
```

### Проверка Frontend:
```bash
# Проверьте frontend
curl http://localhost:3000

# Должен вернуть HTML страницу
```

### Проверка процессов PM2:
```bash
pm2 status

# Должно показать 3 процесса:
# - mapmon (Nuxt frontend)
# - mapmon-api (Fastify API)
# - mqtt-collector (MQTT данные)
```

---

## 🐛 Решение проблем

### Если не запускается frontend:

```bash
# Проверьте логи
pm2 logs mapmon

# Пересоберите проект
npm run build
pm2 restart mapmon
```

### Если не работает API:

```bash
# Проверьте логи API
pm2 logs mapmon-api

# Проверьте SQLite базу
ls -la server-backup/mapmon.db

# Перезапустите API
pm2 restart mapmon-api
```

### Если не поступают MQTT данные:

```bash
# Проверьте MQTT collector
pm2 logs mqtt-collector

# Проверьте подключение к брокеру
# (должен использовать test.mosquitto.org для отладки)

# Перезапустите collector
pm2 restart mqtt-collector
```

---

## 🔄 Откат к предыдущей версии

Если что-то пошло не так:

```bash
# Остановите PM2
pm2 stop all

# Восстановите backup
cd /path/to/your/
rm -rf mapmon
mv mapmon-backup-[дата] mapmon
cd mapmon

# Запустите старую версию
pm2 start ecosystem.config.cjs
```

---

## 📊 Мониторинг после обновления

### Проверьте память:
```bash
# Проверьте использование памяти
free -h
pm2 monit

# Утечки памяти должны быть исправлены
# Память не должна постоянно расти
```

### Проверьте логи:
```bash
# Следите за логами в real-time
pm2 logs --lines 50

# Должны появиться сообщения:
# "🧹 Очистка ресурсов" при закрытии компонентов
```

### Проверьте ESP32 данные:
```bash
# Убедитесь что данные поступают
curl http://localhost:3001/api/telemetry/latest

# Проверьте веб-интерфейс
# Откройте http://your-vps-ip:3000
```

---

## ⚙️ Конфигурация PM2 (ecosystem.config.cjs)

Убедитесь что используется правильная конфигурация:

```javascript
module.exports = {
  apps: [
    {
      name: 'mapmon',
      script: '.output/server/index.mjs',
      port: 3000,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mapmon-api',
      script: 'server-backup/api-server.cjs',
      port: 3001
    },
    {
      name: 'mqtt-collector',
      script: 'server-backup/mqtt-collector.cjs'
    }
  ]
}
```

---

## 🔧 Дополнительные команды

### Полная переустановка (если проблемы):
```bash
# Остановите все
pm2 delete all

# Очистите кэш
rm -rf node_modules
rm -rf .nuxt
rm -rf .output

# Переустановите
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### Обновление PM2:
```bash
# Обновите PM2 если нужно
npm install -g pm2@latest
pm2 update
```

---

## 📞 Поддержка

### Если возникли проблемы:

1. **Проверьте логи**: `pm2 logs`
2. **Проверьте статус**: `pm2 status`
3. **Проверьте порты**: `netstat -tulpn | grep :300`
4. **Проверьте память**: `free -h`

### Файлы для отладки:
- **Логи PM2**: `~/.pm2/logs/`
- **База данных**: `server-backup/mapmon.db`
- **Конфигурация**: `ecosystem.config.cjs`

---

## ✅ Контрольный список

После обновления убедитесь:

- [ ] PM2 показывает 3 процесса в статусе "online"
- [ ] API отвечает на http://localhost:3001/api/status
- [ ] Frontend загружается на http://localhost:3000
- [ ] MQTT данные поступают (проверить в веб-интерфейсе)
- [ ] Память не растет постоянно (исправлены утечки)
- [ ] ESP32 данные отображаются на карте
- [ ] Логи не показывают критических ошибок

**Готово!** 🎉 VPS сервер обновлен с исправлениями утечек памяти.