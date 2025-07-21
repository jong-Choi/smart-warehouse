# Dockerfile
FROM node:20-alpine AS builder

# 앱 디렉토리 생성
WORKDIR /app

# 의존성 파일들만 먼저 복사 (캐시 최적화)
COPY package*.json ./
COPY tsconfig.json tsup.config.ts ./

# 모든 의존성 설치 (개발 의존성 포함)
RUN npm ci

# Prisma schema 복사 및 generate
COPY prisma ./prisma
RUN npx prisma generate

# 소스 코드 복사
COPY ./src ./src

# 빌드
RUN npx tsup

# 프로덕션 스테이지
FROM node:20-alpine AS production

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Prisma 관련 파일들 복사
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma

# 기존 데이터베이스 파일 복사 (시드 데이터 포함)
COPY prisma/dev.db ./dev.db

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist

# 실행 포트
EXPOSE 3050

# 시작 명령
CMD ["node", "dist/index.js"]
