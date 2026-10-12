#!/usr/bin/env bash
# Nightly backup of the database and uploaded images. Keeps 14 days.
# Installed as a cron job by setup-vps.sh; run manually any time: sudo -u swift bash deploy/backup.sh
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/swift}"
DEST="${BACKUP_DIR:-/home/swift/backups}"
STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$DEST"

set -a
# shellcheck disable=SC1091
. "$APP_DIR/.env"
set +a
pg_dump --no-owner --format=custom "$DATABASE_URL" > "$DEST/db_$STAMP.dump"
if [[ -d "$APP_DIR/storage/uploads" ]]; then
  tar -czf "$DEST/uploads_$STAMP.tar.gz" -C "$APP_DIR/storage" uploads
fi
find "$DEST" -type f -mtime +14 -delete
echo "Backup written to $DEST ($STAMP)"
