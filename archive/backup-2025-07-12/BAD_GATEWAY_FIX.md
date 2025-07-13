# 🚨 ИСПРАВЛЕНИЕ 502 BAD GATEWAY

## ⚠️ **ПРОБЛЕМА:**
```
HTTP/1.1 502 Bad Gateway
```
Nginx не может подключиться к backend серверам!

## 🔍 **ДИАГНОСТИЧЕСКИЕ КОМАНДЫ:**

### **1. Проверить работают ли backend сервера:**
```bash
# Проверить слушают ли порты 3000 и 3001
sudo netstat -tulpn | grep -E ":3000|:3001"

# Проверить PM2 процессы
pm2 status

# Проверить прямое подключение к API
curl -v http://localhost:3001/api/status

# Проверить прямое подключение к frontend
curl -v http://localhost:3000/
```

### **2. Проверить логи ошибок:**
```bash
# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Логи конкретного сайта
sudo tail -f /var/log/nginx/mapmon.error.log

# Логи PM2
pm2 logs
```

### **3. Если сервера не работают - перезапустить:**
```bash
# Перейти в папку проекта
cd /var/www/mapmon

# Остановить все процессы
pm2 stop all

# Запустить заново
pm2 start ecosystem.config.cjs

# Проверить статус
pm2 status

# Проверить логи запуска
pm2 logs --lines 20
```

### **4. Если PM2 не запускается - ручной запуск для диагностики:**
```bash
# Перейти в папку
cd /var/www/mapmon

# Проверить есть ли node_modules
ls -la node_modules/ | head -5

# Попробовать запустить API сервер вручную
node server-backup/api-server.cjs

# В другом терминале - проверить
curl http://localhost:3001/api/status
```

### **5. Если нет node_modules - переустановить зависимости:**
```bash
cd /var/www/mapmon

# Установить зависимости
yarn install

# Собрать проект
npm run build

# Запустить PM2
pm2 start ecosystem.config.cjs
```

## 🎯 **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**

После исправления:
```bash
# Порты должны слушаться
sudo netstat -tulpn | grep -E ":3000|:3001"
tcp 0.0.0.0:3000 LISTEN PM2
tcp 0.0.0.0:3001 LISTEN PM2

# API должен отвечать
curl http://localhost:3001/api/status
{"status":"API Server running..."}

# Frontend должен отвечать  
curl http://localhost:3000/
<!DOCTYPE html>...

# Тогда через Nginx тоже будет работать
curl http://fleetmonitor.ru/api/status
```

## 🚨 **ВОЗМОЖНЫЕ ПРИЧИНЫ 502:**

1. **PM2 процессы упали** - самая вероятная причина
2. **Порты заняты другими процессами**
3. **Node.js зависимости отсутствуют**
4. **Ошибки в коде серверов**
5. **Недостаток памяти на VPS**

## 🔧 **БЫСТРОЕ РЕШЕНИЕ:**

```bash
# Все в одном:
cd /var/www/mapmon && pm2 restart all && sleep 5 && pm2 status && curl http://localhost:3001/api/status
```

---

**🎯 ГЛАВНОЕ:** Нужно убедиться что PM2 процессы работают и слушают порты 3000/3001!