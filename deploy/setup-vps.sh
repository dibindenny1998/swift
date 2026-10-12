#!/usr/bin/env bash
# One-time setup of a fresh Hostinger VPS (Ubuntu 22.04/24.04) for swift.in.
# Installs Node 22, PostgreSQL, nginx, PM2 and HTTPS, then builds and starts the app.
#
# Usage (as root on the VPS):
#   DOMAIN=srv123456.hstgr.cloud EMAIL=you@example.com \
#   REPO_URL=git@github.com:dibindenny1998/swift.git BRANCH=claude/new-session-1jdylh \
#   ADMIN_EMAIL=admin@swift.in ADMIN_PASSWORD='choose-a-strong-one' \
#   bash setup-vps.sh
#
# DOMAIN can be Hostinger's temporary hostname now and swift.in later (re-run the nginx/certbot part).
set -euo pipefail

: "${DOMAIN:?set DOMAIN}" "${EMAIL:?set EMAIL for the HTTPS certificate}" "${REPO_URL:?set REPO_URL}"
: "${ADMIN_EMAIL:?set ADMIN_EMAIL}" "${ADMIN_PASSWORD:?set ADMIN_PASSWORD}"
BRANCH="${BRANCH:-main}"
APP_USER=swift
APP_DIR=/var/www/swift
PORT=3000

echo "==> System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx postgresql ufw certbot python3-certbot-nginx openssl

if ! command -v node >/dev/null || [[ "$(node -v)" != v22* ]]; then
  echo "==> Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2

echo "==> App user"
id "$APP_USER" >/dev/null 2>&1 || adduser --system --group --home "/home/$APP_USER" --shell /bin/bash "$APP_USER"

echo "==> PostgreSQL"
DB_PASS_FILE="/home/$APP_USER/.db_password"
if [[ ! -f "$DB_PASS_FILE" ]]; then
  openssl rand -hex 24 > "$DB_PASS_FILE"
  chown "$APP_USER:$APP_USER" "$DB_PASS_FILE"
  chmod 600 "$DB_PASS_FILE"
fi
DB_PASS="$(cat "$DB_PASS_FILE")"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='swift'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER swift WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='swift'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE swift OWNER swift;"

echo "==> Deploy key for GitHub"
KEY="/home/$APP_USER/.ssh/id_ed25519"
if [[ ! -f "$KEY" ]]; then
  sudo -u "$APP_USER" mkdir -p "/home/$APP_USER/.ssh"
  sudo -u "$APP_USER" ssh-keygen -t ed25519 -N "" -C "swift-vps-deploy" -f "$KEY" >/dev/null
  sudo -u "$APP_USER" bash -c "ssh-keyscan github.com >> /home/$APP_USER/.ssh/known_hosts 2>/dev/null"
fi

echo "==> Code"
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
if [[ ! -d "$APP_DIR/.git" ]]; then
  if ! sudo -u "$APP_USER" git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"; then
    echo
    echo "Clone failed. If the repo is private, add this key in GitHub → repo Settings → Deploy keys (read-only):"
    cat "$KEY.pub"
    echo "Then re-run this script."
    exit 1
  fi
fi

echo "==> Environment (.env)"
ENV_FILE="$APP_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  sudo -u "$APP_USER" tee "$ENV_FILE" >/dev/null <<ENV
DATABASE_URL=postgresql://swift:$DB_PASS@localhost:5432/swift
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_SEED_EMAIL=$ADMIN_EMAIL
ADMIN_SEED_PASSWORD=$ADMIN_PASSWORD
# Leave false on the temporary domain so search engines don't index it.
ALLOW_INDEXING=false
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
# Staging only: show login codes on screen when MSG91 isn't set up. Never enable with real customers.
OTP_DEV_ECHO=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
EMAIL_FROM="swift.in <orders@swift.in>"
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_ID=
ENV
  chmod 600 "$ENV_FILE"
fi

echo "==> Build, migrate, seed, start"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && npm ci && npx prisma migrate deploy && npx prisma db seed && npm run build"
sudo -u "$APP_USER" bash -c "cd $APP_DIR && pm2 startOrReload deploy/ecosystem.config.cjs && pm2 save"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" >/dev/null

echo "==> nginx"
cat > /etc/nginx/sites-available/swift <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
ln -sf /etc/nginx/sites-available/swift /etc/nginx/sites-enabled/swift
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> HTTPS"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
  echo "certbot failed — check that $DOMAIN points at this server, then run: certbot --nginx -d $DOMAIN"

echo
echo "Done: https://$DOMAIN  (admin: $ADMIN_EMAIL)"
