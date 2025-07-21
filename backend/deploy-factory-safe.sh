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

echo "🚀 Factory Backend 안전 배포 시작 (기존 설정 충돌 방지)..."

# 변수 정의
NGINX_CONF_SOURCE="./nginx/factory.jongchoi.com.conf"
NGINX_CONF_TARGET="/etc/nginx/sites-available/factory.jongchoi.com"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/factory.jongchoi.com"
LOG_DIR="/var/log/nginx"

# 1. 기존 설정 확인 및 백업
log_info "기존 Nginx 설정 확인 중..."
if [ -f "$NGINX_CONF_TARGET" ]; then
    log_warning "기존 factory.jongchoi.com.conf 파일이 발견되었습니다"
    BACKUP_FILE="${NGINX_CONF_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"
    sudo cp "$NGINX_CONF_TARGET" "$BACKUP_FILE"
    log_success "기존 설정 백업 완료: $BACKUP_FILE"
else
    log_info "기존 factory.jongchoi.com.conf 파일이 없습니다 (새로 생성)"
fi

# 2. 기존 Docker 컨테이너 상태 확인
log_info "기존 Docker 컨테이너 상태 확인 중..."
if docker ps | grep -q "factory-backend"; then
    log_warning "기존 factory-backend 컨테이너가 실행 중입니다"
    read -p "기존 컨테이너를 중지하고 새로 시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "기존 컨테이너 중지 중..."
        docker compose down factory-backend
        log_success "기존 컨테이너 중지 완료"
    else
        log_info "기존 컨테이너를 유지합니다"
    fi
else
    log_info "기존 factory-backend 컨테이너가 없습니다"
fi

# 3. 로그 디렉토리 생성 (기존 디렉토리 건드리지 않음)
log_info "로그 디렉토리 확인 중..."
if [ ! -d "$LOG_DIR" ]; then
    log_info "로그 디렉토리 생성 중..."
    sudo mkdir -p "$LOG_DIR"
    sudo chown www-data:www-data "$LOG_DIR"
    log_success "로그 디렉토리 생성 완료"
else
    log_success "로그 디렉토리가 이미 존재합니다"
fi

# 4. Nginx 설정 파일 복사 (기존 설정 삭제하지 않음)
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

# 5. 심볼릭 링크 생성/갱신 (기존 링크 덮어쓰기)
log_info "Nginx 심볼릭 링크 생성/갱신 중..."
if [ -L "$NGINX_CONF_LINK" ]; then
    log_info "기존 심볼릭 링크를 갱신합니다"
    sudo rm "$NGINX_CONF_LINK"
fi
sudo ln -s "$NGINX_CONF_TARGET" "$NGINX_CONF_LINK"
log_success "심볼릭 링크 생성 완료"

# 6. Nginx 설정 테스트
log_info "Nginx 설정 테스트 중..."
if sudo nginx -t; then
    log_success "Nginx 설정 테스트 통과"
else
    log_error "Nginx 설정 테스트 실패"
    log_info "백업 파일에서 복원하려면: sudo cp $BACKUP_FILE $NGINX_CONF_TARGET"
    exit 1
fi

# 7. Docker 이미지 빌드 (캐시 사용하여 빠르게)
log_info "Docker 이미지 빌드 중..."
if docker compose build factory-backend; then
    log_success "Docker 이미지 빌드 완료"
else
    log_error "Docker 이미지 빌드 실패"
    exit 1
fi

# 8. Docker 컨테이너 시작
log_info "Docker 컨테이너 시작 중..."
if docker compose up -d factory-backend; then
    log_success "Docker 컨테이너 시작 완료"
else
    log_error "Docker 컨테이너 시작 실패"
    exit 1
fi

# 9. 컨테이너 상태 확인
log_info "컨테이너 상태 확인 중..."
sleep 3
if docker ps | grep -q "factory-backend.*Up"; then
    log_success "factory-backend 컨테이너가 정상 실행 중입니다"
else
    log_error "factory-backend 컨테이너 실행 실패"
    docker compose logs factory-backend
    exit 1
fi

log_info "DB 스키마 동기화(prisma db push) 중..."
if docker compose exec -T factory-backend npx prisma db push; then
    log_success "DB 스키마 동기화 완료"
else
    log_error "DB 스키마 동기화 실패"
    exit 1
fi

# 10. API 헬스 체크
log_info "API 헬스 체크 중..."
sleep 2
if curl -s http://localhost:3050/health; then
    log_success "API 서버가 정상 작동 중입니다"
else
    log_warning "API 서버 응답 없음 (컨테이너가 아직 시작 중일 수 있습니다)"
fi

# 11. Nginx 재시작 (기존 서비스 영향 최소화)
log_info "Nginx 설정 적용 중..."
if sudo systemctl reload nginx; then
    log_success "Nginx 설정 적용 완료"
else
    log_error "Nginx 설정 적용 실패"
    exit 1
fi

# 12. 최종 연결 테스트
log_info "최종 연결 테스트 중..."
sleep 2

# HTTPS 테스트 (SSL 인증서가 있다면)
if curl -s -k https://factory.jongchoi.com/health; then
    log_success "✅ Factory Backend API HTTPS 연결 성공!"
elif curl -s http://factory.jongchoi.com/health; then
    log_success "✅ Factory Backend API HTTP 연결 성공!"
else
    log_warning "⚠️  도메인 연결 테스트 실패 (로컬 테스트 시도)"
    if curl -s http://localhost:3050/health; then
        log_success "✅ 로컬 API 연결 성공 (포트 3050)"
    else
        log_error "❌ 로컬 API 연결도 실패"
    fi
fi

echo ""
log_success "🎉 Factory Backend 안전 배포 완료!"
echo ""
echo "📊 서버 정보:"
echo "   - 도메인: factory.jongchoi.com"
echo "   - 포트: 3050"
echo "   - API 문서: https://factory.jongchoi.com/api-docs"
echo "   - 헬스 체크: https://factory.jongchoi.com/health"
echo ""
echo "🔧 유용한 명령어:"
echo "   - 컨테이너 로그: docker compose logs -f factory-backend"
echo "   - 컨테이너 중지: docker compose down factory-backend"
echo "   - 컨테이너 재시작: docker compose restart factory-backend"
echo "   - Nginx 상태: sudo systemctl status nginx"
echo "   - Nginx 로그: sudo tail -f /var/log/nginx/factory.jongchoi.com.access.log"
echo ""
echo "⚠️  주의사항:"
echo "   - 기존 llm.jongchoi.com 설정은 그대로 유지됩니다"
echo "   - 기존 컨테이너들은 영향을 받지 않습니다"
echo "   - 백업 파일: $BACKUP_FILE (기존 설정이 있었다면)"
echo ""
echo "🚀 이제 https://factory.jongchoi.com으로 안전하게 API에 접근할 수 있습니다!" 