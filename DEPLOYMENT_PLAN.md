# 🚀 **ПОЛНЫЙ ПЛАН РАЗВЕРТЫВАНИЯ MapMon НА VPS**

## 📋 **ИНФОРМАЦИЯ О СЕРВЕРЕ**
- **IP:** 147.45.213.22
- **Домен:** fleetmonitor.ru  
- **OS:** Ubuntu (Cloud MSK 30)
- **Ресурсы:** 1 x 3.3 ГГц CPU • 2 ГБ RAM • 30 ГБ NVMe
- **SSH:** root@147.45.213.22

## 📋 **АНАЛИЗ ПРОЕКТА И ТРЕБОВАНИЙ**

### **Особенности проекта:**
- **Nuxt 3.17.5** с SSR
- **MQTT клиент** (WebSocket соединения)
- **MapLibre GL JS** (требует статические ресурсы)
- **ApexCharts** (клиентские графики)
- **@nuxt/ui** с Tailwind CSS
- **Реального времени данные** от ESP32 устройств

### **Требования сервера:**
- **Node.js 18+** (для Nuxt 3)
- **Nginx** (reverse proxy + статические файлы)
- **PM2** (управление процессами)
- **SSL сертификат** (для HTTPS и WSS MQTT)
- **Firewall** настройка

## 🎯 **ПЛАН ДЕЙСТВИЙ (ПОШАГОВО)**

## 🔧 **ЭТАП 1: ПОДГОТОВКА СЕРВЕРА**

### **1.1 Обновление системы**
```bash
# Обновляем пакеты Ubuntu
sudo apt update && sudo apt upgrade -y

# Проверяем версию Ubuntu
lsb_release -a
```

### **1.2 Установка Node.js 20 LTS**
```bash
# Установка NodeSource репозитория
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### **1.3 Установка Yarn**
```bash
# Установка Yarn
npm install -g yarn

# Проверка
yarn --version
```

### **1.4 Установка Git**
```bash
# Установка Git
sudo apt install git -y

# Проверка
git --version
```

## 🔧 **ЭТАП 2: УСТАНОВКА WEB-СЕРВЕРА**

### **2.1 Установка Nginx**
```bash
# Установка Nginx
sudo apt install nginx -y

# Запуск и автозагрузка
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверка статуса
sudo systemctl status nginx
```

### **2.2 Настройка Firewall**
```bash
# Установка UFW (если не установлен)
sudo apt install ufw -y

# Разрешаем SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Включаем firewall
sudo ufw enable

# Проверяем статус
sudo ufw status
```

## 🔧 **ЭТАП 3: УСТАНОВКА PM2**

### **3.1 Установка PM2**
```bash
# Глобальная установка PM2
npm install -g pm2

# Настройка автозапуска
pm2 startup
# Выполнить команду которую выдаст PM2

# Проверка
pm2 --version
```

## 🔧 **ЭТАП 4: КЛОНИРОВАНИЕ И НАСТРОЙКА ПРОЕКТА**

### **4.1 Создание директории проекта**
```bash
# Создаем директорию для приложения
sudo mkdir -p /var/www/mapmon
sudo chown -R $USER:$USER /var/www/mapmon
cd /var/www/mapmon
```

### **4.2 Клонирование проекта**
```bash
# Клонируем проект с GitHub
git clone https://github.com/iForza/Fmon.git .

# Проверяем файлы
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
```

## 🔧 **ЭТАП 5: НАСТРОЙКА PM2**

### **5.1 Создание PM2 конфигурации**
```bash
# Создаем ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mapmon',
      port: '3000',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs',
      args: '--port 3000',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}
EOF

# Создаем директорию для логов
mkdir -p logs
```

### **5.2 Запуск приложения через PM2**
```bash
# Запуск приложения
pm2 start ecosystem.config.js

# Сохранение текущих процессов
pm2 save

