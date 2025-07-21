#!/bin/bash

echo "🚀 Factory Backend Docker 테스트 시작..."

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

# 1. Docker 상태 확인
log_info "Docker 상태 확인 중..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker가 실행되지 않았습니다. Docker Desktop을 시작해주세요."
    exit 1
fi
log_success "Docker가 정상 실행 중입니다."

# 2. 기존 컨테이너 및 캐시 정리
log_info "기존 컨테이너 및 캐시 정리 중..."
docker compose down > /dev/null 2>&1
docker system prune -f > /dev/null 2>&1
log_success "정리 완료"

# 3. 로컬 Prisma 클라이언트 재생성 (플랫폼 호환성)
log_info "Prisma 클라이언트 재생성 중..."
npx prisma generate
log_success "Prisma 클라이언트 생성 완료"

# 4. Docker 이미지 빌드
log_info "Docker 이미지 빌드 중..."
if docker compose build --no-cache; then
    log_success "이미지 빌드 완료"
else
    log_error "이미지 빌드 실패"
    exit 1
fi

# 5. 컨테이너 시작
log_info "컨테이너 시작 중..."
if docker compose up -d; then
    log_success "컨테이너 시작 완료"
else
    log_error "컨테이너 시작 실패"
    exit 1
fi

# 6. 컨테이너 상태 확인
log_info "컨테이너 상태 확인 중..."
sleep 3
if docker compose ps | grep -q "Up"; then
    log_success "컨테이너가 정상 실행 중입니다"
else
    log_error "컨테이너 실행 실패"
    docker compose logs factory-backend
    exit 1
fi

# 7. 데이터베이스 파일 확인
log_info "데이터베이스 파일 확인 중..."
if docker compose exec -T factory-backend ls -la dev.db > /dev/null 2>&1; then
    db_size=$(docker compose exec -T factory-backend stat -f%z dev.db 2>/dev/null || docker compose exec -T factory-backend stat -c%s dev.db 2>/dev/null)
    if [ "$db_size" -gt 1000000 ]; then
        log_success "기존 데이터베이스 파일 확인 완료 (크기: ${db_size} bytes)"
    else
        log_warning "데이터베이스 파일이 너무 작습니다 (크기: ${db_size} bytes)"
    fi
else
    log_warning "데이터베이스 파일을 찾을 수 없습니다"
fi

# 8. API 헬스 체크
log_info "API 헬스 체크 중..."
sleep 2
if curl -s http://localhost:3050/health > /dev/null; then
    log_success "API 서버가 정상 작동 중입니다"
else
    log_error "API 서버 응답 없음"
    docker compose logs factory-backend
    exit 1
fi

# 9. API 엔드포인트 테스트
log_info "API 엔드포인트 테스트 중..."

# 헬스 체크
if curl -s http://localhost:3050/health | grep -q "success.*true"; then
    log_success "헬스 체크 엔드포인트 정상"
else
    log_warning "헬스 체크 엔드포인트 응답 이상"
fi

# 운송장 API (데이터 확인)
waybill_response=$(curl -s http://localhost:3050/api/waybills)
if echo "$waybill_response" | grep -q "success.*true"; then
    waybill_count=$(echo "$waybill_response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    if [ "$waybill_count" -gt 0 ]; then
        log_success "운송장 API 정상 (총 $waybill_count개 데이터)"
    else
        log_warning "운송장 API 정상이지만 데이터가 없습니다"
    fi
else
    log_warning "운송장 API 응답 이상"
fi

# 작업자 API (데이터 확인)
operator_response=$(curl -s http://localhost:3050/api/operators)
if echo "$operator_response" | grep -q "success.*true"; then
    operator_count=$(echo "$operator_response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    if [ "$operator_count" -gt 0 ]; then
        log_success "작업자 API 정상 (총 $operator_count개 데이터)"
    else
        log_warning "작업자 API 정상이지만 데이터가 없습니다"
    fi
else
    log_warning "작업자 API 응답 이상"
fi

# 배송지 API (데이터 확인)
location_response=$(curl -s http://localhost:3050/api/locations)
if echo "$location_response" | grep -q "success.*true"; then
    location_count=$(echo "$location_response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    if [ "$location_count" -gt 0 ]; then
        log_success "배송지 API 정상 (총 $location_count개 데이터)"
    else
        log_warning "배송지 API 정상이지만 데이터가 없습니다"
    fi
else
    log_warning "배송지 API 응답 이상"
fi

# 10. 최종 상태 출력
echo ""
log_success "🎉 Factory Backend Docker 테스트 완료!"
echo ""
echo "📊 서버 정보:"
echo "   - URL: http://localhost:3050"
echo "   - API 문서: http://localhost:3050/api-docs"
echo "   - 헬스 체크: http://localhost:3050/health"
echo ""
echo "🗄️  데이터베이스 정보:"
echo "   - 기존 시드 데이터가 포함된 dev.db 파일을 사용합니다"
echo "   - 운송장, 작업자, 배송지, 근무기록, 작업통계 데이터 포함"
echo ""
echo "🔧 유용한 명령어:"
echo "   - 로그 확인: docker compose logs -f factory-backend"
echo "   - 컨테이너 중지: docker compose down"
echo "   - 컨테이너 재시작: docker compose restart"
echo "   - 데이터베이스 확인: docker compose exec factory-backend ls -la dev.db"
echo "   - 데이터베이스 스키마 동기화: docker compose exec factory-backend npx prisma db push"
echo ""
echo "🚀 이제 프론트엔드에서 http://localhost:3050으로 API를 호출할 수 있습니다!" 