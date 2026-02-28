FROM node:20-alpine

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

# Запускаем миграции и затем сервер
CMD npx prisma migrate deploy && node src/index.js
