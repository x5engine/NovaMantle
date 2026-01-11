/**
 * PM2 Ecosystem Configuration
 * For running backend and Python SaaS on Hetzner (Shared Server Safe)
 * 
 * IMPORTANT: App names are 'mantle-forge-backend' and 'mantle-forge-python-saas'
 * Make sure these don't conflict with your existing PM2 apps!
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'mantle-forge-backend',
      script: path.join(__dirname, 'dist/server/agent_node.js'),
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: path.join(__dirname, 'logs/backend-error.log'),
      out_file: path.join(__dirname, 'logs/backend-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      // Isolated from other PM2 apps
      namespace: 'mantle-forge'
    },
    {
      name: 'mantle-forge-python-saas',
      script: 'gunicorn',
      args: '-w 4 -b 0.0.0.0:5000 app:app',
      cwd: path.join(__dirname, '../python-saas'),
      interpreter: path.join(__dirname, '../python-saas/venv/bin/python'),
      env: {
        PORT: 5000,
        FLASK_ENV: 'production'
      },
      error_file: path.join(__dirname, 'logs/python-error.log'),
      out_file: path.join(__dirname, 'logs/python-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      // Isolated from other PM2 apps
      namespace: 'mantle-forge'
    }
  ]
};

