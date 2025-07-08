# 🚀 Точные команды обновления VPS сервера MapMon

## 📍 Данные с диагностики VPS (2025-01-08)

**Расположение проекта**: `/var/www/mapmon/`  
**Статус**: Все сервисы работают стабильно 3+ дня  
**Проблема**: Git НЕ настроен в папке проекта

---

## ⚠️ ВАЖНО: Git репозиторий не настроен!

На VPS проект работает, но **git репозиторий не инициализирован**. Сначала нужно настроить git.

---

## 🔧 Шаг 1: Настройка Git репозитория на VPS

```bash
# Подключитесь к VPS
ssh root@147.45.213.22

# Перейдите в папку проекта
cd /var/www/mapmon

# Проверьте содержимое папки
ls -la

# Инициализируйте git репозиторий
git init

# Добавьте remote репозиторий
git remote add origin https://github.com/iForza/Fmon.git

# Получите данные из репозитория
git fetch origin

# Проверьте статус файлов
git status
```

---

## 🚀 Шаг 2: Создание backup и обновление

```bash
# СОЗДАНИЕ BACKUP
cd /var/www/
BACKUP_NAME="mapmon-backup-$(date +%Y%m%d-%H%M%S)"
echo "Создание backup: $BACKUP_NAME"
cp -r mapmon $BACKUP_NAME

# ОСТАНОВКА СЕРВИСОВ
cd /var/www/mapmon
pm2 stop all
pm2 save

# ОБНОВЛЕНИЕ КОДА
# Сохранение локальных изменений
git add .
git stash push -m "local-changes-before-update-$(date +%Y%m%d)"

# Получение обновлений
git pull origin master

# УСТАНОВКА ЗАВИСИМОСТЕЙ
npm ci

# СБОРКА ПРОЕКТА  
npm run build

# ЗАПУСК СЕРВИСОВ
pm2 start ecosystem.config.cjs

# ПРОВЕРКА СТАТУСА
sleep 5
pm2 status
```

---

## 🔍 Шаг 3: Проверка работоспособности

```bash
# Проверка PM2 процессов
pm2 status

# Проверка API
curl -s http://localhost:3001/api/status

# Проверка Frontend  
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Проверка логов
pm2 logs --lines 10
```

---

## 🛠️ Альтернативный вариант (если git pull не работает)

Если git pull выдает ошибки из-за конфликтов:

```bash
cd /var/www/mapmon

# Жесткий сброс к удаленной версии
git fetch origin
git reset --hard origin/master

# Или полная замена проекта
cd /var/www/
rm -rf mapmon-old 2>/dev/null
mv mapmon mapmon-old
git clone https://github.com/iForza/Fmon.git mapmon
cd mapmon

# Восстановление конфигурации из backup если нужно
cp ../mapmon-old/.env . 2>/dev/null || echo "No .env to restore"

# Установка и запуск
npm ci
npm run build
pm2 start ecosystem.config.cjs
```

---

## 📊 Ожидаемые результаты

После успешного обновления:

### PM2 Status должен показать:
```
mapmon            │ online │ port 3000 │ ~90-100MB
mapmon-api        │ online │ port 3001 │ ~70-80MB  
mqtt-collector    │ online │ MQTT      │ ~80-90MB
```

### API тест:
```bash
curl http://localhost:3001/api/status
# Ответ: {"status":"API Server running with SQLite"...}
```

### Новые функции (исправления утечек памяти):
- Браузер не должен увеличивать потребление памяти при длительной работе
- В логах должны появиться сообщения "🧹 Очистка ресурсов" при навигации
- Стабильная работа frontend без перезагрузок

---

## 🚨 План отката (если что-то пошло не так)

```bash
# Остановка сервисов
pm2 stop all

# Восстановление backup
cd /var/www/
rm -rf mapmon
mv mapmon-backup-[дата] mapmon
cd mapmon

# Запуск старой версии
pm2 start ecosystem.config.cjs
pm2 status
```

---

## 🔍 Диагностика проблем

### Если PM2 не запускается:
```bash
pm2 logs
pm2 restart all
pm2 reload ecosystem.config.cjs
```

### Если API не работает:
```bash
pm2 logs mapmon-api
ls -la server-backup/
node server-backup/api-server.cjs  # тест запуска
```

### Если Frontend не отвечает:
```bash
pm2 logs mapmon
ls -la .output/server/
npm run build  # пересборка
```

---

## ✅ Контрольный список

После обновления проверьте:

- [ ] `pm2 status` - все процессы online
- [ ] `curl localhost:3001/api/status` - API работает
- [ ] `curl localhost:3000` - Frontend работает  
- [ ] Веб-интерфейс открывается в браузере
- [ ] ESP32 данные поступают на карту
- [ ] Нет критических ошибок в `pm2 logs`
- [ ] Память процессов стабильна (не растет)

---

## 📝 Примечания

1. **Git config**: Возможно потребуется настроить git config user
2. **База данных**: Местоположение БД нужно уточнить (не в server-backup/)
3. **MQTT ошибки**: Timeout ошибки не критичны для отладки
4. **SSR ошибки**: pages/history.vue:86 - будут исправлены в обновлении

**Время обновления**: ~10-15 минут при стабильном интернете.