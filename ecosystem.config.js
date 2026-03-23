module.exports = {
  apps: [{
    name: 'bbcc-api',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5003
    },
    error_file: '/var/www/bbcc/api/logs/error.log',
    out_file: '/var/www/bbcc/api/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
