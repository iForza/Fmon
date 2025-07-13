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