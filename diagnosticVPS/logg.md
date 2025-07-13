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