# 🚀 **ПОЛНАЯ ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ MAPMON НА VPS TIMEWEB**

## 📋 **ИНФОРМАЦИЯ О СЕРВЕРЕ**
- **Провайдер:** Timeweb Cloud
- **IP:** 147.45.213.22
- **Домен:** fleetmonitor.ru (привязан к серверу)
- **OS:** Ubuntu (Cloud MSK 30)
- **Ресурсы:** 1 x 3.3 ГГц CPU • 2 ГБ RAM • 30 ГБ NVMe
- **SSH:** root@147.45.213.22
- **Root-пароль:** zMc22MT+kNWjnt
- **SSH ключ:** ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCVWDiJyyso8yf+Zp5NdsOZ2yFkTRJW3t/nt8gWOQ3SFO1c9NJ15LzWe5RDk75hEfvoSMYHq/W94CJBddaf8vKO4hpbyPalRoXRi/2p8f11R56hBw13ge7vGQXzjGRGWNuWu8sPhZ05xsu8rfYtbgtui7qycC2UAxFNkR7MqmSwBNMy2320qvUM8e55lEVpJyaiWbiPKqulVOx3CWMdTuAsMyBPdIDwrezBFqQr8Sj4WLnpXsHAngM3UqDKxsOJTgtxH8RxBlg+kx7SMguU49JZJb0M4oQ1EelYj6z6UfOj5mfuV0ETbuTc5zr/sMriz1Sy7MhaLYkVSazreESaHRlA60HYgKzjGgXy+nZw0lAFDPDkFC/RVRT7ew8Z1MhAnEF1IHwndn7e06uO1i7fbRzov/f0d6WW9Yyk/fAH+RKu6dV+e4GJO7ucThGOGCQm+oe7wSJq2hO4b84xWgktzFRgEPqvKiNVFliLKslW9upUJtmmYjwKwhPdc2QVPYb/Bc= root@5018543-bi97187

---

## 🔧 **ЭТАП 1: ПОДКЛЮЧЕНИЕ К СЕРВЕРУ**

### **1.1 Подключение через SSH**
```bash
# Подключение к серверу
ssh root@147.45.213.22
# Ввести пароль: zMc22MT+kNWjnt
```

### **1.2 Обновление системы**
```bash
# Обновление пакетов Ubuntu
sudo apt update && sudo apt upgrade -y

# Проверка версии Ubuntu
lsb_release -a
```

---

## 🔧 **ЭТАП 2: УСТАНОВКА БАЗОВОГО ПО**

### **2.1 Установка Node.js 20 LTS**
```bash
# Добавление NodeSource репозитория
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### **2.2 Установка Yarn**
```bash
# Установка Yarn глобально
npm install -g yarn

# Проверка версии
yarn --version
```

### **2.3 Установка Git**
```bash
# Установка Git
sudo apt install git -y

# Проверка версии
git --version
```

### **2.4 Установка PM2**
```bash
# Глобальная установка PM2
npm install -g pm2

# Настройка автозапуска при перезагрузке сервера
pm2 startup
# ВАЖНО: Выполнить команду которую выдаст PM2!

# Проверка версии
pm2 --version
```

---

## 🔧 **ЭТАП 3: УСТАНОВКА WEB-СЕРВЕРА**

### **3.1 Установка Nginx**
```bash
# Установка Nginx
sudo apt install nginx -y

# Запуск и автозагрузка
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверка статуса
sudo systemctl status nginx
```

### **3.2 Настройка Firewall**
```bash
# Установка UFW (если не установлен)
sudo apt install ufw -y

# Разрешение портов
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

---

## 🔧 **ЭТАП 4: ПОДГОТОВКА ПРОЕКТА**

### **4.1 Создание директории проекта**
```bash
# Создание директории для приложения
sudo mkdir -p /var/www/mapmon
sudo chown -R $USER:$USER /var/www/mapmon
cd /var/www/mapmon
```

### **4.2 Клонирование проекта**
```bash
# Клонирование проекта с GitHub
git clone https://github.com/iForza/Fmon.git .

# Проверка файлов
ls -la
```

### **4.3 Установка зависимостей**
```bash
# Установка зависимостей
yarn install

# Или если есть проблемы с yarn
npm install
```

### **4.4 Сборка проекта для продакшена**
```bash
# Сборка Nuxt приложения
yarn build

# Или
npm run build

# Проверка сборки
ls -la .output/
```

---

## 🔧 **ЭТАП 5: НАСТРОЙКА PM2**

### **5.1 Создание PM2 конфигурации**
```bash
# Создание ecosystem.config.cjs (исправленное расширение)
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mapmon',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log', 
      log_file: './logs/combined.log',
      time: true,
      restart_delay: 1000,
      max_restarts: 10
    }
  ]
}
EOF

# Создание директории для логов
mkdir -p logs
```

### **5.2 Запуск приложения через PM2**
```bash
# Запуск приложения
pm2 start ecosystem.config.cjs

# Сохранение текущих процессов для автозапуска
pm2 save

# Проверка статуса
pm2 status
pm2 logs mapmon --lines 20
```

---

## 🔧 **ЭТАП 6: НАСТРОЙКА NGINX**

### **6.1 Создание конфигурации Nginx**
```bash
# Создание конфигурации сайта
sudo tee /etc/nginx/sites-available/mapmon << 'EOF'
server {
    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;

    # Логи
    access_log /var/log/nginx/mapmon.access.log;
    error_log /var/log/nginx/mapmon.error.log;

    # Прокси к Node.js приложению
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

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

### **6.2 Активация сайта**
```bash
# Создание симлинка
sudo ln -s /etc/nginx/sites-available/mapmon /etc/nginx/sites-enabled/

