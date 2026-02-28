# WireGuard VPN Telegram Mini App

Современное Telegram Mini App для управления WireGuard VPN конфигурациями.

## 🚀 Технологии

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- Telegram Bot API (Telegraf)
- Валидация через Telegram WebApp initData

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- Zustand (UI state)
- TanStack Query (server state)
- Telegram WebApp SDK

## 📋 Требования

- Docker & Docker Compose
- Node.js 20+ (для локальной разработки)
- Telegram Bot Token

## 🛠 Настройка

### 1. Клонирование и установка

```bash
git clone <repo-url>
cd WgManyConfigsLatestOneClient
```

### 2. Настройка переменных окружения

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Отредактируйте `backend/.env`:
```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wireguard_vpn

# Telegram Bot
BOT_TOKEN=your_bot_token_here
CHANNEL_ID=@wireguardvpntop

# WireGuard API
WIREGUARD_API_URL=http://wireguard-api:500

# Webhook
WEBHOOK_URL=https://yourdomain.com
WEBHOOK_SECRET=random_secret_token_here

# Limits
MAX_CONFIGS_PER_USER=3
```

#### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env
```

Отредактируйте `frontend/.env`:
```env
VITE_API_URL=/api
```

### 3. Запуск через Docker

```bash
# В корне проекта
docker-compose up --build
```

Сервисы будут доступны:
- Frontend: http://localhost:80
- Backend API: http://localhost:3001
- WireGuard API: http://localhost:500
- PostgreSQL: localhost:5432

### 4. Локальная разработка (без Docker)

#### Backend
```bash
cd backend

# Установить зависимости
npm install

# Запустить PostgreSQL (через Docker или локально)
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wireguard_vpn -p 5432:5432 -d postgres:16-alpine

# Применить миграции
npx prisma migrate dev

# Запустить сервер
npm run dev
```

#### Frontend
```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev server
npm run dev
```

## 📦 База данных

### Применение миграций

```bash
cd backend
npx prisma migrate deploy
```

### Создание новой миграции

```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Prisma Studio (GUI для БД)

```bash
cd backend
npx prisma studio
```

## 🔧 Настройка Telegram Mini App

### 1. Создание бота в BotFather

```
/newbot
# Следуйте инструкциям
# Сохраните BOT_TOKEN
```

### 2. Создание Mini App

```
/newapp
# Выберите бота
# Загрузите иконку (640x360)
# Укажите URL: https://yourdomain.com
```

### 3. Настройка webhook

После деплоя на production сервер:

```bash
curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
  -d "url=https://yourdomain.com/api/webhook/chat-member" \
  -d "allowed_updates=[\"chat_member\"]"
```

### 4. Добавление бота в канал

1. Добавьте бота в канал @wireguardvpntop
2. Дайте права администратора
3. В BotFather: `/mybots` → Bot Settings → Group Privacy → **DISABLE**

## 🐳 Docker команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Пересборка
docker-compose up --build

# Логи
docker-compose logs -f backend
docker-compose logs -f frontend

# Перезапуск одного сервиса
docker-compose restart backend
```

## 📊 Структура БД

### Users
- id (PK)
- telegramId (unique)
- username
- firstName
- lastName
- createdAt
- updatedAt

### Configs
- id (PK)
- name
- wireguardId (ID в WireGuard API)
- configData (конфигурация)
- enabled
- userId (FK)
- createdAt
- updatedAt

## 🔒 Безопасность

- Валидация Telegram initData через HMAC-SHA256
- Rate limiting на API endpoints
- CORS настроен для Telegram домена
- Webhook защищен secret token
- SQL injection защита через Prisma ORM

## 📝 API Endpoints

### Auth
- `POST /api/auth/verify` - Верификация Telegram initData

### User
- `GET /api/user/info` - Информация о пользователе
- `GET /api/user/subscription-status` - Статус подписки на канал

### Configs
- `GET /api/configs` - Список конфигов
- `POST /api/configs` - Создать конфиг
- `GET /api/configs/:id/download` - Скачать конфиг
- `DELETE /api/configs/:id` - Удалить конфиг
- `POST /api/configs/:id/disable` - Деактивировать конфиг

### Webhook
- `POST /api/webhook/chat-member` - Webhook для отписок

## 🚀 Production деплой

### 1. Настройка сервера

```bash
# Установить Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Клонировать репозиторий
git clone <repo-url>
cd WgManyConfigsLatestOneClient
```

### 2. Настройка SSL (Let's Encrypt)

```bash
# Установить certbot
sudo apt install certbot

