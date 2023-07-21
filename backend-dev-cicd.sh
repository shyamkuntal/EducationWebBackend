git clone https://$GITLAB_USERNAME:$GITLAB_PASSWORD@git.turnkey.work/eduplanet/eduplanetbackend.git -b dev

rm -rf /home/ubuntu/development/eduplanetbackend/*
cp -a /home/ubuntu/eduplanetbackend/. /home/ubuntu/development/eduplanetbackend

cd /home/ubuntu/development/eduplanetbackend

npm i --force

pm2 restart 0

rm -rf /home/ubuntu/eduplanetbackend
