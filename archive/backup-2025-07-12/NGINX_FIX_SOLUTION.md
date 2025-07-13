# 🔧 РЕШЕНИЕ ПРОБЛЕМЫ NGINX ПРОКСИ

## 📋 **Диагностические команды для VPS**

### **1. Проверка логов Nginx:**
```bash
# Проверить access.log для /api/ запросов
sudo tail -f /var/log/nginx/mapmon.access.log | grep "/api/"

# Проверить error.log для ошибок прокси
sudo tail -f /var/log/nginx/mapmon.error.log

# Проверить общие ошибки Nginx
sudo tail -f /var/log/nginx/error.log
```

### **2. Тест конфигурации:**
```bash
# Проверить синтаксис конфигурации
sudo nginx -t

# Перезагрузить конфигурацию
sudo nginx -s reload

# Проверить активные конфигурации
sudo nginx -T | grep -A 10 -B 10 "location /api/"
```

### **3. Расширенная диагностика:**
```bash
# Проверить все server блоки
sudo nginx -T | grep -A 20 "server {"

# Проверить порядок location блоков
sudo nginx -T | grep -A 5 "location"

# Проверить upstream определения
sudo nginx -T | grep -A 10 "upstream"
```

### **4. SSL/TLS диагностика:**
```bash
# Проверить SSL сертификаты
sudo nginx -T | grep ssl_certificate

# Проверить редиректы HTTP -> HTTPS
curl -I http://localhost/api/status
curl -I https://localhost/api/status
```

### **5. Кэш и временные файлы:**
```bash
# Очистить кэш Nginx
sudo rm -rf /var/cache/nginx/*

# Проверить временные файлы
sudo ls -la /var/lib/nginx/
```

## 🎯 **ПРЕДПОЛАГАЕМЫЕ РЕШЕНИЯ:**

### **Решение 1: Исправление порядка location блоков**
```nginx
server {
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    
    # API должен быть ПЕРВЫМ для приоритета
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Добавить отладку
        access_log /var/log/nginx/api.access.log;
        error_log /var/log/nginx/api.error.log debug;
    }
    
    # Основной сайт вторым
    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... остальные настройки
    }
}
```

### **Решение 2: Добавление HTTP блока для API**
```nginx
# Добавить отдельный server блок для HTTP API
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    
    # Только API через HTTP
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Остальное редиректить на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### **Решение 3: Отладочная конфигурация**
```nginx
# Временная отладочная конфигурация
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    
    location /api/ {
        # Принудительный возврат для теста
        return 200 "API WORKS - $request_uri";
        add_header Content-Type text/plain;
    }
    
    location / {
        return 200 "MAIN WORKS - $request_uri";
        add_header Content-Type text/plain;
    }
}
```

## 🔧 **КОМАНДЫ ПРИМЕНЕНИЯ:**

### **Шаг 1: Backup текущей конфигурации**
```bash
sudo cp /etc/nginx/sites-available/mapmon /etc/nginx/sites-available/mapmon.backup-$(date +%Y%m%d)
```

### **Шаг 2: Применение изменений**
```bash
# Отредактировать конфигурацию
sudo nano /etc/nginx/sites-available/mapmon

# Проверить синтаксис
sudo nginx -t

# Применить изменения
sudo nginx -s reload
```

### **Шаг 3: Проверка результата**
```bash
# Тест HTTP API
curl -v http://localhost/api/status

# Тест HTTPS API
curl -v https://localhost/api/status

# Тест прямого доступа
curl -v http://localhost:3001/api/status
```

## 🎯 **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**

После применения решения:
- ✅ `curl http://localhost/api/status` → реальные данные API
- ✅ `curl https://fleetmonitor.ru/api/status` → реальные данные API
- ✅ Левая панель показывает ESP32_Car_2046
- ✅ Блоки техники отображают актуальные данные

## 🔍 **ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА:**

Если проблема не решится, запустить:
```bash
# Проверить все активные конфигурации
sudo nginx -T > /tmp/nginx_full_config.txt

# Проверить процессы на портах
sudo netstat -tulpn | grep -E ":80|:443|:3001"

# Проверить iptables/firewall
sudo iptables -L -n | grep -E "80|443|3001"
```

---

**🎯 КРИТИЧЕСКАЯ ТОЧКА:** Скорее всего проблема в **порядке location блоков** или **SSL редиректах**, блокирующих HTTP API запросы.