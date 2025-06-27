#!/bin/bash

# 🚀 БЫСТРОЕ ОБНОВЛЕНИЕ MAPMON VPS - ИСПРАВЛЕНИЯ MQTT ОТЛАДЧИКА
# Выполнить на сервере: bash QUICK_VPS_UPDATE.sh

echo "🔧 Начинаю обновление MapMon VPS..."
echo "📍 Текущая директория: $(pwd)"

# Проверка что мы в правильной директории
if [[ ! -f "package.json" ]]; then
    echo "❌ Ошибка: не найден package.json"
    echo "📂 Переходим в /var/www/mapmon"
    cd /var/www/mapmon
fi

echo "🛑 1. Остановка PM2 процессов..."
pm2 stop ecosystem.config.cjs

echo "📥 2. Получение исправлений из GitHub..."
git pull origin master

echo "📦 3. Установка зависимостей..."
yarn install --production

echo "🔨 4. Пересборка проекта..."
yarn build

echo "🚀 5. Перезапуск сервисов..."
pm2 restart ecosystem.config.cjs

echo "📊 6. Проверка статуса..."
pm2 status

echo "📋 7. Последние логи..."
pm2 logs --lines 10

echo ""
echo "✅ Обновление завершено!"
echo "🔍 Проверьте: https://fleetmonitor.ru/history"
echo "🎭 MQTT отладчик должен работать в демо режиме"
echo ""
echo "📚 Полные инструкции: VPS_MQTT_DEBUGGER_UPDATE.md" 