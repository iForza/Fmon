root@5018543-bi97187:~# echo "=== СИСТЕМНАЯ ИНФОРМАЦИЯ ==="
uname -a
lsb_release -a
whoami
pwd
date
=== СИСТЕМНАЯ ИНФОРМАЦИЯ ===
Linux 5018543-bi97187 5.15.0-141-generic #151-Ubuntu SMP Sun May 18 21:35:19 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.5 LTS
Release:        22.04
Codename:       jammy
root
/root
Fri Jul 11 06:23:36 PM MSK 2025
root@5018543-bi97187:~# echo "=== РЕСУРСЫ СЕРВЕРА ==="
free -h
df -h
ps aux --sort=-%mem | head -10
=== РЕСУРСЫ СЕРВЕРА ===
               total        used        free      shared  buff/cache   available
Mem:           1.9Gi       363Mi       995Mi       1.0Mi       604Mi       1.4Gi
Swap:             0B          0B          0B
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           197M  1.0M  196M   1% /run
/dev/sda1        30G  9.8G   20G  34% /
tmpfs           982M     0  982M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           197M  4.0K  197M   1% /run/user/0
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         355  0.0  4.8 160912 96732 ?        S<s  Jul10   0:15 /lib/systemd/systemd-journald
mongodb      671  0.4  4.6 2586596 93476 ?       Ssl  Jul10   7:40 /usr/bin/mongod --config /etc/mongod.conf
root       16520  0.1  4.1 11534724 82928 ?      Sl   14:45   0:23 node /var/www/mapmon/.output/server/index.mjs
root       16534  0.1  3.6 1239160 73180 ?       Sl   14:45   0:22 node /var/www/mapmon/server-backup/mqtt-collector.cjs
root       16521  0.2  3.4 1039660 68764 ?       Sl   14:45   0:31 node /var/www/mapmon/server-backup/api-server.cjs
root         791  0.0  2.9 1101672 60176 ?       Ssl  Jul10   1:33 PM2 v6.0.8: God Daemon (/root/.pm2)
root         391  0.0  1.3 289352 27100 ?        SLsl Jul10   0:08 /sbin/multipathd -d -s
root         679  0.0  0.9 1774832 19152 ?       Ssl  Jul10   0:06 /usr/lib/snapd/snapd
root         672  0.0  0.7  32812 15900 ?        Ss   Jul10   0:00 /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers
root@5018543-bi97187:~# echo "=== NGINX СТАТУС ==="
sudo systemctl status nginx
sudo nginx -t
sudo nginx -V
=== NGINX СТАТУС ===
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2025-07-10 14:10:55 MSK; 1 day 4h ago
       Docs: man:nginx(8)
    Process: 673 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 744 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 748 (nginx)
      Tasks: 2 (limit: 2275)
     Memory: 9.5M
        CPU: 13.015s
     CGroup: /system.slice/nginx.service
             ├─748 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             └─751 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""

