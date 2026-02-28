FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Билдим приложение
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем билд
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
