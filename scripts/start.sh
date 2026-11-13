#!/bin/sh
# Arranque en producción (Docker / Railway / VPS).
#
# El build se hace AQUÍ, con la base de datos real ya disponible, y no al construir la imagen:
# Next.js prerenderiza el catálogo durante el build, y hacerlo sin la base real dejaría la tienda
# mostrando datos viejos o vacíos hasta que caduque la caché.
set -e

: "${DATABASE_URL:?Falta DATABASE_URL}"
: "${SESSION_SECRET:?Falta SESSION_SECRET (genera uno con: openssl rand -base64 48)}"
: "${STORE_URL:?Falta STORE_URL (la URL pública, p. ej. https://mitienda.com)}"

mkdir -p "${UPLOAD_DIR:-storage/uploads}"

echo "→ Aplicando migraciones"
npx prisma migrate deploy

echo "→ Datos base (solo si la base está vacía; sin productos DEMO)"
SEED_DEMO=0 npx tsx database/seed.ts

echo "→ Compilando"
npx next build

echo "→ Iniciando en el puerto ${PORT:-3000}"
exec npx next start -p "${PORT:-3000}"