Jul 10 14:10:55 5018543-bi97187 systemd[1]: Starting A high performance web server and a reverse proxy server...
Jul 10 14:10:55 5018543-bi97187 systemd[1]: Started A high performance web server and a reverse proxy server.
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
nginx version: nginx/1.18.0 (Ubuntu)
built with OpenSSL 3.0.2 15 Mar 2022
TLS SNI support enabled
configure arguments: --with-cc-opt='-g -O2 -ffile-prefix-map=/build/nginx-niToSo/nginx-1.18.0=. -flto=auto -ffat-lto-objects -flto=auto -ffat-lto-objects -fstack-protector-strong -Wformat -Werror=format-security -fPIC -Wdate-time -D_FORTIFY_SOURCE=2' --with-ld-opt='-Wl,-Bsymbolic-functions -flto=auto -ffat-lto-objects -flto=auto -Wl,-z,relro -Wl,-z,now -fPIC' --prefix=/usr/share/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log --lock-path=/var/lock/nginx.lock --pid-path=/run/nginx.pid --modules-path=/usr/lib/nginx/modules --http-client-body-temp-path=/var/lib/nginx/body --http-fastcgi-temp-path=/var/lib/nginx/fastcgi --http-proxy-temp-path=/var/lib/nginx/proxy --http-scgi-temp-path=/var/lib/nginx/scgi --http-uwsgi-temp-path=/var/lib/nginx/uwsgi --with-compat --with-debug --with-pcre-jit --with-http_ssl_module --with-http_stub_status_module --with-http_realip_module --with-http_auth_request_module --with-http_v2_module --with-http_dav_module --with-http_slice_module --with-threads --add-dynamic-module=/build/nginx-niToSo/nginx-1.18.0/debian/modules/http-geoip2 --with-http_addition_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_sub_module
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== NGINX КОНФИГУРАЦИЯ ==="
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/
=== NGINX КОНФИГУРАЦИЯ ===
total 24
drwxr-xr-x 2 root root 4096 Jun 16 16:38 .
drwxr-xr-x 8 root root 4096 Jun 16 16:28 ..
-rw-r--r-- 1 root root 2412 May 30  2023 default
-rw-r--r-- 1 root root 2200 Jun 16 16:38 mapmon
-rw-r--r-- 1 root root 1785 Jun 16 16:04 mapmon.backup
-rw-r--r-- 1 root root 1859 Jun 16 16:37 mapmon.backup-admin
total 8
drwxr-xr-x 2 root root 4096 Jun 16 03:46 .
drwxr-xr-x 8 root root 4096 Jun 16 16:28 ..
lrwxrwxrwx 1 root root   33 Jun 16 03:46 mapmon -> /etc/nginx/sites-available/mapmon
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== СОДЕРЖИМОЕ КОНФИГУРАЦИЙ ==="
echo "--- sites-available/mapmon ---"
sudo cat /etc/nginx/sites-available/mapmon
echo ""
echo "--- sites-enabled/mapmon ---"
sudo cat /etc/nginx/sites-enabled/mapmon
echo ""
echo "--- sites-available/mapmon.backup ---"
sudo cat /etc/nginx/sites-available/mapmon.backup
=== СОДЕРЖИМОЕ КОНФИГУРАЦИЙ ===
--- sites-available/mapmon ---
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
server {
    if ($host = www.fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    return 404; # managed by Certbot




}
--- sites-enabled/mapmon ---
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
server {
    if ($host = www.fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    return 404; # managed by Certbot




}
--- sites-available/mapmon.backup ---
server {
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

    # Статические файлы с кешированием
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/fleetmonitor.ru/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/fleetmonitor.ru/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = fleetmonitor.ru) {
        return 301 https://$host$request_uri;
    } # managed by Certbot



    listen 80;
    server_name fleetmonitor.ru www.fleetmonitor.ru;
    return 404; # managed by Certbot




}root@5018543-bi97187:~#
root@5018543-bi97187:~#echo "=== ПОИСК ПОРТОВ В КОНФИГУРАЦИИ ===""
sudo grep -r "3000\|3001" /etc/nginx/
sudo grep -r "proxy_pass" /etc/nginx/sites-enabled/
=== ПОИСК ПОРТОВ В КОНФИГУРАЦИИ ===
/etc/nginx/sites-available/mapmon.backup-admin:        proxy_pass http://127.0.0.1:3001;
/etc/nginx/sites-available/mapmon.backup-admin:        proxy_pass http://127.0.0.1:3000;
/etc/nginx/sites-available/mapmon.backup:        proxy_pass http://127.0.0.1:3000;
/etc/nginx/sites-available/mapmon.backup:        proxy_pass http://127.0.0.1:3000;
/etc/nginx/sites-available/mapmon:        proxy_pass http://127.0.0.1:3001;
/etc/nginx/sites-available/mapmon:        proxy_pass http://127.0.0.1:3000;
root@5018543-bi97187:~# echo "=== PM2 ПРОЦЕССЫ ==="
pm2 status
pm2 info mapmon
pm2 info mapmon-api
pm2 info mqtt-collector
=== PM2 ПРОЦЕССЫ ===
┌────┬───────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name              │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ mapmon            │ default     │ 0.7.0   │ cluster │ 16520    │ 3h     │ 1    │ online    │ 0%       │ 80.1mb   │ root     │ disabled │
│ 1  │ mapmon-api        │ default     │ 0.7.0   │ cluster │ 16521    │ 3h     │ 1    │ online    │ 0%       │ 67.5mb   │ root     │ disabled │
│ 2  │ mqtt-collector    │ default     │ 0.7.0   │ cluster │ 16534    │ 3h     │ 1    │ online    │ 0%       │ 71.3mb   │ root     │ disabled │
└────┴───────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
 Describing process with id 0 - name mapmon
┌───────────────────┬────────────────────────────────────────────┐
│ status            │ online                                     │
│ name              │ mapmon                                     │
│ namespace         │ default                                    │
│ version           │ 0.7.0                                      │
│ restarts          │ 1                                          │
│ uptime            │ 3h                                         │
│ entire log path   │ /var/www/mapmon/logs/mapmon-combined-0.log │
│ script path       │ /var/www/mapmon/.output/server/index.mjs   │
│ script args       │ N/A                                        │
│ error log path    │ /var/www/mapmon/logs/mapmon-error-0.log    │
│ out log path      │ /var/www/mapmon/logs/mapmon-out-0.log      │
│ pid path          │ /root/.pm2/pids/mapmon-0.pid               │
│ interpreter       │ /usr/bin/node                              │
│ interpreter args  │ N/A                                        │
│ script id         │ 0                                          │
│ exec cwd          │ /var/www/mapmon                            │
│ exec mode         │ cluster_mode                               │
│ node.js version   │ 20.19.2                                    │
│ node env          │ production                                 │
│ watch & reload    │ ✘                                          │
│ unstable restarts │ 0                                          │
│ created at        │ 2025-07-11T11:45:15.796Z                   │
└───────────────────┴────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 20.63 MiB │
│ Heap Usage             │ 71.84 %   │
│ Heap Size              │ 28.71 MiB │
│ Event Loop Latency p95 │ 1.26 ms   │
│ Event Loop Latency     │ 0.41 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon [--lines 1000]` to display logs
 Use `pm2 env 0` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon
 Describing process with id 1 - name mapmon-api
┌───────────────────┬──────────────────────────────────────────────┐
│ status            │ online                                       │
│ name              │ mapmon-api                                   │
│ namespace         │ default                                      │
│ version           │ 0.7.0                                        │
│ restarts          │ 1                                            │
│ uptime            │ 3h                                           │
│ entire log path   │ /var/www/mapmon/logs/api-combined-1.log      │
│ script path       │ /var/www/mapmon/server-backup/api-server.cjs │
│ script args       │ N/A                                          │
│ error log path    │ /var/www/mapmon/logs/api-error-1.log         │
│ out log path      │ /var/www/mapmon/logs/api-out-1.log           │
│ pid path          │ /root/.pm2/pids/mapmon-api-1.pid             │
│ interpreter       │ /usr/bin/node                                │
│ interpreter args  │ N/A                                          │
│ script id         │ 1                                            │
│ exec cwd          │ /var/www/mapmon                              │
│ exec mode         │ cluster_mode                                 │
│ node.js version   │ 20.19.2                                      │
│ node env          │ production                                   │
│ watch & reload    │ ✘                                            │
│ unstable restarts │ 0                                            │
│ created at        │ 2025-07-11T11:45:15.801Z                     │
└───────────────────┴──────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon-api <action_name>

 Code metrics value
┌────────────────────────┬──────────────┐
│ Used Heap Size         │ 13.66 MiB    │
│ Heap Usage             │ 74.94 %      │
│ Heap Size              │ 18.22 MiB    │
│ Event Loop Latency p95 │ 1.18 ms      │
│ Event Loop Latency     │ 0.39 ms      │
│ Active handles         │ 1            │
│ Active requests        │ 0            │
│ HTTP                   │ 0.16 req/min │
│ HTTP P95 Latency       │ 3 ms         │
│ HTTP Mean Latency      │ 1 ms         │
└────────────────────────┴──────────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon-api [--lines 1000]` to display logs
 Use `pm2 env 1` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon-api
 Describing process with id 2 - name mqtt-collector
┌───────────────────┬──────────────────────────────────────────────────┐
│ status            │ online                                           │
│ name              │ mqtt-collector                                   │
│ namespace         │ default                                          │
│ version           │ 0.7.0                                            │
│ restarts          │ 1                                                │
│ uptime            │ 3h                                               │
│ entire log path   │ /var/www/mapmon/logs/mqtt-combined-2.log         │
│ script path       │ /var/www/mapmon/server-backup/mqtt-collector.cjs │
│ script args       │ N/A                                              │
│ error log path    │ /var/www/mapmon/logs/mqtt-error-2.log            │
│ out log path      │ /var/www/mapmon/logs/mqtt-out-2.log              │
│ pid path          │ /root/.pm2/pids/mqtt-collector-2.pid             │
│ interpreter       │ /usr/bin/node                                    │
│ interpreter args  │ N/A                                              │
│ script id         │ 2                                                │
│ exec cwd          │ /var/www/mapmon                                  │
│ exec mode         │ cluster_mode                                     │
│ node.js version   │ 20.19.2                                          │
│ node env          │ production                                       │
│ watch & reload    │ ✘                                                │
│ unstable restarts │ 0                                                │
│ created at        │ 2025-07-11T11:45:15.845Z                         │
└───────────────────┴──────────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mqtt-collector <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 19.42 MiB │
│ Heap Usage             │ 94.93 %   │
│ Heap Size              │ 20.46 MiB │
│ Event Loop Latency p95 │ 1.11 ms   │
│ Event Loop Latency     │ 0.36 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mqtt-collector [--lines 1000]` to display logs
 Use `pm2 env 2` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mqtt-collector
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ДЕТАЛИ ПРОЦЕССОВ ==="
pm2 show mapmon
pm2 show mapmon-api
pm2 show mqtt-collector
=== ДЕТАЛИ ПРОЦЕССОВ ===
 Describing process with id 0 - name mapmon
┌───────────────────┬────────────────────────────────────────────┐
│ status            │ online                                     │
│ name              │ mapmon                                     │
│ namespace         │ default                                    │
│ version           │ 0.7.0                                      │
│ restarts          │ 1                                          │
│ uptime            │ 3h                                         │
│ entire log path   │ /var/www/mapmon/logs/mapmon-combined-0.log │
│ script path       │ /var/www/mapmon/.output/server/index.mjs   │
│ script args       │ N/A                                        │
│ error log path    │ /var/www/mapmon/logs/mapmon-error-0.log    │
│ out log path      │ /var/www/mapmon/logs/mapmon-out-0.log      │
│ pid path          │ /root/.pm2/pids/mapmon-0.pid               │
│ interpreter       │ /usr/bin/node                              │
│ interpreter args  │ N/A                                        │
│ script id         │ 0                                          │
│ exec cwd          │ /var/www/mapmon                            │
│ exec mode         │ cluster_mode                               │
│ node.js version   │ 20.19.2                                    │
│ node env          │ production                                 │
│ watch & reload    │ ✘                                          │
│ unstable restarts │ 0                                          │
│ created at        │ 2025-07-11T11:45:15.796Z                   │
└───────────────────┴────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 20.09 MiB │
│ Heap Usage             │ 69.97 %   │
│ Heap Size              │ 28.71 MiB │
│ Event Loop Latency p95 │ 1.25 ms   │
│ Event Loop Latency     │ 0.40 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon [--lines 1000]` to display logs
 Use `pm2 env 0` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon
 Describing process with id 1 - name mapmon-api
┌───────────────────┬──────────────────────────────────────────────┐
│ status            │ online                                       │
│ name              │ mapmon-api                                   │
│ namespace         │ default                                      │
│ version           │ 0.7.0                                        │
│ restarts          │ 1                                            │
│ uptime            │ 3h                                           │
│ entire log path   │ /var/www/mapmon/logs/api-combined-1.log      │
│ script path       │ /var/www/mapmon/server-backup/api-server.cjs │
│ script args       │ N/A                                          │
│ error log path    │ /var/www/mapmon/logs/api-error-1.log         │
│ out log path      │ /var/www/mapmon/logs/api-out-1.log           │
│ pid path          │ /root/.pm2/pids/mapmon-api-1.pid             │
│ interpreter       │ /usr/bin/node                                │
│ interpreter args  │ N/A                                          │
│ script id         │ 1                                            │
│ exec cwd          │ /var/www/mapmon                              │
│ exec mode         │ cluster_mode                                 │
│ node.js version   │ 20.19.2                                      │
│ node env          │ production                                   │
│ watch & reload    │ ✘                                            │
│ unstable restarts │ 0                                            │
│ created at        │ 2025-07-11T11:45:15.801Z                     │
└───────────────────┴──────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mapmon-api <action_name>

 Code metrics value
┌────────────────────────┬─────────────┐
│ Used Heap Size         │ 14.27 MiB   │
│ Heap Usage             │ 78.32 %     │
│ Heap Size              │ 18.22 MiB   │
│ Event Loop Latency p95 │ 1.17 ms     │
│ Event Loop Latency     │ 0.39 ms     │
│ Active handles         │ 1           │
│ Active requests        │ 0           │
│ HTTP                   │ 0.2 req/min │
│ HTTP P95 Latency       │ 3 ms        │
│ HTTP Mean Latency      │ 1 ms        │
└────────────────────────┴─────────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mapmon-api [--lines 1000]` to display logs
 Use `pm2 env 1` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mapmon-api
 Describing process with id 2 - name mqtt-collector
┌───────────────────┬──────────────────────────────────────────────────┐
│ status            │ online                                           │
│ name              │ mqtt-collector                                   │
│ namespace         │ default                                          │
│ version           │ 0.7.0                                            │
│ restarts          │ 1                                                │
│ uptime            │ 3h                                               │
│ entire log path   │ /var/www/mapmon/logs/mqtt-combined-2.log         │
│ script path       │ /var/www/mapmon/server-backup/mqtt-collector.cjs │
│ script args       │ N/A                                              │
│ error log path    │ /var/www/mapmon/logs/mqtt-error-2.log            │
│ out log path      │ /var/www/mapmon/logs/mqtt-out-2.log              │
│ pid path          │ /root/.pm2/pids/mqtt-collector-2.pid             │
│ interpreter       │ /usr/bin/node                                    │
│ interpreter args  │ N/A                                              │
│ script id         │ 2                                                │
│ exec cwd          │ /var/www/mapmon                                  │
│ exec mode         │ cluster_mode                                     │
│ node.js version   │ 20.19.2                                          │
│ node env          │ production                                       │
│ watch & reload    │ ✘                                                │
│ unstable restarts │ 0                                                │
│ created at        │ 2025-07-11T11:45:15.845Z                         │
└───────────────────┴──────────────────────────────────────────────────┘
 Actions available
┌────────────────────────┐
│ km:heapdump            │
│ km:cpu:profiling:start │
│ km:cpu:profiling:stop  │
│ km:heap:sampling:start │
│ km:heap:sampling:stop  │
└────────────────────────┘
 Trigger via: pm2 trigger mqtt-collector <action_name>

 Code metrics value
┌────────────────────────┬───────────┐
│ Used Heap Size         │ 19.22 MiB │
│ Heap Usage             │ 92.79 %   │
│ Heap Size              │ 20.71 MiB │
│ Event Loop Latency p95 │ 1.12 ms   │
│ Event Loop Latency     │ 0.37 ms   │
│ Active handles         │ 2         │
│ Active requests        │ 0         │
└────────────────────────┴───────────┘
 Divergent env variables from local env
┌────────────────┬──────────────────────────────────────┐
│ PWD            │ /var/www/mapmon                      │
│ SSH_CONNECTION │ 188.162.173.9 19214 147.45.213.22 22 │
│ XDG_SESSION_ID │ 77                                   │
│ SSH_CLIENT     │ 188.162.173.9 19214 22               │
└────────────────┴──────────────────────────────────────┘

 Add your own code metrics: http://bit.ly/code-metrics
 Use `pm2 logs mqtt-collector [--lines 1000]` to display logs
 Use `pm2 env 2` to display environment variables
 Use `pm2 monit` to monitor CPU and Memory usage mqtt-collector
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ПОСЛЕДНИЕ ЛОГИ PM2 ==="
pm2 logs --lines 20
=== ПОСЛЕДНИЕ ЛОГИ PM2 ===
[TAILING] Tailing last 20 lines for [all] processes (change the value with --lines option)
/root/.pm2/pm2.log last 20 lines:
PM2        | 2025-07-11T14:32:30: PM2 log: App [mapmon-api:1] online
PM2        | 2025-07-11T14:32:30: PM2 log: App [mqtt-collector:2] online
PM2        | 2025-07-11T14:43:59: PM2 log: Stopping app:mapmon id:0
PM2        | 2025-07-11T14:43:59: PM2 log: Stopping app:mapmon-api id:1
PM2        | 2025-07-11T14:43:59: PM2 log: App name:mapmon-api id:1 disconnected
PM2        | 2025-07-11T14:43:59: PM2 log: App [mapmon-api:1] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:43:59: PM2 log: App name:mapmon id:0 disconnected
PM2        | 2025-07-11T14:43:59: PM2 log: App [mapmon:0] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16315 msg=process killed
PM2        | 2025-07-11T14:44:00: PM2 log: Stopping app:mqtt-collector id:2
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16316 msg=process killed
PM2        | 2025-07-11T14:44:00: PM2 log: App name:mqtt-collector id:2 disconnected
PM2        | 2025-07-11T14:44:00: PM2 log: App [mqtt-collector:2] exited with code [0] via signal [SIGINT]
PM2        | 2025-07-11T14:44:00: PM2 log: pid=16329 msg=process killed
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon:0] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon-api:1] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon-api:1] online
PM2        | 2025-07-11T14:45:15: PM2 log: App [mqtt-collector:2] starting in -cluster mode-
PM2        | 2025-07-11T14:45:15: PM2 log: App [mapmon:0] online
PM2        | 2025-07-11T14:45:15: PM2 log: App [mqtt-collector:2] online

/var/www/mapmon/logs/api-error-1.log last 20 lines:
/var/www/mapmon/logs/mapmon-error-0.log last 20 lines:
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:511:9)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   | 2025-06-27T16:51:49: [unhandledRejection] TypeError: Cannot read properties of undefined (reading 'size')
0|mapmon   |     at file:///var/www/mapmon/pages/history.vue:86:87
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:444:9)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:507:14)
0|mapmon   |     at renderVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:511:9)
0|mapmon   |     at renderComponentSubTree (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:459:7)
0|mapmon   |     at renderComponentVNode (/var/www/mapmon/.output/server/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:394:12)
0|mapmon   | 2025-06-27T17:56:21: [nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.

/var/www/mapmon/logs/mqtt-error-2.log last 20 lines:
2|mqtt-col | 2025-06-26T22:27:47: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:28:18: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:28:49: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:29:20: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:29:51: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:30:22: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:30:53: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:31:24: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:31:55: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:32:26: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:32:57: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:33:28: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:33:59: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:34:30: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:35:01: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:35:32: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-26T22:36:03: ❌ MQTT Error: connack timeout
2|mqtt-col | 2025-06-27T15:08:47: ❌ MQTT Error: Keepalive timeout
2|mqtt-col | 2025-07-06T20:54:19: ❌ MQTT Error: read ECONNRESET
2|mqtt-col | 2025-07-08T07:30:18: ❌ MQTT Error: read ECONNRESET

/var/www/mapmon/logs/mapmon-out-0.log last 20 lines:
0|mapmon   | 2025-06-27T16:50:25: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T16:58:08: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T17:55:54: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-27T18:22:16: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-06-28T11:26:42: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-04T18:20:24: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T01:17:30: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:13:55: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:17:54: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T08:22:29: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-05T10:19:26: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-08T16:32:12: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T00:26:26: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T09:01:39: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T15:58:37: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-10T21:51:43: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T12:04:25: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:15:00: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:32:31: Listening on http://0.0.0.0:3000
0|mapmon   | 2025-07-11T14:45:16: Listening on http://0.0.0.0:3000

/var/www/mapmon/logs/mqtt-out-2.log last 20 lines:
2|mqtt-col | 2025-07-11T18:25:42: 📊 Processed data for device ESP32_Car_2046: {
2|mqtt-col |   id: 'ESP32_Car_2046',
2|mqtt-col |   lat: 55.7558,
2|mqtt-col |   lng: 37.6176,
2|mqtt-col |   speed: 0,
2|mqtt-col |   status: 'stopped',
2|mqtt-col |   battery: 82.91,
2|mqtt-col |   temperature: 23.5,
2|mqtt-col |   rpm: 741,
2|mqtt-col |   timestamp: 734185,
2|mqtt-col |   messageCount: 141,
2|mqtt-col |   rssi: -65,
2|mqtt-col |   freeHeap: 227656,
2|mqtt-col |   broker: 'Eclipse Mosquitto',
2|mqtt-col |   device_id: 'ESP32_Car_2046',
2|mqtt-col |   vehicle_id: 'ESP32_Car_2046'
2|mqtt-col | }
2|mqtt-col | 2025-07-11T18:25:42: 💾 SAVED TO SQLITE - ID: 11729
2|mqtt-col | 2025-07-11T18:25:42: 💾 SAVED TO SQLITE - ID: unknown
2|mqtt-col | 2025-07-11T18:25:42: 💾 Saved: OK

/var/www/mapmon/logs/api-out-1.log last 20 lines:
1|mapmon-a | 247562658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pc","res":{"statusCode":200},"responseTime":0.5452889949083328,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:05: {"level":30,"time":1752247565657,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pd","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":44088},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:05: {"level":30,"time":1752247565658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pd","res":{"statusCode":200},"responseTime":0.5329339951276779,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:11: {"level":30,"time":1752247571658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pe","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":50442},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:11: {"level":30,"time":1752247571660,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pe","res":{"statusCode":200},"responseTime":1.0958259999752045,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:14: {"level":30,"time":1752247574658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pf","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":50450},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:14: {"level":30,"time":1752247574659,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pf","res":{"statusCode":200},"responseTime":0.714834988117218,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:20: {"level":30,"time":1752247580662,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pg","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":56818},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:20: {"level":30,"time":1752247580664,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pg","res":{"statusCode":200},"responseTime":0.7631499916315079,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:23: {"level":30,"time":1752247583678,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1ph","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":56824},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:23: {"level":30,"time":1752247583680,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1ph","res":{"statusCode":200},"responseTime":1.467059001326561,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:30: {"level":30,"time":1752247590658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pi","req":{"method":"GET","url":"/api/telemetry/history?range=1h","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60366},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:30: {"level":30,"time":1752247590660,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pi","res":{"statusCode":200},"responseTime":2.1169589906930923,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:33: {"level":30,"time":1752247593657,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pj","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60372},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:33: {"level":30,"time":1752247593658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pj","res":{"statusCode":200},"responseTime":0.8087709993124008,"msg":"request completed"}
1|mapmon-a | 2025-07-11T18:26:36: {"level":30,"time":1752247596658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pk","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":60374},"msg":"incoming request"}
1|mapmon-a | 2025-07-11T18:26:36: {"level":30,"time":1752247596659,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pk","res":{"statusCode":200},"responseTime":0.6546109914779663,"msg":"request completed"}

1|mapmon-api  | 2025-07-11T18:26:49: {"level":30,"time":1752247609658,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pl","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":48616},"msg":"incoming request"}
1|mapmon-api  | 2025-07-11T18:26:49: {"level":30,"time":1752247609661,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pl","res":{"statusCode":200},"responseTime":1.4615339934825897,"msg":"request completed"}
1|mapmon-api  | 2025-07-11T18:26:52: {"level":30,"time":1752247612643,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pm","req":{"method":"GET","url":"/api/telemetry/delta?since=1752247542401","host":"fleetmonitor.ru","remoteAddress":"127.0.0.1","remotePort":48630},"msg":"incoming request"}
1|mapmon-api  | 2025-07-11T18:26:52: {"level":30,"time":1752247612645,"pid":16521,"hostname":"5018543-bi97187","reqId":"req-1pm","res":{"statusCode":200},"responseTime":0.7036760002374649,"msg":"request completed"}
^C
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== АКТИВНЫЕ ПОРТЫ ==="
sudo netstat -tulpn | grep -E ":3000|:3001|:80|:443"
sudo ss -tulpn | grep -E ":3000|:3001|:80|:443"
=== АКТИВНЫЕ ПОРТЫ ===
tcp        0      0 0.0.0.0:3001            0.0.0.0:*               LISTEN      791/PM2 v6.0.8: God
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      791/PM2 v6.0.8: God
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      748/nginx: master p
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      748/nginx: master p
tcp   LISTEN 0      511                            0.0.0.0:3001       0.0.0.0:*    users:(("PM2 v6.0.8: God",pid=791,fd=27))
tcp   LISTEN 0      511                            0.0.0.0:3000       0.0.0.0:*    users:(("PM2 v6.0.8: God",pid=791,fd=3))
tcp   LISTEN 0      511                            0.0.0.0:443        0.0.0.0:*    users:(("nginx",pid=751,fd=8),("nginx",pid=748,fd=8))
tcp   LISTEN 0      511                            0.0.0.0:80         0.0.0.0:*    users:(("nginx",pid=751,fd=9),("nginx",pid=748,fd=9))
root@5018543-bi97187:~# echo "=== ПРОВЕРКА ПОРТОВ ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/status
=== ПРОВЕРКА ПОРТОВ ===
200404200root@5018543-biecho "=== ТЕСТ API ЭНДПОИНТОВ ==="НТОВ ==="
echo "--- Порт 3000 ---"
curl -s http://localhost:3000/api/status || echo "Порт 3000 недоступен"
echo ""
echo "--- Порт 3001 ---"
curl -s http://localhost:3001/api/status || echo "Порт 3001 недоступен"
echo ""
echo "--- Через Nginx ---"
curl -s http://localhost/api/status || echo "Nginx прокси недоступен"
=== ТЕСТ API ЭНДПОИНТОВ ===
--- Порт 3000 ---
{
  "error": true,
  "url": "http://localhost:3000/api/status",
  "statusCode": 404,
  "statusMessage": "Page not found: /api/status",
  "message": "Page not found: /api/status",
  "data": {
    "path": "/api/status"
  }
}
--- Порт 3001 ---
{"status":"API Server running with SQLite","timestamp":"2025-07-11T15:27:41.396Z","database":"SQLite"}
--- Через Nginx ---
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
</body>
</html>
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== СТРУКТУРА ПРОЕКТА ==="
ls -la /var/www/mapmon/
ls -la /var/www/mapmon/server/
ls -la /var/www/mapmon/server-backup/
=== СТРУКТУРА ПРОЕКТА ===
total 668
drwxr-xr-x  18 root root   4096 Jul 11 14:44 .
drwxr-xr-x   8 root root   4096 Jul  8 15:54 ..
-rw-r--r--   1 root root   2812 Jul 11 14:12 app.vue
-rw-r--r--   1 root root  32153 Jul  8 15:55 CHANGELOG.md
-rw-r--r--   1 root root  18397 Jul 11 12:01 CHAT_CONTEXT.md
-rw-r--r--   1 root root  14180 Jul  8 15:55 CLAUDE_CODE_GUIDE_RU.md
-rw-r--r--   1 root root   8036 Jul 10 08:59 CLAUDE.md
drwxr-xr-x   2 root root   4096 Jul 11 14:12 components
drwxr-xr-x   2 root root   4096 Jul 11 14:44 composables
-rw-r--r--   1 root root  13407 Jul  8 15:55 CRITICAL_ISSUES_ANALYSIS.md
-rw-r--r--   1 root root   1132 Jul  8 15:55 ecosystem.config.cjs
-rw-r--r--   1 root root   1091 Jun 23 17:44 ecosystem.config.cjs.backup
-rw-r--r--   1 root root   1797 Jul  8 15:55 env.example
drwxr-xr-x   5 root root   4096 Jul 11 14:12 esp32
drwxr-xr-x   8 root root   4096 Jul 11 14:44 .git
-rw-r--r--   1 root root    624 Jul  8 15:55 .gitignore
-rw-r--r--   1 root root   5430 Jul  8 15:55 GRAPHS_README.md
drwxr-xr-x   2 root root   4096 Jul 11 14:31 inx
drwxr-xr-x   2 root root   4096 Jun 22 15:02 logs
-rw-r--r--   1 root root   5382 Jul  8 15:55 MQTT_SETUP.md
-rw-r--r--   1 root root   9353 Jul 10 21:47 NEW_CHAT_CONTEXT.md
drwxr-xr-x 751 root root  24576 Jul  9 21:58 node_modules
drwxr-xr-x   7 root root   4096 Jul 11 14:44 .nuxt
-rw-r--r--   1 root root   1104 Jun 22 06:55 nuxt.config.ts
drwxr-xr-x   4 root root   4096 Jul 11 14:45 .output
-rw-r--r--   1 root root    929 Jul  8 15:55 package.json
drwxr-xr-x   2 root root   4096 Jul 11 14:12 pages
-rw-r--r--   1 root root   2400 Jul  8 15:55 playwright.config.ts
drwxr-xr-x   2 root root   4096 Jul  8 15:55 plugins
drwxr-xr-x   2 root root   4096 Jul 10 08:59 problem-fixes
-rw-r--r--   1 root root  17986 Jul  8 15:55 README.md
-rw-r--r--   1 root root   3119 Jul  8 15:55 ROLLBACK_SYSTEM.md
drwxr-xr-x   2 root root   4096 Jul 11 14:12 server
drwxr-xr-x   2 root root   4096 Jul 11 18:28 server-backup
drwxr-xr-x   2 root root   4096 Jul  8 15:55 server-versions
-rw-r--r--   1 root root  14720 Jul  8 15:55 TESTING_STRATEGY.md
drwxr-xr-x   6 root root   4096 Jul  8 15:55 tests
-rw-r--r--   1 root root     43 Jun 16 03:34 tsconfig.json
-rw-r--r--   1 root root   1740 Jul  8 15:55 vitest.config.ts
-rw-r--r--   1 root root   7932 Jul  8 15:55 VPS_UPDATE_INSTRUCTIONS_v2.md
-rw-r--r--   1 root root 372813 Jul  9 21:58 yarn.lock
total 12
drwxr-xr-x  2 root root 4096 Jul 11 14:12 .
drwxr-xr-x 18 root root 4096 Jul 11 14:44 ..
-rw-r--r--  1 root root 3690 Jul 11 14:12 index.cjs
total 1624
drwxr-xr-x  2 root root    4096 Jul 11 18:28 .
drwxr-xr-x 18 root root    4096 Jul 11 14:44 ..
-rw-r--r--  1 root root    7987 Jul 10 15:56 api-server.cjs
-rw-r--r--  1 root root 1531904 Jul 11 18:28 mapmon.db
-rw-r--r--  1 root root    4554 Jul 10 21:47 mqtt-collector.cjs
-rw-r--r--  1 root root    2200 Jun 17 21:45 nginx-mapmon.conf
-rw-r--r--  1 root root     516 Jul 10 15:56 schema.sql
-rw-r--r--  1 root root   27619 Jun 17 21:45 server-analytics.vue
-rw-r--r--  1 root root    4547 Jun 17 21:45 server-AppHeader.vue
-rw-r--r--  1 root root   17950 Jun 17 21:45 server-app.vue
-rw-r--r--  1 root root    1495 Jun 17 21:45 server-history.vue
-rw-r--r--  1 root root    8134 Jul  9 21:57 server-index.vue
-rw-r--r--  1 root root    9000 Jun 17 21:45 server-MapComponent.vue
-rw-r--r--  1 root root     566 Jun 17 21:45 server-package.json
-rw-r--r--  1 root root      43 Jun 17 21:45 server-tsconfig.json
-rw-r--r--  1 root root    3305 Jul 10 15:56 SQLiteManager.cjs
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== КОНФИГУРАЦИИ ПРОЕКТА ==="
cat /var/www/mapmon/ecosystem.config.cjs
cat /var/www/mapmon/package.json | grep -A 10 -B 10 "scripts"
=== КОНФИГУРАЦИИ ПРОЕКТА ===
module.exports = {
  apps: [
    {
      name: 'mapmon',
      script: '.output/server/index.mjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0'
      },
      error_file: './logs/mapmon-error.log',
      out_file: './logs/mapmon-out.log',
      log_file: './logs/mapmon-combined.log',
      time: true
    },
    {
      name: 'mapmon-api',
      script: 'server-backup/api-server.cjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      env: { NODE_ENV: 'production' },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'mqtt-collector',
      script: 'server-backup/mqtt-collector.cjs',
      cwd: '/var/www/mapmon',
      instances: 1,
      env: { NODE_ENV: 'production' },
      error_file: './logs/mqtt-error.log',
      out_file: './logs/mqtt-out.log',
      log_file: './logs/mqtt-combined.log',
      time: true
    }
  ]
} {
  "name": "fleet-monitor",
  "version": "0.7.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "dev:api": "tsx server/index.ts",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:api\"",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== БАЗА ДАННЫХ ==="
ls -la /var/www/mapmon/server-backup/*.db
ls -la /var/www/mapmon/*.db
find /var/www/mapmon -name "*.db" -type f
=== БАЗА ДАННЫХ ===
-rw-r--r-- 1 root root 1531904 Jul 11 18:28 /var/www/mapmon/server-backup/mapmon.db
ls: cannot access '/var/www/mapmon/*.db': No such file or directory
/var/www/mapmon/server-backup/mapmon.db
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ПРАВА ДОСТУПА ==="
ls -la /var/www/mapmon/
ls -la /var/www/mapmon/server-backup/
sudo ls -la /etc/nginx/sites-available/
sudo ls -la /etc/nginx/sites-enabled/
=== ПРАВА ДОСТУПА ===
total 668
drwxr-xr-x  18 root root   4096 Jul 11 14:44 .
drwxr-xr-x   8 root root   4096 Jul  8 15:54 ..
-rw-r--r--   1 root root   2812 Jul 11 14:12 app.vue
-rw-r--r--   1 root root  32153 Jul  8 15:55 CHANGELOG.md
-rw-r--r--   1 root root  18397 Jul 11 12:01 CHAT_CONTEXT.md
-rw-r--r--   1 root root  14180 Jul  8 15:55 CLAUDE_CODE_GUIDE_RU.md
-rw-r--r--   1 root root   8036 Jul 10 08:59 CLAUDE.md
drwxr-xr-x   2 root root   4096 Jul 11 14:12 components
drwxr-xr-x   2 root root   4096 Jul 11 14:44 composables
-rw-r--r--   1 root root  13407 Jul  8 15:55 CRITICAL_ISSUES_ANALYSIS.md
-rw-r--r--   1 root root   1132 Jul  8 15:55 ecosystem.config.cjs
-rw-r--r--   1 root root   1091 Jun 23 17:44 ecosystem.config.cjs.backup
-rw-r--r--   1 root root   1797 Jul  8 15:55 env.example
drwxr-xr-x   5 root root   4096 Jul 11 14:12 esp32
drwxr-xr-x   8 root root   4096 Jul 11 14:44 .git
-rw-r--r--   1 root root    624 Jul  8 15:55 .gitignore
-rw-r--r--   1 root root   5430 Jul  8 15:55 GRAPHS_README.md
drwxr-xr-x   2 root root   4096 Jul 11 14:31 inx
drwxr-xr-x   2 root root   4096 Jun 22 15:02 logs
-rw-r--r--   1 root root   5382 Jul  8 15:55 MQTT_SETUP.md
-rw-r--r--   1 root root   9353 Jul 10 21:47 NEW_CHAT_CONTEXT.md
drwxr-xr-x 751 root root  24576 Jul  9 21:58 node_modules
drwxr-xr-x   7 root root   4096 Jul 11 14:44 .nuxt
-rw-r--r--   1 root root   1104 Jun 22 06:55 nuxt.config.ts
drwxr-xr-x   4 root root   4096 Jul 11 14:45 .output
-rw-r--r--   1 root root    929 Jul  8 15:55 package.json
drwxr-xr-x   2 root root   4096 Jul 11 14:12 pages
-rw-r--r--   1 root root   2400 Jul  8 15:55 playwright.config.ts
drwxr-xr-x   2 root root   4096 Jul  8 15:55 plugins
drwxr-xr-x   2 root root   4096 Jul 10 08:59 problem-fixes
-rw-r--r--   1 root root  17986 Jul  8 15:55 README.md
-rw-r--r--   1 root root   3119 Jul  8 15:55 ROLLBACK_SYSTEM.md
drwxr-xr-x   2 root root   4096 Jul 11 14:12 server
drwxr-xr-x   2 root root   4096 Jul 11 18:28 server-backup
drwxr-xr-x   2 root root   4096 Jul  8 15:55 server-versions
-rw-r--r--   1 root root  14720 Jul  8 15:55 TESTING_STRATEGY.md
drwxr-xr-x   6 root root   4096 Jul  8 15:55 tests
-rw-r--r--   1 root root     43 Jun 16 03:34 tsconfig.json
-rw-r--r--   1 root root   1740 Jul  8 15:55 vitest.config.ts
-rw-r--r--   1 root root   7932 Jul  8 15:55 VPS_UPDATE_INSTRUCTIONS_v2.md
-rw-r--r--   1 root root 372813 Jul  9 21:58 yarn.lock
total 1624
drwxr-xr-x  2 root root    4096 Jul 11 18:28 .
drwxr-xr-x 18 root root    4096 Jul 11 14:44 ..
-rw-r--r--  1 root root    7987 Jul 10 15:56 api-server.cjs
-rw-r--r--  1 root root 1531904 Jul 11 18:28 mapmon.db
-rw-r--r--  1 root root    4554 Jul 10 21:47 mqtt-collector.cjs
-rw-r--r--  1 root root    2200 Jun 17 21:45 nginx-mapmon.conf
-rw-r--r--  1 root root     516 Jul 10 15:56 schema.sql
-rw-r--r--  1 root root   27619 Jun 17 21:45 server-analytics.vue
-rw-r--r--  1 root root    4547 Jun 17 21:45 server-AppHeader.vue
-rw-r--r--  1 root root   17950 Jun 17 21:45 server-app.vue
-rw-r--r--  1 root root    1495 Jun 17 21:45 server-history.vue
-rw-r--r--  1 root root    8134 Jul  9 21:57 server-index.vue
-rw-r--r--  1 root root    9000 Jun 17 21:45 server-MapComponent.vue
-rw-r--r--  1 root root     566 Jun 17 21:45 server-package.json
-rw-r--r--  1 root root      43 Jun 17 21:45 server-tsconfig.json
-rw-r--r--  1 root root    3305 Jul 10 15:56 SQLiteManager.cjs
total 24
drwxr-xr-x 2 root root 4096 Jun 16 16:38 .
drwxr-xr-x 8 root root 4096 Jun 16 16:28 ..
-rw-r--r-- 1 root root 2412 May 30  2023 default
-rw-r--r-- 1 root root 2200 Jun 16 16:38 mapmon
-rw-r--r-- 1 root root 1785 Jun 16 16:04 mapmon.backup
-rw-r--r-- 1 root root 1859 Jun 16 16:37 mapmon.backup-admin
total 8
drwxr-xr-x 2 root root 4096 Jun 16 03:46 .
drwxr-xr-x 8 root root 4096 Jun 16 16:28 ..
lrwxrwxrwx 1 root root   33 Jun 16 03:46 mapmon -> /etc/nginx/sites-available/mapmon
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ПРОЦЕССЫ ПОЛЬЗОВАТЕЛЕЙ ==="
ps aux | grep -E "nginx|node|pm2" | grep -v grep
=== ПРОЦЕССЫ ПОЛЬЗОВАТЕЛЕЙ ===
root         748  0.0  0.1  66260  2444 ?        Ss   Jul10   0:00 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
www-data     751  0.0  0.5  68000 10156 ?        S    Jul10   0:13 nginx: worker process
root         791  0.0  2.9 1101952 59996 ?       Ssl  Jul10   1:33 PM2 v6.0.8: God Daemon (/root/.pm2)
root       16520  0.1  4.1 11534976 82916 ?      Sl   14:45   0:24 node /var/www/mapmon/.output/server/index.mjs
root       16521  0.2  3.4 1039660 69024 ?       Sl   14:45   0:32 node /var/www/mapmon/server-backup/api-server.cjs
root       16534  0.1  3.6 1239816 72984 ?       Sl   14:45   0:23 node /var/www/mapmon/server-backup/mqtt-collector.cjs
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== СИСТЕМНЫЕ ЛОГИ ==="
sudo tail -20 /var/log/nginx/access.log
sudo tail -20 /var/log/nginx/error.log
=== СИСТЕМНЫЕ ЛОГИ ===
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /php/adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /toolsadminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /wp-content/plugins/adminer/inc/editor/index.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /adminer/ HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /_adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /tools/adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /webadminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /ad.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /adminer/adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /Adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /publicadminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /data/adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /web/adminer.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
185.148.1.243 - - [11/Jul/2025:17:48:22 +0300] "GET /pma.php HTTP/1.1" 301 178 "-" "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
204.76.203.211 - - [11/Jul/2025:17:50:47 +0300] "GET / HTTP/1.1" 404 162 "-" "Hello World"
162.244.82.179 - - [11/Jul/2025:17:52:40 +0300] "GET /restore.php HTTP/1.1" 404 134 "-" "-"
185.191.127.222 - - [11/Jul/2025:17:58:02 +0300] "GET / HTTP/1.1" 404 197 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 Edg/90.0.818.46"
149.86.227.49 - - [11/Jul/2025:18:24:14 +0300] "GET / HTTP/1.1" 404 162 "-" "Hello World/1.0"
127.0.0.1 - - [11/Jul/2025:18:27:41 +0300] "GET /api/status HTTP/1.1" 404 162 "-" "curl/7.81.0"
204.76.203.219 - - [11/Jul/2025:18:29:50 +0300] "GET / HTTP/1.1" 404 197 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 Edg/90.0.818.46"
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== РАЗМЕРЫ ЛОГОВ ==="
sudo du -sh /var/log/nginx/
sudo ls -lh /var/log/nginx/
=== РАЗМЕРЫ ЛОГОВ ===
6.5M    /var/log/nginx/
total 6.5M
-rw-r----- 1 www-data adm  43K Jul 11 18:30 access.log
-rw-r----- 1 www-data adm  54K Jul 10 23:59 access.log.1
-rw-r----- 1 www-data adm 8.1K Jun 26 23:59 access.log.10.gz
-rw-r----- 1 www-data adm 8.3K Jun 23 21:19 access.log.11.gz
-rw-r----- 1 www-data adm  12K Jun 22 23:56 access.log.12.gz
-rw-r----- 1 www-data adm 9.3K Jun 21 23:57 access.log.13.gz
-rw-r----- 1 www-data adm  11K Jun 20 23:59 access.log.14.gz
-rw-r----- 1 www-data adm 7.1K Jul  9 23:57 access.log.2.gz
-rw-r----- 1 www-data adm 7.8K Jul  8 23:54 access.log.3.gz
-rw-r----- 1 www-data adm 7.8K Jul  7 23:57 access.log.4.gz
-rw-r----- 1 www-data adm  11K Jul  6 23:52 access.log.5.gz
-rw-r----- 1 www-data adm 7.2K Jul  5 23:58 access.log.6.gz
-rw-r----- 1 www-data adm 2.1K Jul  4 23:53 access.log.7.gz
-rw-r----- 1 www-data adm 4.8K Jun 28 13:24 access.log.8.gz
-rw-r----- 1 www-data adm  10K Jun 28 00:00 access.log.9.gz
-rw-r----- 1 www-data adm    0 Jun 18 00:00 error.log
-rw-r----- 1 www-data adm 1.1K Jun 16 16:40 error.log.1
-rw-r----- 1 www-data adm 2.3M Jul 11 18:30 mapmon.access.log
-rw-r----- 1 www-data adm 3.0M Jul 10 23:59 mapmon.access.log.1
-rw-r----- 1 www-data adm  54K Jun 26 23:59 mapmon.access.log.10.gz
-rw-r----- 1 www-data adm  22K Jun 23 21:19 mapmon.access.log.11.gz
-rw-r----- 1 www-data adm 107K Jun 22 23:58 mapmon.access.log.12.gz
-rw-r----- 1 www-data adm 156K Jun 21 23:59 mapmon.access.log.13.gz
-rw-r----- 1 www-data adm  76K Jun 20 23:59 mapmon.access.log.14.gz
-rw-r----- 1 www-data adm  25K Jul  9 23:34 mapmon.access.log.2.gz
-rw-r----- 1 www-data adm  28K Jul  8 23:59 mapmon.access.log.3.gz
-rw-r----- 1 www-data adm  31K Jul  7 23:59 mapmon.access.log.4.gz
-rw-r----- 1 www-data adm  26K Jul  7 00:00 mapmon.access.log.5.gz
-rw-r----- 1 www-data adm  33K Jul  5 23:59 mapmon.access.log.6.gz
-rw-r----- 1 www-data adm 1018 Jul  4 23:35 mapmon.access.log.7.gz
-rw-r----- 1 www-data adm  23K Jun 28 13:24 mapmon.access.log.8.gz
-rw-r----- 1 www-data adm 177K Jun 27 23:59 mapmon.access.log.9.gz
-rw-r----- 1 www-data adm  40K Jul 11 17:48 mapmon.error.log
-rw-r----- 1 www-data adm  16K Jul 10 22:24 mapmon.error.log.1
-rw-r----- 1 www-data adm  27K Jun 26 23:36 mapmon.error.log.10.gz
-rw-r----- 1 www-data adm  821 Jun 23 20:41 mapmon.error.log.11.gz
-rw-r----- 1 www-data adm  29K Jun 22 22:53 mapmon.error.log.12.gz
-rw-r----- 1 www-data adm  14K Jun 21 23:59 mapmon.error.log.13.gz
-rw-r----- 1 www-data adm  339 Jun 20 17:59 mapmon.error.log.14.gz
-rw-r----- 1 www-data adm  568 Jul  9 20:43 mapmon.error.log.2.gz
-rw-r----- 1 www-data adm  568 Jul  8 21:21 mapmon.error.log.3.gz
-rw-r----- 1 www-data adm  603 Jul  7 22:27 mapmon.error.log.4.gz
-rw-r----- 1 www-data adm  280 Jul  6 20:31 mapmon.error.log.5.gz
-rw-r----- 1 www-data adm 2.8K Jul  5 23:10 mapmon.error.log.6.gz
-rw-r----- 1 www-data adm  220 Jul  4 23:27 mapmon.error.log.7.gz
-rw-r----- 1 www-data adm 1.7K Jun 28 12:29 mapmon.error.log.8.gz
-rw-r----- 1 www-data adm  18K Jun 27 23:54 mapmon.error.log.9.gz
root@5018543-bi97187:~#
root@5018543-bi97187:~# echo "=== ТЕСТИРОВАНИЕ API ==="
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
=== ТЕСТИРОВАНИЕ API ===
1. Статус API через порт 3001:
{"status":"API Server running with SQLite","timestamp":"2025-07-11T15:30:58.459Z","database":"SQLite"}
2. Список техники через порт 3001:
{"success":true,"data":[{"id":"ESP32_Car_2046","name":"Vehicle ESP32_Car_2046"}],"count":1}
3. Телеметрия через порт 3001:
{"success":true,"data":[{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.92,"temperature":25.1,"rpm":800,"timestamp":"2025-07-11T15:30:21.648Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.93,"temperature":25.3,"rpm":800,"timestamp":"2025-07-11T15:30:18.648Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.94,"temperature":25.4,"rpm":800,"timestamp":"2025-07-11T15:30:15.586Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.95,"temperature":25.5,"rpm":800,"timestamp":"2025-07-11T15:30:12.568Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.96,"temperature":25.7,"rpm":800,"timestamp":"2025-07-11T15:30:09.571Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.97,"temperature":25.8,"rpm":800,"timestamp":"2025-07-11T15:30:06.530Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":81.98,"temperature":25.7,"rpm":800,"timestamp":"2025-07-11T15:30:03.511Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":81.99,"temperature":25.8,"rpm":1753,"timestamp":"2025-07-11T15:30:00.521Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":82.03,"temperature":25.6,"rpm":1753,"timestamp":"2025-07-11T15:29:57.446Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":82.04,"temperature":25.7,"rpm":1753,"timestamp":"2025-07-11T15:29:54.408Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":82.08,"temperature":25.8,"rpm":1753,"timestamp":"2025-07-11T15:29:51.384Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":82.12,"temperature":25.7,"rpm":1753,"timestamp":"2025-07-11T15:29:48.374Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":16,"battery":82.15,"temperature":25.5,"rpm":1753,"timestamp":"2025-07-11T15:29:45.350Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.47,"temperature":24.2,"rpm":770,"timestamp":"2025-07-11T15:28:01.521Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.48,"temperature":24.3,"rpm":770,"timestamp":"2025-07-11T15:27:58.500Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.49,"temperature":24.2,"rpm":770,"timestamp":"2025-07-11T15:27:55.502Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.5,"temperature":24.2,"rpm":770,"timestamp":"2025-07-11T15:27:52.448Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.51,"temperature":24.2,"rpm":770,"timestamp":"2025-07-11T15:27:49.420Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.52,"temperature":24.3,"rpm":770,"timestamp":"2025-07-11T15:27:46.402Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.53,"temperature":24.4,"rpm":770,"timestamp":"2025-07-11T15:27:43.383Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.54,"temperature":24.6,"rpm":1412,"timestamp":"2025-07-11T15:27:40.381Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.58,"temperature":24.3,"rpm":1412,"timestamp":"2025-07-11T15:27:37.320Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.6,"temperature":24.2,"rpm":1412,"timestamp":"2025-07-11T15:27:34.310Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.62,"temperature":24,"rpm":1412,"timestamp":"2025-07-11T15:27:31.287Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.63,"temperature":24.1,"rpm":1412,"timestamp":"2025-07-11T15:27:28.242Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":21,"battery":82.64,"temperature":24.1,"rpm":1412,"timestamp":"2025-07-11T15:27:25.207Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.91,"temperature":23.5,"rpm":741,"timestamp":"2025-07-11T15:25:42.401Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.92,"temperature":23.7,"rpm":741,"timestamp":"2025-07-11T15:25:39.399Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.93,"temperature":23.7,"rpm":741,"timestamp":"2025-07-11T15:25:36.368Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.94,"temperature":23.7,"rpm":741,"timestamp":"2025-07-11T15:25:33.323Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.95,"temperature":23.9,"rpm":741,"timestamp":"2025-07-11T15:25:30.301Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":82.96,"temperature":23.9,"rpm":741,"timestamp":"2025-07-11T15:25:27.293Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":82.97,"temperature":23.8,"rpm":1485,"timestamp":"2025-07-11T15:25:24.258Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":83.01,"temperature":23.6,"rpm":1485,"timestamp":"2025-07-11T15:25:21.241Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":83.03,"temperature":23.7,"rpm":1485,"timestamp":"2025-07-11T15:25:18.201Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":83.04,"temperature":23.8,"rpm":1485,"timestamp":"2025-07-11T15:25:15.148Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":83.08,"temperature":23.8,"rpm":1485,"timestamp":"2025-07-11T15:25:12.147Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":6,"battery":83.09,"temperature":23.8,"rpm":1485,"timestamp":"2025-07-11T15:25:09.140Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.36,"temperature":24.2,"rpm":1247,"timestamp":"2025-07-11T15:23:05.308Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.39,"temperature":24.2,"rpm":1247,"timestamp":"2025-07-11T15:23:02.291Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.43,"temperature":24.2,"rpm":1247,"timestamp":"2025-07-11T15:22:59.253Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.46,"temperature":24.1,"rpm":1247,"timestamp":"2025-07-11T15:22:56.250Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.5,"temperature":24.1,"rpm":1247,"timestamp":"2025-07-11T15:22:53.240Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.79,"temperature":23.7,"rpm":847,"timestamp":"2025-07-11T15:21:09.486Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.8,"temperature":23.8,"rpm":847,"timestamp":"2025-07-11T15:21:06.459Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.81,"temperature":23.9,"rpm":847,"timestamp":"2025-07-11T15:21:03.407Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.82,"temperature":24.1,"rpm":847,"timestamp":"2025-07-11T15:21:00.392Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.83,"temperature":24.2,"rpm":847,"timestamp":"2025-07-11T15:20:57.361Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":83.84,"temperature":24.4,"rpm":847,"timestamp":"2025-07-11T15:20:54.375Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.85,"temperature":24.4,"rpm":2523,"timestamp":"2025-07-11T15:20:51.381Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.89,"temperature":24.4,"rpm":2523,"timestamp":"2025-07-11T15:20:48.292Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.93,"temperature":24.5,"rpm":2523,"timestamp":"2025-07-11T15:20:45.250Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.94,"temperature":24.4,"rpm":2523,"timestamp":"2025-07-11T15:20:42.242Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":83.98,"temperature":24.5,"rpm":2523,"timestamp":"2025-07-11T15:20:39.191Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":84,"temperature":24.5,"rpm":2523,"timestamp":"2025-07-11T15:20:36.268Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":17,"battery":84.02,"temperature":24.5,"rpm":2523,"timestamp":"2025-07-11T15:20:33.147Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.26,"temperature":24.5,"rpm":874,"timestamp":"2025-07-11T15:18:59.454Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.27,"temperature":24.5,"rpm":874,"timestamp":"2025-07-11T15:18:56.459Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.28,"temperature":24.4,"rpm":2087,"timestamp":"2025-07-11T15:18:53.399Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.3,"temperature":24.4,"rpm":2087,"timestamp":"2025-07-11T15:18:52.054Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.34,"temperature":24.4,"rpm":2087,"timestamp":"2025-07-11T15:18:52.048Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.36,"temperature":24.1,"rpm":2087,"timestamp":"2025-07-11T15:18:52.043Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.4,"temperature":23.8,"rpm":2087,"timestamp":"2025-07-11T15:18:51.678Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.43,"temperature":23.9,"rpm":2087,"timestamp":"2025-07-11T15:18:38.288Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.44,"temperature":23.8,"rpm":2087,"timestamp":"2025-07-11T15:18:35.288Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":22,"battery":84.47,"temperature":23.7,"rpm":2087,"timestamp":"2025-07-11T15:18:32.230Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.49,"temperature":23.5,"rpm":862,"timestamp":"2025-07-11T15:18:29.188Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.5,"temperature":23.5,"rpm":862,"timestamp":"2025-07-11T15:18:26.190Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.51,"temperature":23.6,"rpm":862,"timestamp":"2025-07-11T15:18:23.160Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.52,"temperature":23.6,"rpm":862,"timestamp":"2025-07-11T15:18:20.148Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.53,"temperature":23.7,"rpm":862,"timestamp":"2025-07-11T15:18:17.096Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":31,"battery":84.77,"temperature":23.5,"rpm":2644,"timestamp":"2025-07-11T15:16:33.383Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.78,"temperature":23.5,"rpm":883,"timestamp":"2025-07-11T15:16:30.329Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.79,"temperature":23.7,"rpm":883,"timestamp":"2025-07-11T15:16:27.309Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.8,"temperature":23.6,"rpm":883,"timestamp":"2025-07-11T15:16:24.281Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.81,"temperature":23.6,"rpm":883,"timestamp":"2025-07-11T15:16:21.304Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.82,"temperature":23.6,"rpm":883,"timestamp":"2025-07-11T15:16:18.230Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":84.83,"temperature":23.7,"rpm":883,"timestamp":"2025-07-11T15:16:15.297Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.84,"temperature":23.7,"rpm":1301,"timestamp":"2025-07-11T15:16:12.177Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.86,"temperature":23.8,"rpm":1301,"timestamp":"2025-07-11T15:16:09.134Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.88,"temperature":23.7,"rpm":1301,"timestamp":"2025-07-11T15:16:06.108Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.89,"temperature":23.7,"rpm":1301,"timestamp":"2025-07-11T15:16:03.099Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.92,"temperature":23.6,"rpm":1301,"timestamp":"2025-07-11T15:16:00.103Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":13,"battery":84.95,"temperature":23.5,"rpm":1301,"timestamp":"2025-07-11T15:15:57.028Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.24,"temperature":22.8,"rpm":895,"timestamp":"2025-07-11T15:14:13.274Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.25,"temperature":22.8,"rpm":895,"timestamp":"2025-07-11T15:14:10.249Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.26,"temperature":22.9,"rpm":895,"timestamp":"2025-07-11T15:14:07.221Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.27,"temperature":23,"rpm":1210,"timestamp":"2025-07-11T15:14:04.178Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.3,"temperature":22.8,"rpm":1210,"timestamp":"2025-07-11T15:14:01.150Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.32,"temperature":22.8,"rpm":1210,"timestamp":"2025-07-11T15:13:58.133Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.34,"temperature":22.6,"rpm":1210,"timestamp":"2025-07-11T15:13:55.091Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.37,"temperature":22.6,"rpm":1210,"timestamp":"2025-07-11T15:13:52.089Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.41,"temperature":22.4,"rpm":1210,"timestamp":"2025-07-11T15:13:49.050Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":10,"battery":85.44,"temperature":22.2,"rpm":1210,"timestamp":"2025-07-11T15:13:45.995Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.46,"temperature":22.2,"rpm":null,"timestamp":"2025-07-11T15:13:42.990Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.47,"temperature":22.2,"rpm":null,"timestamp":"2025-07-11T15:13:39.968Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.48,"temperature":22.4,"rpm":null,"timestamp":"2025-07-11T15:13:36.928Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":0,"battery":85.49,"temperature":22.4,"rpm":null,"timestamp":"2025-07-11T15:13:33.995Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":9,"battery":85.32,"temperature":22.8,"rpm":2694,"timestamp":"2025-07-11T15:08:33.718Z"},{"vehicle_id":"ESP32_Car_2046","vehicle_name":"Vehicle ESP32_Car_2046","lat":55.7558,"lng":37.6176,"speed":9,"battery":85.36,"temperature":22.9,"rpm":2694,"timestamp":"2025-07-11T15:08:30.615Z"}]}
4. Статус API через Nginx:
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>

5. Список техники через Nginx:
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
root@5018543-bi97187:~#
