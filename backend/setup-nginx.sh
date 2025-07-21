#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 로그 출력
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 변수
NGINX_CONF_SOURCE="./nginx/factory.jongchoi.com.conf"
NGINX_CONF_TARGET="/etc/nginx/sites-available/factory.jongchoi.com"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/factory.jongchoi.com"
LOG_DIR="/var/log/nginx"

echo "🚀 Factory Backend Nginx 설정 시작..."

# 1. Nginx 설치 확인
log_info "Nginx 설치 상태 확인 중..."
if ! command -v nginx &> /dev/null; then
    log_error "Nginx가 설치되지 않았습니다. 설치를 진행합니다..."
    sudo apt update
    sudo apt install -y nginx
    log_success "Nginx 설치 완료"
else
    log_success "Nginx가 이미 설치되어 있습니다"
fi

# 2. 기존 Nginx 설정 완전 초기화
log_info "기존 Nginx 설정 완전 초기화 중..."
sudo rm -rf /etc/nginx/sites-enabled/*
sudo rm -rf /etc/nginx/sites-available/*
log_success "기존 설정 파일 완전 삭제 완료"

# 3. 로그 디렉토리 생성
log_info "로그 디렉토리 생성 중..."
sudo mkdir -p "$LOG_DIR"
sudo chown www-data:www-data "$LOG_DIR"
log_success "로그 디렉토리 생성 완료"

# 4. 새로운 설정 파일 복사
log_info "새로운 Nginx 설정 파일 복사 중..."
sudo cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
if [ $? -eq 0 ]; then
    log_success "새로운 설정 파일 복사 완료"
else
    log_error "설정 파일 복사 실패"
    exit 1
fi

# 5. 심볼릭 링크 생성
log_info "심볼릭 링크 생성 중..."
sudo ln -s "$NGINX_CONF_TARGET" "$NGINX_CONF_LINK"
log_success "심볼릭 링크 생성 완료"

# 6. Nginx 설정 테스트
log_info "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    log_success "Nginx 설정 테스트 통과"
else
    log_error "Nginx 설정 테스트 실패"
    exit 1
fi

# 7. Nginx 재시작
log_info "Nginx 재시작 중..."
if sudo systemctl reload nginx; then
    log_success "Nginx 재시작 완료"
else
    log_error "Nginx 재시작 실패"
    exit 1
fi

# 8. SSL 인증서 설치 (Let's Encrypt)
log_info "SSL 인증서 설치 중..."
if [ ! -d "/etc/letsencrypt/live/factory.jongchoi.com" ]; then
    # Certbot 설치
    if ! command -v certbot &> /dev/null; then
        log_info "Certbot 설치 중..."
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # SSL 인증서 발급
    log_info "Let's Encrypt SSL 인증서 발급 중..."
    sudo certbot --nginx -d factory.jongchoi.com --non-interactive --agree-tos --email admin@jongchoi.com
    if [ $? -eq 0 ]; then
        log_success "SSL 인증서 발급 완료"
    else
        log_warning "SSL 인증서 발급 실패. HTTP로 진행합니다"
    fi
else
    log_success "SSL 인증서가 이미 설치되어 있습니다"
fi

# 9. 방화벽 설정
log_info "방화벽 설정 중..."
sudo ufw allow 'Nginx Full'
sudo ufw reload
log_success "방화벽 설정 완료"

# 10. 최종 테스트
log_info "최종 연결 테스트 중..."
sleep 2

# HTTPS 테스트
if curl -s -k https://factory.jongchoi.com/health > /dev/null; then
    log_success "✅ Factory Backend API HTTPS 연결 성공!"
elif curl -s http://factory.jongchoi.com/health > /dev/null; then
    log_success "✅ Factory Backend API HTTP 연결 성공!"
else
    log_warning "⚠️  연결 테스트 실패. Docker 컨테이너가 실행 중인지 확인하세요"
fi

echo ""
log_success "🎉 Factory Backend Nginx 설정 완료!"
echo ""
echo "📊 서버 정보:"
echo "   - HTTPS URL: https://factory.jongchoi.com"
echo "   - HTTP URL: http://factory.jongchoi.com (HTTPS로 리다이렉트)"
echo "   - API 문서: https://factory.jongchoi.com/api-docs"
echo "   - 헬스 체크: https://factory.jongchoi.com/health"
echo ""
echo "🔧 유용한 명령어:"
echo "   - Nginx 상태: sudo systemctl status nginx"
echo "   - Nginx 로그: sudo tail -f /var/log/nginx/factory.jongchoi.com.access.log"
echo "   - Nginx 에러: sudo tail -f /var/log/nginx/factory.jongchoi.com.error.log"
echo "   - Nginx 재시작: sudo systemctl reload nginx"
echo "   - SSL 인증서 갱신: sudo certbot renew"
echo ""
echo "🔒 SSL 인증서 자동 갱신 설정:"
echo "   - sudo crontab -e"
echo "   - 0 12 * * * /usr/bin/certbot renew --quiet"
echo ""
echo "🚀 이제 https://factory.jongchoi.com으로 안전하게 API에 접근할 수 있습니다!"
