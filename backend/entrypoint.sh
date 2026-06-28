#!/bin/sh
set -e

# Minimal startup script that waits for Postgres, runs Alembic migrations,
# and starts Uvicorn. We rely on Python + psycopg being available in the
# image (they are installed via requirements.txt).

echo "Starting entrypoint..."
echo "DATABASE_HOST=${DATABASE_HOST:-postgres}"

echo "Waiting for Postgres to accept connections..."

# Use a small Python snippet to attempt connections using psycopg
python - <<'PY'
import os, sys, time
import psycopg

host = os.environ.get('DATABASE_HOST', 'postgres')
port = int(os.environ.get('POSTGRES_PORT', os.environ.get('DB_PORT', 5432)))
user = os.environ.get('POSTGRES_USER', os.environ.get('DB_USER', 'postgres'))
password = os.environ.get('POSTGRES_PASSWORD', os.environ.get('DB_PASS', ''))
dbname = os.environ.get('POSTGRES_DB', os.environ.get('DB_NAME', 'recruiter_ai'))

dsn = f"host={host} port={port} user={user} password={password} dbname={dbname}"

for i in range(60):
    try:
        conn = psycopg.connect(dsn, connect_timeout=3)
        conn.close()
        print('Postgres is available')
        sys.exit(0)
    except Exception as exc:
        print(f'Postgres not ready ({exc}), retrying...', flush=True)
        time.sleep(1)

print('Timed out waiting for Postgres', flush=True)
sys.exit(1)
PY

echo "Running Alembic migrations (alembic upgrade head)"
if ! alembic upgrade head; then
  echo "Alembic migrations failed. Exiting." >&2
  exit 1
fi

echo "Starting Uvicorn"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
