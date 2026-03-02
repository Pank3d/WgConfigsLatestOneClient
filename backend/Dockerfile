FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --only=production

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходники
COPY src ./src

EXPOSE 3001

# Применяем схему и запускаем сервер
CMD npx prisma db push --skip-generate && node src/index.js
