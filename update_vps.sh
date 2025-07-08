#!/bin/bash

# 🚀 Скрипт автоматического обновления MapMon на VPS
# Дата: 2025-01-08
# Версия: v0.5 с исправлениями утечек памяти

echo "🚀 Начинаем обновление MapMon v0.5..."

# Переменные (измените под ваш проект)
PROJECT_DIR="/root/Fmon"  # Путь к проекту на VPS
BACKUP_DIR="/root/mapmon-backups"

# Функция логирования
log() {
    echo "$(date '+%H:%M:%S') $1"
}

# Функция проверки ошибок
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ Ошибка: $1"
        exit 1
    fi
}

# 1. Создание backup
log "📦 Создание backup..."
mkdir -p $BACKUP_DIR
BACKUP_NAME="mapmon-backup-$(date +%Y%m%d-%H%M%S)"
cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME
check_error "Не удалось создать backup"
log "✅ Backup создан: $BACKUP_DIR/$BACKUP_NAME"

# 2. Остановка PM2 процессов
log "⏹️ Остановка PM2 процессов..."
cd $PROJECT_DIR
pm2 stop all
pm2 save
log "✅ PM2 процессы остановлены"

# 3. Обновление кода из GitHub
log "📥 Получение изменений из GitHub..."
git stash push -m "auto-stash-$(date +%Y%m%d-%H%M%S)"
git fetch origin
git pull origin master
check_error "Не удалось получить изменения из GitHub"
log "✅ Код обновлен из GitHub"

# 4. Установка зависимостей
log "📦 Установка зависимостей..."
npm ci
check_error "Не удалось установить зависимости"
log "✅ Зависимости установлены"

# 5. Сборка проекта
log "🔨 Сборка проекта..."
npm run build
check_error "Не удалось собрать проект"
log "✅ Проект собран"

# 6. Запуск PM2 процессов
log "▶️ Запуск PM2 процессов..."
pm2 start ecosystem.config.cjs
check_error "Не удалось запустить PM2 процессы"
log "✅ PM2 процессы запущены"

# 7. Проверка статуса
log "🔍 Проверка статуса..."
sleep 5
pm2 status

# 8. Проверка API
log "🌐 Проверка API..."
API_STATUS=$(curl -s http://localhost:3001/api/status | grep -o "API Server running" || echo "FAILED")
if [ "$API_STATUS" = "API Server running" ]; then
    log "✅ API работает"
else
    log "⚠️ API не отвечает, проверьте логи: pm2 logs mapmon-api"
fi

# 9. Проверка Frontend
log "🖥️ Проверка Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    log "✅ Frontend работает"
else
    log "⚠️ Frontend не отвечает, проверьте логи: pm2 logs mapmon"
fi

log "🎉 Обновление завершено!"
log "📊 Статус системы:"
pm2 status
log ""
log "📝 Полезные команды:"
log "   pm2 logs          - просмотр логов"
log "   pm2 monit         - мониторинг"
log "   pm2 restart all   - перезапуск всех процессов"
log ""
log "🔄 Для отката: cp -r $BACKUP_DIR/$BACKUP_NAME/* $PROJECT_DIR/"