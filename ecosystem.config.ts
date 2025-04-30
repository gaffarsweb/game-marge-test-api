export default {
  apps: [
    {
      name: 'gamerge-api',
      script: 'src/server.ts', // Ensure ts-node is installed to run TypeScript directly
      interpreter: 'ts-node',
      watch: false,
      autorestart: true,
      restart_delay: 1000,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
