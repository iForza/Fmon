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