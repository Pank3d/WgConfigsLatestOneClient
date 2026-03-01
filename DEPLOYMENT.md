# 🚀 Инструкция по деплою WireGuard VPN

## 📋 Предварительные требования

- Сервер на Ubuntu 20.04+ (у вас: 193.242.109.212)
- SSH доступ к серверу
- Доменное имя (опционально)
- GitHub репозиторий

## 🔧 Первоначальная настройка сервера

### 1. Подключитесь к серверу

```bash
ssh root@193.242.109.212
```

### 2. Скопируйте файлы на сервер

Скопируйте `setup-server.sh` и `nginx.conf` на сервер:

```bash
# На вашем локальном компьютере
scp setup-server.sh nginx.conf root@193.242.109.212:/root/
```

### 3. Запустите скрипт настройки

```bash
# На сервере
cd /root
chmod +x setup-server.sh
./setup-server.sh
```

### 4. Настройте переменные окружения

#### Backend (.env)

```bash
nano /root/WgConfigsLatestOneClient/backend/.env
```

Содержимое:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:strongpassword123@193.242.109.212:5432/wireguard_vpn
WIREGUARD_API_URL=http://193.242.109.212:500
BOT_TOKEN=7479128637:AAEMa8lwwSDQkWsTNpSZ3iXns0ZfT-pi3vM
CHANNEL_ID=@wireguardvpntop
```

#### Frontend (.env)

```bash
nano /root/WgConfigsLatestOneClient/frontend/.env
```

Содержимое:
```env
VITE_API_URL=http://193.242.109.212/api
```

### 5. Пересоберите и перезапустите

```bash
# Backend
cd /root/WgConfigsLatestOneClient/backend
pm2 restart wireguard-backend

# Frontend
cd /root/WgConfigsLatestOneClient/frontend
npm run build
cp -r dist/* /var/www/wireguard-vpn/
```

## 🔄 Настройка CI/CD (GitHub Actions)

### 1. Добавьте Secrets в GitHub

Перейдите в Settings → Secrets and variables → Actions и добавьте:

- `SERVER_HOST`: `193.242.109.212`
- `SERVER_USER`: `root`
- `SSH_PRIVATE_KEY`: Ваш приватный SSH ключ
- `VITE_API_URL`: `http://193.242.109.212/api`

### 2. Генерация SSH ключа (если нет)

На вашем компьютере:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
```

Добавьте публичный ключ на сервер:

```bash
cat ~/.ssh/id_rsa.pub | ssh root@193.242.109.212 "cat >> ~/.ssh/authorized_keys"
```

Скопируйте приватный ключ:

```bash
cat ~/.ssh/id_rsa
```

И добавьте его в GitHub Secrets как `SSH_PRIVATE_KEY`.

### 3. Push в репозиторий

После push в ветку `master`, автоматически запустится деплой:

```bash
git add .
git commit -m "Deploy to production"
git push origin master
```

## 📱 Настройка Telegram Mini App

1. Откройте BotFather в Telegram
2. Выберите вашего бота: `/mybots` → выберите бота
3. Настройте Mini App:
   - `Bot Settings` → `Menu Button` → `Edit Menu Button`
   - URL: `http://193.242.109.212`
   - Text: `Открыть приложение`

4. Или используйте команду:
```
/setmenubutton
@Udjdbdbdnxn_bot
http://193.242.109.212
Открыть приложение
```

## 🔍 Проверка и мониторинг

### Статус сервисов

```bash
# Backend
pm2 status
pm2 logs wireguard-backend

# Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log

# База данных
docker ps
docker logs wireguard-db
```

### Перезапуск сервисов

```bash
# Backend
pm2 restart wireguard-backend

# Nginx
systemctl reload nginx

# База данных
cd /root/WgConfigsLatestOneClient
docker-compose -f docker-compose.server.yml restart
```

## 🐛 Troubleshooting

### Backend не запускается

```bash
cd /root/WgConfigsLatestOneClient/backend
pm2 logs wireguard-backend --lines 100
```

### Frontend показывает ошибки API

1. Проверьте, что backend запущен: `pm2 status`
2. Проверьте Nginx конфиг: `nginx -t`
3. Проверьте переменную `VITE_API_URL` в frontend

### База данных не подключается

```bash
# Проверьте, что PostgreSQL запущен
docker ps | grep postgres

# Проверьте логи
docker logs wireguard-db

# Подключитесь к БД
docker exec -it wireguard-db psql -U postgres -d wireguard_vpn
```

## 📊 Полезные команды

```bash
# Просмотр логов в реальном времени
pm2 logs wireguard-backend --lines 100

# Перезапуск всех сервисов
pm2 restart all

# Обновление кода из Git
cd /root/WgConfigsLatestOneClient
git pull
cd backend && npm install && pm2 restart wireguard-backend
cd ../frontend && npm install && npm run build && cp -r dist/* /var/www/wireguard-vpn/

# Очистка кэша
pm2 flush
```

## 🔐 SSL (опционально)

Для установки SSL сертификата:

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d yourdomain.com

# Автоматическое обновление
certbot renew --dry-run
```

## 📝 Структура деплоя

```
/root/WgConfigsLatestOneClient/  # Исходный код
├── backend/                      # Backend приложение
├── frontend/                     # Frontend исходники
└── docker-compose.server.yml    # База данных

/var/www/wireguard-vpn/          # Собранный frontend (Nginx)

Nginx: порт 80
Backend: порт 3001
Database: порт 5432
WireGuard API: порт 500
```
