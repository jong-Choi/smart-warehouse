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

echo "🚀 Warehouse Frontend 안전 배포 시작 (완벽한 설정)..."

# 변수 정의
NGINX_CONF_SOURCE="./nginx/warehouse.jongchoi.com.conf"
NGINX_CONF_TARGET="/etc/nginx/sites-available/warehouse.jongchoi.com"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/warehouse.jongchoi.com"
LOG_DIR="/var/log/nginx"
DIST_DIR="./dist"

# 1. dist 폴더 확인
log_info "dist 폴더 확인 중..."
if [ ! -d "$DIST_DIR" ]; then
    log_error "dist 폴더가 없습니다. 로컬에서 npm run build를 먼저 실행해주세요."
    exit 1
else
    log_success "dist 폴더 확인 완료"
fi

# 2. 환경변수 파일 확인
log_info "환경변수 파일 확인 중..."
if [ ! -f ".env.local" ]; then
    log_error ".env.local 파일이 없습니다. 배포를 중단합니다."
    echo "필요한 환경변수:"
    echo "VITE_API_BASE_URL=https://factory.jongchoi.com"
    exit 1
else
    log_success ".env.local 파일 확인 완료"
fi

# 3. 기존 설정 확인 및 백업
log_info "기존 Nginx 설정 확인 중..."
if [ -f "$NGINX_CONF_TARGET" ]; then
    log_warning "기존 warehouse.jongchoi.com.conf 파일이 발견되었습니다"
    BACKUP_FILE="${NGINX_CONF_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$NGINX_CONF_TARGET" "$BACKUP_FILE"
    log_success "기존 설정 백업 완료: $BACKUP_FILE"
else
    log_info "기존 warehouse.jongchoi.com.conf 파일이 없습니다 (새로 생성)"
fi

# 4. 기존 Docker 컨테이너 상태 확인
log_info "기존 Docker 컨테이너 상태 확인 중..."
if docker ps | grep -q "warehouse-frontend"; then
    log_warning "기존 warehouse-frontend 컨테이너가 실행 중입니다"
    read -p "기존 컨테이너를 중지하고 새로 시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "기존 컨테이너 중지 중..."
        docker compose down warehouse-frontend
        log_success "기존 컨테이너 중지 완료"
    else
        log_info "기존 컨테이너를 유지합니다"
    fi
else
    log_info "기존 warehouse-frontend 컨테이너가 없습니다"
fi

# 5. 로그 디렉토리 생성
log_info "로그 디렉토리 확인 중..."
if [ ! -d "$LOG_DIR" ]; then
    log_info "로그 디렉토리 생성 중..."
    sudo mkdir -p "$LOG_DIR"
    sudo chown www-data:www-data "$LOG_DIR"
    log_success "로그 디렉토리 생성 완료"
else
    log_success "로그 디렉토리가 이미 존재합니다"
fi

# 6. Nginx 설정 파일 복사
log_info "Nginx 설정 파일 복사 중..."
if [ -f "$NGINX_CONF_SOURCE" ]; then
    sudo cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
    if [ $? -eq 0 ]; then
        log_success "Nginx 설정 파일 복사 완료"
    else
        log_error "Nginx 설정 파일 복사 실패"
        exit 1
    fi
else
    log_error "소스 Nginx 설정 파일을 찾을 수 없습니다: $NGINX_CONF_SOURCE"
    exit 1
fi

# 7. 심볼릭 링크 생성/갱신
log_info "Nginx 심볼릭 링크 생성/갱신 중..."
if [ -L "$NGINX_CONF_LINK" ]; then
    log_info "기존 심볼릭 링크를 갱신합니다"
    sudo rm "$NGINX_CONF_LINK"
fi
sudo ln -s "$NGINX_CONF_TARGET" "$NGINX_CONF_LINK"
log_success "심볼릭 링크 생성 완료"

# 8. Docker 이미지 빌드
log_info "Docker 이미지 빌드 중..."
if docker compose build warehouse-frontend; then
    log_success "Docker 이미지 빌드 완료"
else
    log_error "Docker 이미지 빌드 실패"
    exit 1
