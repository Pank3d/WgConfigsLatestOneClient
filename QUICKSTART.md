# 🚀 Быстрый старт деплоя

## Шаг 1: Первоначальная настройка сервера (один раз)

```bash
# 1. Скопируйте файлы на сервер
scp setup-server.sh nginx.conf root@193.242.109.212:/root/

# 2. Подключитесь к серверу
ssh root@193.242.109.212

# 3. Запустите установку
chmod +x /root/setup-server.sh
/root/setup-server.sh
```

## Шаг 2: Настройте переменные окружения

```bash
# Backend .env
nano /root/WgConfigsLatestOneClient/backend/.env

# Frontend .env  
nano /root/WgConfigsLatestOneClient/frontend/.env
```

## Шаг 3: Деплой

### Вариант А: Автоматический (рекомендуется)

1. Настройте GitHub Actions (см. DEPLOYMENT.md)
2. Просто пушьте в master:
```bash
git push origin master
```

### Вариант Б: Ручной деплой

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🎯 Готово!

Откройте http://193.242.109.212 в браузере или в Telegram Mini App
