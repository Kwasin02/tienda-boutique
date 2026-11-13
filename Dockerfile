# Imagen de producción. Sirve para Railway, Render, Fly.io o cualquier VPS con Docker.
# Los datos (base SQLite y fotos) viven en /data, que debe ser un volumen persistente.

FROM node:24-bookworm-slim

# Herramientas para compilar better-sqlite3 si no hay binario precompilado.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY database/schema.prisma database/schema.prisma
# prisma generate (postinstall) necesita una URL aunque no se conecte.
RUN DATABASE_URL="file:/tmp/build.db" npm ci --no-audit --no-fund

COPY . .

ENV NODE_ENV=production \
    DATABASE_URL="file:/data/tienda.db" \
    UPLOAD_DIR="/data/uploads" \
    BACKUP_DIR="/data/backups" \
    PORT=3000

VOLUME ["/data"]
EXPOSE 3000

CMD ["sh", "scripts/start.sh"]
