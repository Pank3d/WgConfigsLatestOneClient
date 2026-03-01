#!/bin/bash

# Скрипт для ручного деплоя на сервер

set -e

SERVER="root@193.242.109.212"
REMOTE_DIR="/root/WgConfigsLatestOneClient"

echo "🚀 Начинаем деплой на сервер..."

# Деплой Backend
echo "📦 Деплой Backend..."
ssh $SERVER << 'ENDSSH'
cd /root/WgConfigsLatestOneClient
git pull origin master
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart wireguard-backend || pm2 start npm --name "wireguard-backend" -- start
pm2 save
echo "✅ Backend задеплоен"
ENDSSH

# Деплой Frontend
echo "📦 Деплой Frontend..."
ssh $SERVER << 'ENDSSH'
cd /root/WgConfigsLatestOneClient/frontend
npm install
npm run build
rm -rf /var/www/wireguard-vpn/*
cp -r dist/* /var/www/wireguard-vpn/
systemctl reload nginx
echo "✅ Frontend задеплоен"
ENDSSH

echo ""
echo "✅ Деплой завершён успешно!"
echo ""
echo "🔍 Проверка статуса:"
ssh $SERVER << 'ENDSSH'
pm2 status
systemctl status nginx --no-pager
ENDSSH
