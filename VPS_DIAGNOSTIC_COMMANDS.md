# 🔍 ПОЛНАЯ ДИАГНОСТИКА VPS СЕРВЕРА MapMon

## 🎯 Выполни команды по порядку и скопируй результат каждой

---

## 📋 1. СИСТЕМНАЯ ИНФОРМАЦИЯ

### Общая информация о системе
```bash
echo "=== СИСТЕМНАЯ ИНФОРМАЦИЯ ==="
uname -a
lsb_release -a
whoami
pwd
date
```

### Ресурсы сервера
```bash
echo "=== РЕСУРСЫ СЕРВЕРА ==="
free -h
df -h
ps aux --sort=-%mem | head -10
```

---

## 🔧 2. NGINX ДИАГНОСТИКА

### Статус и конфигурация Nginx
```bash
echo "=== NGINX СТАТУС ==="
sudo systemctl status nginx
sudo nginx -t
sudo nginx -V
```

### Конфигурационные файлы
```bash
echo "=== NGINX КОНФИГУРАЦИЯ ==="
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/
```

### Содержимое конфигураций MapMon
```bash
echo "=== СОДЕРЖИМОЕ КОНФИГУРАЦИЙ ==="
echo "--- sites-available/mapmon ---"
sudo cat /etc/nginx/sites-available/mapmon
echo ""
echo "--- sites-enabled/mapmon ---"
sudo cat /etc/nginx/sites-enabled/mapmon
echo ""
echo "--- sites-available/mapmon.backup ---"
sudo cat /etc/nginx/sites-available/mapmon.backup
```

### Проверка портов и proxy
```bash
echo "=== ПОИСК ПОРТОВ В КОНФИГУРАЦИИ ==="
sudo grep -r "3000\|3001" /etc/nginx/
sudo grep -r "proxy_pass" /etc/nginx/sites-enabled/
```

---

## 🚀 3. PM2 И ПРОЦЕССЫ

### PM2 статус
```bash
echo "=== PM2 ПРОЦЕССЫ ==="
pm2 status
pm2 info mapmon
pm2 info mapmon-api
pm2 info mqtt-collector
```

### Детальная информация о процессах
```bash
echo "=== ДЕТАЛИ ПРОЦЕССОВ ==="
pm2 show mapmon
pm2 show mapmon-api
pm2 show mqtt-collector
```

### Логи PM2
```bash
echo "=== ПОСЛЕДНИЕ ЛОГИ PM2 ==="
pm2 logs --lines 20
```

---

## 🌐 4. СЕТЕВАЯ ДИАГНОСТИКА

### Активные порты
```bash
echo "=== АКТИВНЫЕ ПОРТЫ ==="
sudo netstat -tulpn | grep -E ":3000|:3001|:80|:443"
sudo ss -tulpn | grep -E ":3000|:3001|:80|:443"
```

### Проверка доступности портов
```bash
echo "=== ПРОВЕРКА ПОРТОВ ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/status
```

### Проверка API эндпоинтов
```bash
echo "=== ТЕСТ API ЭНДПОИНТОВ ==="
echo "--- Порт 3000 ---"
curl -s http://localhost:3000/api/status || echo "Порт 3000 недоступен"
echo ""
echo "--- Порт 3001 ---"
curl -s http://localhost:3001/api/status || echo "Порт 3001 недоступен"
echo ""
echo "--- Через Nginx ---"
curl -s http://localhost/api/status || echo "Nginx прокси недоступен"
```

---

## 📁 5. ФАЙЛОВАЯ СИСТЕМА ПРОЕКТА

### Структура проекта
```bash
echo "=== СТРУКТУРА ПРОЕКТА ==="
ls -la /var/www/mapmon/
ls -la /var/www/mapmon/server/
ls -la /var/www/mapmon/server-backup/
```

### Конфигурационные файлы проекта
```bash
echo "=== КОНФИГУРАЦИИ ПРОЕКТА ==="
cat /var/www/mapmon/ecosystem.config.cjs
cat /var/www/mapmon/package.json | grep -A 10 -B 10 "scripts"
```

### Проверка базы данных
```bash
echo "=== БАЗА ДАННЫХ ==="
ls -la /var/www/mapmon/server-backup/*.db
ls -la /var/www/mapmon/*.db
find /var/www/mapmon -name "*.db" -type f
```

---

## 🔒 6. БЕЗОПАСНОСТЬ И ДОСТУПЫ

### Права доступа
```bash
echo "=== ПРАВА ДОСТУПА ==="
ls -la /var/www/mapmon/
ls -la /var/www/mapmon/server-backup/
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/
```

### Активные пользователи и процессы
```bash
echo "=== ПРОЦЕССЫ ПОЛЬЗОВАТЕЛЕЙ ==="
ps aux | grep -E "nginx|node|pm2" | grep -v grep
```

---

## 📊 7. ЛОГИ И МОНИТОРИНГ

### Системные логи
```bash
echo "=== СИСТЕМНЫЕ ЛОГИ ==="
sudo tail -20 /var/log/nginx/access.log
sudo tail -20 /var/log/nginx/error.log
```

### Размеры логов
```bash
echo "=== РАЗМЕРЫ ЛОГОВ ==="
sudo du -sh /var/log/nginx/
sudo ls -lh /var/log/nginx/
```

---

## 🧪 8. ТЕСТИРОВАНИЕ API

### Тест всех API эндпоинтов
```bash
echo "=== ТЕСТИРОВАНИЕ API ==="
echo "1. Статус API через порт 3001:"
curl -s http://localhost:3001/api/status | head -5
echo ""
echo "2. Список техники через порт 3001:"
curl -s http://localhost:3001/api/vehicles | head -5
echo ""
echo "3. Телеметрия через порт 3001:"
curl -s http://localhost:3001/api/telemetry/latest | head -5
echo ""
echo "4. Статус API через Nginx:"
curl -s http://localhost/api/status | head -5
echo ""
echo "5. Список техники через Nginx:"
curl -s http://localhost/api/vehicles | head -5
```

---

## 🎯 ИНСТРУКЦИЯ ПО ВЫПОЛНЕНИЮ

1. **Скопируй каждую команду блока** в терминал VPS
2. **Сохрани результат каждого блока** в отдельный файл или сообщение
3. **Отправь результаты по частям** (не все сразу)
4. **Начни с блока 1** и сообщи результат, затем переходи к следующему

## 📌 ВАЖНО
- Некоторые команды могут запрашивать пароль (sudo)
- Если команда "зависает", нажми Ctrl+C и сообщи об этом
- Если команда возвращает ошибку, это тоже важная информация

**Готов к диагностике? Начинай с блока 1! 🚀**