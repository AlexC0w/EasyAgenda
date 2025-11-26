FROM node:20-alpine AS base
RUN apk -U add openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

CMD ["node", "src/index.js"]