# Проверка статуса
pm2 status
pm2 logs mapmon
```

## 🔧 **ЭТАП 6: НАСТРОЙКА NGINX**

### **6.1 Создание конфигурации Nginx**
```bash
# Создаем конфигурацию сайта
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

    # Статические файлы (если нужно)
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
# Создаем симлинк
sudo ln -s /etc/nginx/sites-available/mapmon /etc/nginx/sites-enabled/

# Удаляем default сайт
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
```

## 🔧 **ЭТАП 7: УСТАНОВКА SSL СЕРТИФИКАТА**

### **7.1 Установка Certbot**
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### **7.2 Получение SSL сертификата**
```bash
# Получение сертификата от Let's Encrypt
sudo certbot --nginx -d fleetmonitor.ru -d www.fleetmonitor.ru

# Настройка автообновления
sudo crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **ЭТАП 8: ТЕСТИРОВАНИЕ И МОНИТОРИНГ**

### **8.1 Проверка работы**
```bash
# Проверка PM2
pm2 status
pm2 logs mapmon --lines 50

# Проверка Nginx
sudo systemctl status nginx
sudo nginx -t

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3000
```

### **8.2 Тестирование сайта**
- Открыть https://fleetmonitor.ru
- Проверить MQTT соединение
- Проверить карты MapLibre
- Проверить графики ApexCharts

## 🔧 **ЭТАП 9: ОБНОВЛЕНИЕ ПРОЕКТА (В БУДУЩЕМ)**

### **9.1 Процесс обновления**
```bash
cd /var/www/mapmon

# Получаем последние изменения
git pull origin master

# Устанавливаем новые зависимости (если есть)
yarn install

# Пересобираем проект
yarn build

# Перезапускаем приложение
pm2 restart mapmon

# Проверяем логи
pm2 logs mapmon --lines 20
```

## 🚨 **ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ**

### **Проблема 1: Порты заняты**
```bash
# Проверка занятых портов
sudo lsof -i :3000
sudo lsof -i :80
sudo lsof -i :443

# Освобождение порта
sudo kill -9 <PID>
```

### **Проблема 2: Ошибки сборки**
```bash
# Очистка кеша
rm -rf node_modules .nuxt .output
yarn install
yarn build
```

### **Проблема 3: Проблемы с SSL**
```bash
# Принудительное обновление сертификата
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### **Проблема 4: MQTT WebSocket проблемы**
- Проверить настройки прокси в Nginx
- Убедиться что SSL сертификат работает
- Проверить firewall правила

## 📊 **МОНИТОРИНГ**

### **Полезные команды:**
```bash
# Мониторинг PM2
pm2 monit

# Логи Nginx
sudo tail -f /var/log/nginx/mapmon.access.log
sudo tail -f /var/log/nginx/mapmon.error.log

# Системные ресурсы
htop
df -h
free -h
```

## ✅ **ЧЕКЛИСТ ЗАВЕРШЕНИЯ**

- [ ] Ubuntu обновлен
- [ ] Node.js 20 установлен
- [ ] Yarn установлен
- [ ] Git установлен
- [ ] Nginx установлен и настроен
- [ ] PM2 установлен и настроен
- [ ] Проект склонирован с GitHub
- [ ] Зависимости установлены
- [ ] Проект собран для продакшена
- [ ] PM2 конфигурация создана
- [ ] Приложение запущено через PM2
- [ ] Nginx конфигурация создана
- [ ] SSL сертификат установлен
- [ ] Сайт доступен по HTTPS
- [ ] MQTT соединение работает
- [ ] Карты отображаются
- [ ] Графики работают

## 🎯 **ФИНАЛЬНЫЙ РЕЗУЛЬТАТ**

После выполнения всех этапов:

1. **MapMon будет доступен** по адресу https://fleetmonitor.ru
2. **SSL сертификат** обеспечит безопасность
3. **PM2** будет поддерживать приложение в рабочем состоянии
4. **Nginx** будет обрабатывать статические файлы и прокси запросы
5. **MQTT соединения** будут работать через WebSocket
6. **Автоматические обновления** Git → build → restart

---

**Создан:** $(date)
**Проект:** MapMon v0.4v Fleet Monitoring System
**GitHub:** https://github.com/iForza/Fmon 