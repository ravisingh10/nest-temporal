module.exports = {
  apps: [
    {
      name: 'nest-temporal-worker',
      script: 'dist/worker.js',
      instances: 1, // Single instance for Temporal worker
      exec_mode: 'fork', // Use fork mode for Temporal workers
      watch: false, // Disable watch in production
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true
    },
    {
      name: 'nest-temporal-api',
      script: 'dist/main.js',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],
};