fi

# 9. Docker 컨테이너 시작
log_info "Docker 컨테이너 시작 중..."
if docker compose up -d warehouse-frontend; then
    log_success "Docker 컨테이너 시작 완료"
else
    log_error "Docker 컨테이너 시작 실패"
    exit 1
fi

# 10. 컨테이너 상태 확인
log_info "컨테이너 상태 확인 중..."
sleep 3
if docker ps | grep -q "warehouse-frontend.*Up"; then
    log_success "warehouse-frontend 컨테이너가 정상 실행 중입니다"
else
    log_error "warehouse-frontend 컨테이너 실행 실패"
    docker compose logs warehouse-frontend
    exit 1
fi

# 11. Nginx 설정 테스트 (도커 컨테이너가 실행된 후)
log_info "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    log_success "Nginx 설정 테스트 통과"
else
    log_error "Nginx 설정 테스트 실패"
    log_info "백업 파일에서 복원하려면: sudo cp $BACKUP_FILE $NGINX_CONF_TARGET"
    exit 1
fi

# 12. 도커 컨테이너 헬스 체크
log_info "도커 컨테이너 헬스 체크 중..."
sleep 2
if curl -s http://localhost:3050/health; then
    log_success "도커 컨테이너가 정상 작동 중입니다 (포트 3050)"
else
    log_warning "도커 컨테이너 응답 없음 (컨테이너가 아직 시작 중일 수 있습니다)"
fi

# 13. Nginx 재시작
log_info "Nginx 설정 적용 중..."
if sudo systemctl reload nginx; then
    log_success "Nginx 설정 적용 완료"
else
    log_error "Nginx 설정 적용 실패"
    exit 1
fi

# 14. 최종 연결 테스트
log_info "최종 연결 테스트 중..."
sleep 2

# HTTPS 테스트 (SSL 인증서가 있다면)
if curl -s -k https://warehouse.jongchoi.com/health; then
    log_success "✅ Warehouse Frontend HTTPS 연결 성공!"
elif curl -s http://warehouse.jongchoi.com/health; then
    log_success "✅ Warehouse Frontend HTTP 연결 성공!"
else
    log_warning "⚠️  도메인 연결 테스트 실패 (로컬 테스트 시도)"
    if curl -s http://localhost:3050/health; then
        log_success "✅ 로컬 도커 컨테이너 연결 성공 (포트 3050)"
    else
        log_error "❌ 로컬 도커 컨테이너 연결도 실패"
    fi
fi

echo ""
log_success "🎉 Warehouse Frontend 안전 배포 완료!"
echo ""
echo "📊 서버 정보:"
echo "   - 도메인: warehouse.jongchoi.com"
echo "   - 도커 포트: 3050 (내부 80)"
echo "   - Nginx 포트: 80/443"
echo "   - 헬스 체크: https://warehouse.jongchoi.com/health"
echo "   - API 프록시: https://warehouse.jongchoi.com/api/ -> https://factory.jongchoi.com"
echo ""
echo "🔧 유용한 명령어:"
echo "   - 컨테이너 로그: docker compose logs -f warehouse-frontend"
echo "   - 컨테이너 중지: docker compose down warehouse-frontend"
echo "   - 컨테이너 재시작: docker compose restart warehouse-frontend"
echo "   - Nginx 상태: sudo systemctl status nginx"
echo "   - Nginx 로그: sudo tail -f /var/log/nginx/warehouse.jongchoi.com.access.log"
echo ""
echo "⚠️  주의사항:"
echo "   - 기존 factory.jongchoi.com 설정은 그대로 유지됩니다"
echo "   - 기존 컨테이너들은 영향을 받지 않습니다"
echo "   - 백업 파일: $BACKUP_FILE (기존 설정이 있었다면)"
echo "   - 환경변수: .env.local 파일에서 VITE_API_BASE_URL 확인"
echo "   - dist 폴더: 로컬에서 npm run build로 생성된 파일 사용"
echo ""
echo "🚀 이제 https://warehouse.jongchoi.com으로 안전하게 프론트엔드에 접근할 수 있습니다!" 