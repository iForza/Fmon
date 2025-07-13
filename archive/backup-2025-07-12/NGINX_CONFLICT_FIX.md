# 🚨 ИСПРАВЛЕНИЕ КОНФЛИКТА NGINX SERVER БЛОКОВ

## ⚠️ **ПРОБЛЕМА:**
```
nginx: [warn] conflicting server name "fleetmonitor.ru" on 0.0.0.0:80, ignored
```

У вас два server блока на порту 80 с одинаковыми именами!

## 🔧 **КОМАНДЫ ИСПРАВЛЕНИЯ:**

### **1. Найти и удалить дублирующий блок:**
```bash
# Посмотреть полную конфигурацию 
sudo nginx -T > /tmp/nginx_full.txt

# Найти все server блоки на порту 80
sudo nginx -T | grep -A 20 "listen 80"

# Отредактировать конфигурацию
sudo nano /etc/nginx/sites-available/mapmon
```

### **2. В файле найти и УДАЛИТЬ этот блок:**
```nginx
# УДАЛИТЬ ЭТОТ БЛОК:
server {
    if ($host = www.fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    }

    if ($host = fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    return 404; # managed by Certbot
}
```

### **3. Оставить только ОДИН HTTP блок:**
```nginx
# HTTP сервер только для API (ОСТАВИТЬ)
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;

    # API обрабатывается через HTTP
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers для frontend
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # Все остальное редиректить на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### **4. Проверить и применить:**
```bash
# Проверить синтаксис (БЕЗ warnings!)
sudo nginx -t

# Если OK - применить
sudo nginx -s reload

# Проверить что warnings исчезли
sudo nginx -T | head -5
```

### **5. Финальная проверка:**
```bash
# HTTP API должен работать
curl -v http://fleetmonitor.ru/api/status

# HTTPS должен работать  
curl -v https://fleetmonitor.ru/api/vehicles

# Главная страница должна редиректить на HTTPS
curl -I http://fleetmonitor.ru/

# Проверить логи
sudo tail -f /var/log/nginx/mapmon.access.log
```

## 🎯 **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**

После исправления:
- ❌ **Никаких warnings** при `nginx -t`
- ✅ **HTTP API работает** - `http://fleetmonitor.ru/api/*`
- ✅ **HTTPS frontend работает** - `https://fleetmonitor.ru/`
- ✅ **Автоматический редирект** - `http://fleetmonitor.ru/` → `https://fleetmonitor.ru/`
- ✅ **Левая панель получает данные** ESP32_Car_2046

## 📋 **СТРУКТУРА ФАЙЛА ПОСЛЕ ИСПРАВЛЕНИЯ:**

Должно остаться ТОЛЬКО два server блока:
1. **HTTP блок** (порт 80) - только для API + редирект остального
2. **HTTPS блок** (порт 443) - для frontend

---

**🎯 ВАЖНО:** После исправления frontend сможет обращаться к API через HTTP, а пользователи будут видеть сайт через HTTPS!