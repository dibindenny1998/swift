// PM2 process file for the VPS. `pm2 startOrReload deploy/ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: "swift",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
      max_memory_restart: "700M",
    },
  ],
};
