# ✅ Versión compatible con Prisma (usa Alpine 3.17 + OpenSSL 1.1)
FROM node:18-alpine3.17 AS base

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache openssl1.1-compat bash

# Copiar archivos de configuración
COPY package.json package-lock.json* ./
RUN npm install

# Copiar esquema Prisma y generar cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Puerto y comando de inicio
EXPOSE 4000
CMD ["node", "src/index.js"]
