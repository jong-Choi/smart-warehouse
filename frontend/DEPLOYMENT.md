# Warehouse Frontend 배포 가이드

## 개요

이 가이드는 warehouse.jongchoi.com 도메인으로 프론트엔드를 배포하는 방법을 설명합니다.

## 사전 요구사항

- Docker 및 Docker Compose 설치
- Nginx 설치
- sudo 권한
- warehouse.jongchoi.com 도메인 설정

## 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
VITE_API_BASE_URL=https://factory.jongchoi.com
```

## 배포 방법

### 1. 자동 배포 (권장)

```bash
./deploy-warehouse-safe.sh
```

### 2. 수동 배포

```bash
# 1. Docker 이미지 빌드
docker compose build warehouse-frontend

# 2. 컨테이너 시작
docker compose up -d warehouse-frontend

# 3. Nginx 설정 복사
sudo cp nginx/warehouse.jongchoi.com.conf /etc/nginx/sites-available/warehouse.jongchoi.com

# 4. 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/warehouse.jongchoi.com /etc/nginx/sites-enabled/

# 5. Nginx 설정 테스트
sudo nginx -t

# 6. Nginx 재시작
sudo systemctl reload nginx
```

## 서비스 정보

- **도메인**: warehouse.jongchoi.com
- **포트**: 3050
- **헬스 체크**: https://warehouse.jongchoi.com/health
- **API 프록시**: https://warehouse.jongchoi.com/api/ → https://factory.jongchoi.com

## 유용한 명령어

### 컨테이너 관리

```bash
# 로그 확인
docker compose logs -f warehouse-frontend

# 컨테이너 중지
docker compose down warehouse-frontend

# 컨테이너 재시작
docker compose restart warehouse-frontend

# 컨테이너 상태 확인
docker ps | grep warehouse-frontend
```

### Nginx 관리

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 로그 확인
sudo tail -f /var/log/nginx/warehouse.jongchoi.com.access.log
sudo tail -f /var/log/nginx/warehouse.jongchoi.com.error.log

# Nginx 설정 테스트
sudo nginx -t
```

## 문제 해결

### 1. 포트 충돌

3050 포트가 이미 사용 중인 경우:

```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :3050

# 기존 프로세스 종료
sudo kill -9 <PID>
```

### 2. 권한 문제

```bash
# 로그 디렉토리 권한 수정
sudo chown -R www-data:www-data /var/log/nginx
```

### 3. SSL 인증서 문제

SSL 인증서가 없는 경우 HTTP로 접근하거나 Let's Encrypt를 사용하여 인증서를 발급받으세요.

## 백업 및 복원

### 설정 백업

```bash
# 현재 설정 백업
sudo cp /etc/nginx/sites-available/warehouse.jongchoi.com /etc/nginx/sites-available/warehouse.jongchoi.com.backup.$(date +%Y%m%d_%H%M%S)
```

### 설정 복원

```bash
# 백업에서 복원
sudo cp /etc/nginx/sites-available/warehouse.jongchoi.com.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/warehouse.jongchoi.com
sudo nginx -t
sudo systemctl reload nginx
```

## 보안 고려사항

- HTTPS 사용 권장
- 방화벽 설정으로 3050 포트 제한
- 정기적인 보안 업데이트
- 로그 모니터링

## 성능 최적화

- Gzip 압축 활성화 (이미 설정됨)
- 정적 파일 캐싱 (이미 설정됨)
- CDN 사용 고려
- 이미지 최적화
