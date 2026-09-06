#!/bin/sh
set -e

mkdir -p /app/data

if [ ! -f /app/data/app.db ]; then
  echo "No database found at /app/data/app.db — installing the pre-seeded template..."
  cp /app/seed-template/app.db /app/data/app.db
else
  echo "Database already exists at /app/data/app.db — leaving it as is."
fi

exec "$@"
