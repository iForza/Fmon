# 🚨 СРОЧНОЕ ВОССТАНОВЛЕНИЕ HTTPS СЕРВЕРА

## ⚠️ **ПРОБЛЕМА:**
HTTPS сервер не запускается - `Connection refused` на порту 443

## 🔧 **СРОЧНЫЕ КОМАНДЫ:**

### **1. Проверить что случилось с HTTPS блоком:**
```bash
# Проверить есть ли блок с портом 443
sudo nginx -T | grep -A 10 "listen 443"

# Проверить структуру конфигурации
sudo nginx -T | grep -A 5 -B 5 "ssl_certificate"
```

### **2. Если HTTPS блок отсутствует - восстановить из backup:**
```bash
# Найти последний backup
ls -la /etc/nginx/sites-available/mapmon.backup*

# Посмотреть содержимое последнего backup
sudo cat /etc/nginx/sites-available/mapmon.backup-$(date +%Y%m%d-0707)

# Скопировать HTTPS блок из backup
sudo nano /etc/nginx/sites-available/mapmon
```

### **3. HTTPS блок который должен быть в конфигурации:**
```nginx
# HTTPS сервер (ДОБАВИТЬ ЭТОТ БЛОК)
server {
    server_name fleetmonitor.ru www.fleetmonitor.ru;

    access_log /var/log/nginx/mapmon.access.log;
    error_log /var/log/nginx/mapmon.error.log;

    # API сервер
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Основной MapMon (все остальные запросы)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты для WebSocket (MQTT)
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Админ-панель
    location /admin/ {
        proxy_pass http://127.0.0.1:3002/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/fleetmonitor.ru/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/fleetmonitor.ru/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

### **4. Проверить и применить:**
```bash
# Проверить синтаксис
sudo nginx -t

# Если OK - применить
sudo nginx -s reload

# Проверить что порт 443 слушается
sudo netstat -tulpn | grep :443
```

### **5. Финальная проверка:**
```bash
# HTTP API
curl -v http://fleetmonitor.ru/api/status

# HTTPS API  
curl -v https://fleetmonitor.ru/api/vehicles

# HTTPS главная страница
curl -I https://fleetmonitor.ru/

# HTTP редирект
curl -I http://fleetmonitor.ru/
```

## 🎯 **ПОЛНАЯ СТРУКТУРА ФАЙЛА:**

В `/etc/nginx/sites-available/mapmon` должно быть ДВА блока:

1. **HTTP блок (порт 80)** - API + редирект
2. **HTTPS блок (порт 443)** - полный функционал

## 🚨 **АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ:**

Если не получается восстановить - восстановить из backup:
```bash
# Полное восстановление из backup
sudo cp /etc/nginx/sites-available/mapmon.backup-$(date +%Y%m%d-0707) /etc/nginx/sites-available/mapmon

# Потом заново добавить HTTP блок для API
sudo nano /etc/nginx/sites-available/mapmon
```

---

**🎯 КРИТИЧНО:** Нужно восстановить HTTPS сервер для нормальной работы сайта!