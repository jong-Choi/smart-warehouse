#!/bin/bash

# 변수
NGINX_CONF_SOURCE="./nginx/factory.jongchoi.com.conf"
NGINX_CONF_TARGET="/etc/nginx/sites-available/factory.jongchoi.com"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/factory.jongchoi.com"

echo "Nginx 설정 복사 시작..."

# 1. 대상 위치로 복사
sudo cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"

# 2. 심볼릭 링크 (이미 있으면 생략)
if [ ! -L "$NGINX_CONF_LINK" ]; then
  sudo ln -s "$NGINX_CONF_TARGET" "$NGINX_CONF_LINK"
  echo "심볼릭 링크 생성 완료."
else
  echo "심볼릭 링크 이미 존재. 건너뜀."
fi

# 3. nginx 설정 테스트
echo "nginx 설정 테스트..."
sudo nginx -t

# 4. nginx 재시작
if [ $? -eq 0 ]; then
  echo "nginx 설정 적용 중..."
  sudo systemctl reload nginx
  echo "적용 완료. http://factory.jongchoi.com 에서 확인하세요."
else
  echo "설정 오류. nginx 적용 실패"
  exit 1
fi
