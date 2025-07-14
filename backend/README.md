# Todo API Backend

TypeScript로 작성된 Express.js 기반 Todo API 서버입니다. JSON 파일을 데이터베이스로 사용합니다.

## 🚀 기술 스택

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Validation**: Zod
- **Storage**: JSON File
- **Development**: Nodemon

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── controllers/     # HTTP 요청/응답 처리
│   ├── services/        # 비즈니스 로직
│   ├── routes/          # 라우터 정의
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 유틸리티 함수
│   └── index.ts         # 서버 시작점
├── data/                # JSON 데이터 파일
├── dist/                # 빌드 출력 (자동 생성)
└── package.json
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📝 API 엔드포인트

### Todo API

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/api/todos`     | 모든 할 일 조회 |
| GET    | `/api/todos/:id` | 특정 할 일 조회 |
| POST   | `/api/todos`     | 새 할 일 생성   |
| PATCH  | `/api/todos/:id` | 할 일 수정      |
| DELETE | `/api/todos/:id` | 할 일 삭제      |

### 기타

| Method | Endpoint  | Description    |
| ------ | --------- | -------------- |
| GET    | `/health` | 서버 상태 확인 |

## 📋 요청/응답 예시

### 할 일 생성

```bash
POST /api/todos
Content-Type: application/json

{
  "title": "새로운 할 일",
  "isComplete": false
}
```

### 응답

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "새로운 할 일",
    "isComplete": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "links": {
      "self": "/api/todos/abc123",
      "update": "/api/todos/abc123",
      "delete": "/api/todos/abc123"
    }
  },
  "message": "Todo created successfully"
}
```

## 🔧 환경 변수

| 변수명      | 기본값                | 설명             |
| ----------- | --------------------- | ---------------- |
| PORT        | 4000                  | 서버 포트        |
| CORS_ORIGIN | http://localhost:3000 | CORS 허용 도메인 |

## 📦 스크립트

- `npm run dev`: 개발 서버 실행 (nodemon)
- `npm run build`: TypeScript 컴파일
- `npm start`: 프로덕션 서버 실행
- `npm run type-check`: 타입 검사
- `npm run lint`: ESLint 실행

## 🎯 주요 기능

- ✅ TypeScript 지원
- ✅ JSON 파일 기반 데이터 저장
- ✅ Zod를 통한 데이터 검증
- ✅ RESTful API 설계
- ✅ 에러 핸들링
- ✅ CORS 설정
- ✅ 로깅 (Morgan)
- ✅ 모듈 별칭 지원
