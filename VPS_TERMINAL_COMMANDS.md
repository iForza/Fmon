# 🔧 КОМАНДЫ ДЛЯ ИСПРАВЛЕНИЯ NGINX НА VPS

## 🎯 **ПРОБЛЕМА ВЫЯВЛЕНА:**
HTTP порт 80 принудительно редиректит ВСЁ на HTTPS, включая API запросы!

## 🛠️ **КОМАНДЫ ИСПРАВЛЕНИЯ:**

### **1. Тест с правильным hostname:**
```bash
# Тест с реальным доменом вместо localhost
curl -I http://fleetmonitor.ru/api/status
curl -I https://fleetmonitor.ru/api/status
```

### **2. Временное исправление - добавить HTTP API:**
```bash
# Backup текущей конфигурации
sudo cp /etc/nginx/sites-available/mapmon /etc/nginx/sites-available/mapmon.backup-$(date +%Y%m%d-%H%M)

# Редактировать конфигурацию
sudo nano /etc/nginx/sites-available/mapmon
```

### **3. НОВАЯ КОНФИГУРАЦИЯ (вставить ПЕРЕД существующими server блоками):**
```nginx
# HTTP сервер только для API
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
        
        # Добавить CORS headers для frontend
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

### **4. Применить изменения:**
```bash
# Проверить синтаксис
sudo nginx -t

# Применить конфигурацию
sudo nginx -s reload

# Проверить что применилось
sudo nginx -T | grep -A 15 "listen 80"
```

### **5. Проверить результат:**
```bash
# Тест HTTP API
curl -v http://fleetmonitor.ru/api/status

# Тест HTTPS API  
curl -v https://fleetmonitor.ru/api/status

# Тест списка техники
curl -v http://fleetmonitor.ru/api/vehicles

# Проверить логи
sudo tail -f /var/log/nginx/mapmon.access.log | grep "/api/"
```

## 🎯 **АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ (если не поможет):**

### **Исправить существующий HTTP блок:**
```bash
# Найти блок с "return 404"
sudo nano /etc/nginx/sites-available/mapmon

# ЗАМЕНИТЬ блок:
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

# НА:
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;

    # API через HTTP
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Остальное на HTTPS
    location / {
        if ($host = www.fleetmonitor.ru) {
            return 301 https://$host$request_uri;
        }
        if ($host = fleetmonitor.ru) {
            return 301 https://$host$request_uri;
        }
        return 404;
    }
}
```

## 🚀 **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**
- ✅ `curl http://fleetmonitor.ru/api/status` → реальные данные API
- ✅ Левая панель получает данные ESP32_Car_2046  
- ✅ Frontend работает через HTTPS
- ✅ API доступен через HTTP и HTTPS

## 🔍 **ДИАГНОСТИКА ПОСЛЕ ИСПРАВЛЕНИЯ:**
```bash
# Проверить что API отвечает
curl http://fleetmonitor.ru/api/vehicles
curl http://fleetmonitor.ru/api/telemetry/latest

# Проверить frontend
curl -I https://fleetmonitor.ru/

# Посмотреть логи
sudo tail -f /var/log/nginx/mapmon.access.log
```

---

**🎯 MAIN POINT:** Frontend нуждается в HTTP доступе к API, но Certbot настроил принудительный HTTPS redirect для всего!