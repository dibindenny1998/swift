#!/usr/bin/env bash
# Pull the latest code and restart without downtime. Run on the VPS as the app user
# (GitHub Actions calls this over SSH on every push).
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/swift}"
BRANCH="${BRANCH:-$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)}"

cd "$APP_DIR"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
npm ci
npx prisma migrate deploy
npm run build
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save
echo "Deployed $(git rev-parse --short HEAD)"
