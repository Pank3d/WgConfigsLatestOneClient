#!/bin/bash

# Скрипт первоначальной настройки сервера для деплоя WireGuard VPN

set -e

echo "🚀 Начинаем настройку сервера..."

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# Установка Node.js 18
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# Установка Nginx
echo "📦 Установка Nginx..."
apt install -y nginx

# Создание директории для frontend
echo "📁 Создание директорий..."
mkdir -p /var/www/wireguard-vpn
mkdir -p /root/WgConfigsLatestOneClient

# Копирование Nginx конфигурации
echo "⚙️ Настройка Nginx..."
cp nginx.conf /etc/nginx/sites-available/wireguard-vpn
ln -sf /etc/nginx/sites-available/wireguard-vpn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

# Клонирование репозитория
echo "📥 Клонирование репозитория..."
cd /root
if [ -d "WgConfigsLatestOneClient" ]; then
    cd WgConfigsLatestOneClient
    git pull
else
    git clone <YOUR_REPO_URL> WgConfigsLatestOneClient
    cd WgConfigsLatestOneClient
fi

# Установка зависимостей Backend
echo "📦 Установка зависимостей Backend..."
cd backend
npm install

# Создание .env файла
echo "⚙️ Создание .env файла..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:strongpassword123@localhost:5432/wireguard_vpn
WIREGUARD_API_URL=http://localhost:500
BOT_TOKEN=YOUR_BOT_TOKEN
CHANNEL_ID=@wireguardvpntop
EOF

echo "⚠️  ВАЖНО: Отредактируйте /root/WgConfigsLatestOneClient/backend/.env и добавьте правильные значения!"

# Генерация Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate
npx prisma db push

# Сборка backend
echo "🔨 Сборка backend..."
npm run build

# Запуск backend через PM2
echo "🚀 Запуск backend..."
pm2 start npm --name "wireguard-backend" -- start
pm2 save
pm2 startup

# Установка зависимостей Frontend
echo "📦 Установка зависимостей Frontend..."
cd ../frontend
npm install

# Создание .env для frontend
cat > .env << EOF
VITE_API_URL=http://YOUR_DOMAIN/api
EOF

echo "⚠️  ВАЖНО: Отредактируйте /root/WgConfigsLatestOneClient/frontend/.env и добавьте правильный домен!"

# Сборка frontend
echo "🔨 Сборка frontend..."
npm run build

# Копирование frontend в Nginx директорию
echo "📋 Копирование frontend..."
cp -r dist/* /var/www/wireguard-vpn/

echo "✅ Настройка сервера завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Отредактируйте /root/WgConfigsLatestOneClient/backend/.env"
echo "2. Отредактируйте /root/WgConfigsLatestOneClient/frontend/.env"
echo "3. Пересоберите frontend: cd /root/WgConfigsLatestOneClient/frontend && npm run build && cp -r dist/* /var/www/wireguard-vpn/"
echo "4. Перезапустите backend: pm2 restart wireguard-backend"
echo ""
echo "🔍 Проверка статуса:"
echo "- Backend: pm2 status"
echo "- Nginx: systemctl status nginx"
echo "- Логи Backend: pm2 logs wireguard-backend"
echo "- Логи Nginx: tail -f /var/log/nginx/error.log"
