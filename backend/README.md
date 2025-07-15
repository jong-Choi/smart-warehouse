# 택배 관리 시스템 API

택배 배송 과정을 관리하는 REST API입니다. 소포, 운송장, 작업자, 배송지 정보를 조회할 수 있습니다.

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npm run db:push

# 샘플 데이터 생성
npm run seed

# 개발 서버 실행
npm run dev
```

### 환경 변수

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## 📚 API 엔드포인트

### 소포 (Parcels)

#### 모든 소포 조회

```
GET /api/parcels
```

**쿼리 파라미터:**

- `status`: 소포 상태 필터 (PENDING_UNLOAD, UNLOADED, NORMAL, ACCIDENT)
- `operatorId`: 작업자 ID 필터
- `locationId`: 배송지 ID 필터
- `waybillId`: 운송장 ID 필터
- `isAccident`: 사고 여부 필터 (true/false)
- `startDate`: 처리 시작일 (YYYY-MM-DD)
- `endDate`: 처리 종료일 (YYYY-MM-DD)

**예시:**

```bash
curl "http://localhost:4000/api/parcels?status=NORMAL&isAccident=false"
```

#### 소포 상세 조회

```
GET /api/parcels/:id
```

#### 소포 통계 조회

```
GET /api/parcels/stats
```

### 운송장 (Waybills)

#### 모든 운송장 조회

```
GET /api/waybills
```

**쿼리 파라미터:**

- `status`: 운송장 상태 필터 (IN_TRANSIT, DELIVERED, RETURNED, ERROR)
- `startDate`: 발송 시작일 (YYYY-MM-DD)
- `endDate`: 발송 종료일 (YYYY-MM-DD)

#### 운송장 상세 조회

```
GET /api/waybills/:id
```

#### 운송장 번호로 조회

```
GET /api/waybills/number/:number
```

#### 운송장 통계 조회

```
GET /api/waybills/stats
```

### 작업자 (Operators)

#### 모든 작업자 조회

```
GET /api/operators
```

**쿼리 파라미터:**

- `type`: 작업자 유형 필터 (HUMAN, MACHINE)

#### 작업자 상세 조회

```
GET /api/operators/:id
```

#### 작업자 코드로 조회

```
GET /api/operators/code/:code
```

#### 작업자 통계 조회

```
GET /api/operators/stats
```

#### 작업자 근무 기록 조회

```
GET /api/operators/:operatorId/shifts
```

**쿼리 파라미터:**

- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)

#### 작업자 작업 통계 조회

```
GET /api/operators/:operatorId/works
```

**쿼리 파라미터:**

- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)

### 배송지 (Locations)

#### 모든 배송지 조회

```
GET /api/locations
```

#### 배송지 상세 조회

```
GET /api/locations/:id
```

#### 배송지 통계 조회

```
GET /api/locations/stats
```

#### 배송지 소포 목록 조회

```
GET /api/locations/:locationId/parcels
```

**쿼리 파라미터:**

- `limit`: 조회할 소포 수 (기본값: 50)

#### 배송지 작업 통계 조회

```
GET /api/locations/:locationId/works
```

**쿼리 파라미터:**

- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)

## 📊 데이터 모델

### 소포 상태 (ParcelStatus)

- `PENDING_UNLOAD`: 아직 하차되지 않은 상태
- `UNLOADED`: 하차 완료됨
- `NORMAL`: 정상 처리됨
- `ACCIDENT`: 사고 발생 처리됨

### 운송장 상태 (WaybillStatus)

- `IN_TRANSIT`: 배송 중
- `DELIVERED`: 배송 완료
- `RETURNED`: 반송됨
- `ERROR`: 시스템 오류 혹은 분실

### 작업자 유형 (OperatorType)

- `HUMAN`: 사람 작업자
- `MACHINE`: 자동 기계

## 🔧 개발 도구

### Prisma Studio

데이터베이스를 시각적으로 확인할 수 있습니다:

```bash
npm run db:studio
```

### 데이터베이스 마이그레이션

```bash
npm run db:migrate
```

### 타입 체크

```bash
npm run type-check
```

### 린팅

```bash
npm run lint
```

## 📝 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

### 성공 응답

```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### 오류 응답

```json
{
  "success": false,
  "message": "오류 메시지"
}
```

## 🧪 테스트

서버가 실행된 후 다음 URL로 API를 테스트할 수 있습니다:

- **헬스 체크**: http://localhost:4000/health
- **소포 API**: http://localhost:4000/api/parcels
- **운송장 API**: http://localhost:4000/api/waybills
- **작업자 API**: http://localhost:4000/api/operators
- **배송지 API**: http://localhost:4000/api/locations

## 📋 샘플 데이터

시스템에는 다음과 같은 샘플 데이터가 포함되어 있습니다:

- **배송지**: 서울 강남구, 부산 해운대구, 대구 중구, 인천 연수구
- **작업자**: 김택배, 이배송, 자동분류기-A, 자동분류기-B
- **운송장**: 4개의 다양한 상태의 운송장
- **소포**: 6개의 다양한 상태의 소포
- **근무 기록**: 3개의 작업자 근무 기록
- **작업 통계**: 3개의 작업자별 KPI 데이터
