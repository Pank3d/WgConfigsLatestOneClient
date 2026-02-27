нужно заполнить два .env 

для сервера 

PASSWORD_HASH=хэш пароля если надо, но не будет работать генерация в  боте 
PORT=500
WEBUI_HOST=0.0.0.0
WG_HOST=ваш сервак в формате 193.242.107.211
WG_PORT=800
WG_CONFIG_PORT=800
WG_DEVICE=eth0
WG_PATH=/etc/wireguard/
WG_DEFAULT_ADDRESS=10.8.x.y
WG_DEFAULT_DNS=1.1.1.1
WG_ALLOWED_IPS=0.0.0.0/0, ::/0
WG_PERSISTENT_KEEPALIVE=0
LANG=en
UI_TRAFFIC_STATS=false
UI_CHART_TYPE=0



второе для бота 

BOT_TOKEN=токен бота
BASE_URL = 'http://193.242.107.211:500' - пример

установить докер и докер композ 

установить nvm 

после чего nvm i 22 минимум - установка node


заходим в папку с ботом и делаем npm i установка зависимостей

потом docker-compose up --build -d 

на http://193.242.107.211:500 должна появиться вебка