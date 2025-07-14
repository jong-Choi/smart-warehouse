# Todo Backend API

TypeScript Express 백엔드 API with Prisma ORM and SQLite

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **Validation**: Zod

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="file:./dev.db"
```

> **참고**: SQLite 데이터베이스 파일(`dev.db`)은 자동으로 생성됩니다.

### 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 또는 마이그레이션 사용 (권장)
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## API 엔드포인트

### Todos

- `GET /api/todos` - 모든 todo 조회
- `GET /api/todos/:id` - 특정 todo 조회
- `POST /api/todos` - 새 todo 생성
- `PUT /api/todos/:id` - todo 수정
- `DELETE /api/todos/:id` - todo 삭제

### Todo 생성 예시

```json
{
  "title": "새로운 할 일",
  "isComplete": false
}
```

## 개발 도구

- `npm run dev` - 개발 서버 실행
- `npm run build` - TypeScript 컴파일
- `npm run start` - 프로덕션 서버 실행
- `npm run type-check` - 타입 체크
- `npm run lint` - ESLint 실행
- `npm run db:studio` - Prisma Studio 실행 (데이터베이스 GUI)

## 프로젝트 구조

```
src/
├── controllers/     # API 컨트롤러
├── models/         # Prisma 모델
├── services/       # 비즈니스 로직
├── routes/         # 라우터
├── utils/          # 유틸리티 함수
├── typings/        # TypeScript 타입 정의 (Prisma 타입 통합)
└── generated/      # Prisma 생성 파일
```

## 모듈 별칭 (Alias)

프로젝트에서 사용하는 모듈 별칭들:

- `@src/*` → `src/*`
- `@controllers/*` → `src/controllers/*`
- `@services/*` → `src/services/*`
- `@models/*` → `src/models/*`
- `@utils/*` → `src/utils/*`
- `@typings/*` → `src/typings/*`
- `@generated/*` → `src/generated/*`
- `@/*` → `src/*`

## 타입 시스템

이 프로젝트는 Prisma의 자동 생성 타입을 최대한 활용합니다:

- **Todo 타입**: Prisma에서 자동 생성된 `Todo` 타입을 재사용
- **CreateTodoRequest**: `Prisma.TodoCreateInput` 타입 활용
- **UpdateTodoRequest**: `Prisma.TodoUpdateInput` 타입 활용
- **TodoResponse**: Prisma `Todo` 타입을 확장하여 API 응답에 필요한 `links` 추가

이렇게 함으로써 데이터베이스 스키마와 TypeScript 타입이 완전히 동기화되어 타입 안정성을 보장합니다.