# Получить сертификат
sudo certbot certonly --standalone -d yourdomain.com
```

### 3. Настройка nginx reverse proxy

Создайте `/etc/nginx/sites-available/wireguard-vpn`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Запуск

```bash
docker-compose up -d
```

## 📱 Тестирование

1. Откройте Mini App через Telegram
2. Создайте конфиг
3. Скачайте .conf файл
4. Импортируйте в WireGuard приложение
5. Подключитесь к VPN

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверить логи
docker-compose logs backend

# Проверить подключение к БД
docker-compose exec postgres psql -U postgres -d wireguard_vpn
```

### Frontend показывает ошибки API

```bash
# Проверить переменные окружения
docker-compose exec frontend env

# Проверить nginx конфиг
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Webhook не работает

1. Проверьте что бот - администратор канала
2. Проверьте `allowed_updates` в webhook
3. Проверьте логи backend

---

## 🗄️ Развертывание БД на удаленном сервере

Если вы хотите развернуть только PostgreSQL на сервере (193.242.109.212), а фронтенд и бэкенд запускать локально:

### 1. Подключитесь к серверу

```bash
ssh user@193.242.109.212
```

### 2. Создайте директорию для БД

```bash
mkdir -p ~/wireguard-db
cd ~/wireguard-db
```

### 3. Создайте docker-compose.yml на сервере

```bash
nano docker-compose.yml
```

Вставьте:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: wireguard-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-strongpassword123}
      POSTGRES_DB: wireguard_vpn
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - vpn-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

networks:
  vpn-network:
    driver: bridge

volumes:
  postgres_data:
```

### 4. Создайте .env файл

```bash
nano .env
```

Добавьте:

```env
POSTGRES_PASSWORD=your_strong_password_here
```

### 5. Запустите БД

```bash
docker-compose up -d
```

### 6. Настройте firewall (опционально)

**ВАЖНО:** Открывайте порт 5432 только если нужен внешний доступ!

```bash
# Ubuntu/Debian с ufw
sudo ufw allow 5432/tcp

# CentOS/RHEL с firewalld
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### 7. Выполните миграции БД

На локальном компьютере:

```bash
cd backend

# Windows
set DATABASE_URL=postgresql://postgres:your_password@193.242.109.212:5432/wireguard_vpn

# Linux/Mac
export DATABASE_URL=postgresql://postgres:your_password@193.242.109.212:5432/wireguard_vpn

# Выполните миграции
npm run migrate:deploy
```

### 8. Локальная разработка с удаленной БД

Обновите `backend/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@193.242.109.212:5432/wireguard_vpn
WIREGUARD_API_URL=http://193.242.109.212:500
BOT_TOKEN=your_bot_token_here
CHANNEL_ID=@wireguardvpntop
```

Запустите бэкенд:

```bash
cd backend
npm install
npm run dev
```

Запустите фронтенд:

```bash
cd frontend
npm install
npm run dev
```

### 9. Тестирование через ngrok

```bash
# Установка ngrok
npm install -g ngrok

# Запуск туннеля для фронтенда
ngrok http 5173
```

Используйте полученный URL в настройках Telegram Bot Mini App.

---

## 📄 Лицензия

MIT

## 👤 Автор

Created with Claude Code
