# ==========================
# Stage 1 - Installazione e Build
# ==========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia solo i file necessari alle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il resto del progetto
COPY . .

# Build dell'applicazione Next.js (necessario per custom server)
RUN npm run build

# ==========================
# Stage 2 - Runtime
# ==========================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Installa wget per il healthcheck
RUN apk add --no-cache wget

# Crea un utente non privilegiato
RUN addgroup -S app && adduser -S app -G app

# Copia solo ciò che serve per la produzione dallo stage di build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/server.js ./
COPY --from=builder /app/next.config.js ./

# Installa solo le dipendenze di produzione (se necessario)
RUN npm prune --omit=dev

# Passa all'utente non privilegiato
USER app

# Esposta la porta su cui l'applicazione ascolta (definita in server.js)
EXPOSE 3000

# Healthcheck per verificare che l'applicazione sia responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget --spider http://localhost:${PORT:-3000} || exit 1

# Avvia il server in produzione
CMD ["npm", "start"]