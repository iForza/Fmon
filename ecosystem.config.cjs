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
} 