# Удаление default сайта
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

---

## 🔧 **ЭТАП 7: ПРОВЕРКА РАБОТЫ**

### **7.1 Проверка портов**
```bash
# Проверка что порты слушаются
ss -tlnp | grep :80
ss -tlnp | grep :3000

# Проверка процессов
sudo lsof -i :80
sudo lsof -i :3000
```

### **7.2 Тестирование подключений**
```bash
# Тест локального подключения к Nginx
curl -I http://localhost

# Тест прямого подключения к Node.js
curl -I http://127.0.0.1:3000

# Тест внешнего доступа к домену
curl -I http://fleetmonitor.ru
```

---

## 🔧 **ЭТАП 8: УСТАНОВКА SSL СЕРТИФИКАТА**

### **8.1 Установка Certbot**
```bash
# Установка Certbot и плагина для Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### **8.2 Получение SSL сертификата**
```bash
# Получение сертификата от Let's Encrypt
sudo certbot --nginx -d fleetmonitor.ru -d www.fleetmonitor.ru

# При запросе выбрать:
# - Согласиться с условиями: Y
# - Email для уведомлений: ваш email
# - Редирект с HTTP на HTTPS: 2 (рекомендуется)
```

### **8.3 Настройка автообновления**
```bash
# Добавление cron задачи для автообновления
sudo crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet

# Или проверить что systemd таймер работает
sudo systemctl status certbot.timer
```

---

## 🔧 **ЭТАП 9: ФИНАЛЬНЫЕ ПРОВЕРКИ**

### **9.1 Проверка всех сервисов**
```bash
# Проверка PM2
pm2 status
pm2 logs mapmon --lines 20

# Проверка Nginx
sudo systemctl status nginx
sudo nginx -t

# Проверка портов с SSL
sudo lsof -i :443
ss -tlnp | grep :443
```

### **9.2 Тестирование HTTPS**
```bash
# Тест HTTPS соединения
curl -I https://fleetmonitor.ru

# Проверка SSL сертификата
openssl s_client -connect fleetmonitor.ru:443 -servername fleetmonitor.ru < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔧 **ЭТАП 10: ПРОЦЕДУРА ОБНОВЛЕНИЯ ПРОЕКТА**

### **10.1 Команды для обновления**
```bash
cd /var/www/mapmon

# Получение последних изменений
git pull origin master

# Установка новых зависимостей (если есть)
yarn install

# Пересборка проекта
yarn build

# Перезапуск приложения
pm2 restart mapmon

# Проверка логов
pm2 logs mapmon --lines 20
```

---

## 📊 **МОНИТОРИНГ И ДИАГНОСТИКА**

### **Полезные команды для мониторинга:**
```bash
# PM2 мониторинг
pm2 monit

# Логи Nginx
sudo tail -f /var/log/nginx/mapmon.access.log
sudo tail -f /var/log/nginx/mapmon.error.log

# Системные ресурсы
htop
df -h
free -h

# Проверка сети
netstat -tulnp
ss -tulnp
```

---

## 🚨 **РЕШЕНИЕ ПРОБЛЕМ**

### **Типичные проблемы и решения:**

**1. PM2 не запускается:**
```bash
# Проверка логов PM2
pm2 logs mapmon
# Исправление прав
sudo chown -R $USER:$USER /var/www/mapmon
```

**2. Nginx ошибки:**
```bash
# Проверка конфигурации
sudo nginx -t
# Просмотр логов ошибок
sudo tail -f /var/log/nginx/error.log
```

**3. SSL проблемы:**
```bash
# Принудительное обновление сертификата
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 📋 **ДАННЫЕ ДЛЯ СПРАВКИ**

### **Основная информация о проекте:**
- **Название:** MapMon v0.4.9 Fleet Monitoring System
- **GitHub:** https://github.com/iForza/Fmon
- **Технологии:** Nuxt 3.17.5, Vue 3, MongoDB, MQTT WebSocket
- **MQTT:** EMQX Cloud (wss://o0acf6a7.ala.dedicated.gcp.emqxcloud.com:8084/mqtt)
- **Особенности:** SSR, реального времени MQTT, MapLibre GL JS, ApexCharts

### **Текущая версия MapMon включает:**
- ✅ **Fleet Monitor Pro v2.4.1** с EMQX Cloud интеграцией
- ✅ **MQTT WebSocket клиент** в браузере
- ✅ **MapLibre GL JS** карты для отображения техники
- ✅ **ApexCharts** для графиков телеметрии в реальном времени
- ✅ **Автоматические настройки EMQX** по умолчанию
- ✅ **Система уведомлений** о новой технике
- ✅ **Скользящее временное окно** для графиков

### **Структура MQTT топиков:**
- `car` - основные данные техники
- `vehicles/+/telemetry` - детальная телеметрия
- `vehicles/+/status` - статус устройств
- `vehicles/+/heartbeat` - проверка связи

### **Формат данных ESP32:**
```json
{
  "id": "ESP32_Car_2046",
  "lat": 55.7558,
  "lng": 37.6176,
  "speed": 45,
  "battery": 82.24,
  "temperature": 23.9,
  "rpm": 735,
  "timestamp": 591008,
  "status": "active"
}
```

---

**Дата создания:** $(date)  
**Версия инструкции:** 1.0  
**Автор:** AI Assistant  
**Для проекта:** MapMon VPS Deployment 