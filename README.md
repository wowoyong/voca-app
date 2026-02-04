# Voca App

다국어 단어 학습 웹 애플리케이션 - Spaced Repetition 시스템 기반

영어와 일본어 학습을 지원하는 PWA (Progressive Web App)

> 📊 **상업화 전략**: [COMMERCIALIZATION.md](./COMMERCIALIZATION.md) - 광고 수익 모델 및 비즈니스 전략 가이드


## 🎯 주요 기능

### 학습 모드
- **오늘의 학습**: 새로운 단어 + 복습 단어 (랜덤 선택)
- **플래시카드**: 빈칸 채우기 문제 (today/all 모드)
- **퀴즈**: 4지선다 퀴즈 (today/all 모드)
- **복습**: 복습 예정 단어 목록
- **통계**: 학습 진도 및 달성 현황

### Spaced Repetition (SM-2 알고리즘)
- 학습 기록 추적 (`LearningRecord`)
- `easeFactor`, `interval`, `nextReviewAt` 자동 계산
- 난이도에 따른 복습 간격 조정

### TTS (Text-to-Speech)
- Google TTS API 사용
- 영어/일본어 발음 재생
- 24시간 캐싱

## 🛠️ 기술 스택

| 카테고리 | 기술 |
|----------|------|
| **Frontend** | Next.js 15.3.3 (App Router) |
| **React** | 19.1.0 |
| **TypeScript** | 5.8.3 |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite (3개 독립 DB) |
| **ORM** | Prisma 6.9.0 |
| **Authentication** | JWT (jose) + bcryptjs |
| **TTS** | google-tts-api |
| **Deployment** | PM2 |

## 📦 설치

### 1. 클론

```bash
git clone <repository-url>
cd voca-app
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```env
ENGLISH_DATABASE_URL="file:./prisma/data/english.db"
JAPANESE_DATABASE_URL="file:./prisma/data/japanese.db"
AUTH_DATABASE_URL="file:./prisma/data/auth.db"
JWT_SECRET="your-secret-key-here-min-32-chars"
```

**JWT Secret 생성**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. 데이터베이스 초기화

```bash
# 디렉토리 생성
mkdir -p prisma/data

# Prisma 클라이언트 생성
pnpm prisma:generate

# 마이그레이션 (선택)
pnpm prisma migrate dev --schema=prisma/schema-english.prisma --name init
pnpm prisma migrate dev --schema=prisma/schema-japanese.prisma --name init
pnpm prisma migrate dev --schema=prisma/schema-auth.prisma --name init
```

### 5. 실행

```bash
# 개발 서버 (포트 3005)
pnpm dev

# 프로덕션 빌드
pnpm build
pnpm start

# PM2로 배포
pm2 start ecosystem.config.cjs
```

## 📂 프로젝트 구조

```
voca-app/
├── src/
│   ├── app/
│   │   ├── (app)/            # 인증된 페이지
│   │   │   ├── today/         # 오늘의 학습
│   │   │   ├── flashcard/     # 플래시카드
│   │   │   ├── quiz/          # 퀴즈
│   │   │   ├── review/        # 복습
│   │   │   └── stats/         # 통계
│   │   ├── api/               # API 라우트
│   │   ├── login/             # 로그인 페이지
│   │   └── layout.tsx
│   ├── components/            # React 컴포넌트
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # 유틸리티
│   │   ├── db-english.ts      # 영어 DB
│   │   ├── db-japanese.ts     # 일본어 DB
│   │   ├── db-auth.ts         # 인증 DB
│   │   ├── auth.ts            # JWT 인증
│   │   └── user.ts            # 사용자 관리
│   └── generated/             # Prisma 클라이언트
├── prisma/
│   ├── data/                  # SQLite DB 파일
│   ├── schema-english.prisma  # 영어 스키마
│   ├── schema-japanese.prisma # 일본어 스키마
│   └── schema-auth.prisma     # 인증 스키마
└── ecosystem.config.cjs       # PM2 설정
```

## 🔐 인증

### 회원가입 / 로그인

현재는 **간단한 ID/PW 방식** 사용:

```typescript
POST /api/auth
{
  "username": "user123",
  "password": "password123"
}
```

응답:
```json
{
  "token": "jwt-token-here",
  "username": "user123"
}
```

쿠키에 `voca-auth` 토큰이 저장됩니다 (30일 유효).

### 카카오톡 소셜 로그인 (예정)

자세한 가이드는 `KAKAO_LOGIN_GUIDE.md` 참조.

## 🎓 사용 방법

### 1. 회원가입 / 로그인

`/login` 페이지에서 계정 생성

### 2. 언어 선택

우측 상단 토글로 영어 ↔ 일본어 전환

### 3. 학습 시작

- **오늘의 학습**: 매일 랜덤으로 선택된 새 단어 학습
- **플래시카드**: 빈칸 채우기 연습
- **퀴즈**: 실력 테스트

### 4. 복습

복습 시간이 된 단어는 자동으로 `/review`에 표시됩니다.

## 🔧 API 엔드포인트

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/auth` | POST | 로그인/회원가입 |
| `/api/auth/me` | GET | 현재 사용자 정보 |
| `/api/auth/logout` | POST | 로그아웃 |
| `/api/today?lang=en\|jp` | GET | 오늘의 학습 단어 |
| `/api/quiz?lang=en\|jp&mode=today\|all` | GET | 퀴즈 문제 생성 |
| `/api/flashcard-words?lang=en\|jp&mode=today\|all` | GET | 플래시카드 단어 |
| `/api/learning-record?lang=en\|jp` | GET/POST | 학습 기록 |
| `/api/stats?lang=en\|jp` | GET | 학습 통계 |
| `/api/tts?text=hello&lang=en\|jp` | GET | TTS 오디오 |

## 📊 데이터베이스 스키마

### 영어/일본어 DB (공통 구조)

- **User**: 사용자 (텔레그램 봇과 호환)
- **Word**: 단어
- **Expression**: 표현/문장
- **GrammarPoint**: 문법 포인트
- **LearningRecord**: 학습 기록 (SM-2 알고리즘)
- **QuizAttempt**: 퀴즈 시도 기록
- **DailySession**: 일일 학습 세션

### 인증 DB

- **WebUser**: 웹 사용자 (username + passwordHash)

## 🚀 배포

### PM2 사용

```bash
# 앱 시작
pm2 start ecosystem.config.cjs

# 상태 확인
pm2 status

# 로그 확인
pm2 logs voca-app

# 재시작
pm2 restart voca-app

# 중지
pm2 stop voca-app
```

### 환경 변수 (프로덕션)

- `JWT_SECRET`: **강력한 랜덤 값** 사용 필수
- `DATABASE_URL`: 절대 경로 권장

## 🐛 문제 해결

### TypeScript 에러

```bash
npx tsc --noEmit
```

### Prisma 재생성

```bash
pnpm prisma:generate
```

### DB 초기화

```bash
rm -rf prisma/data/*.db
# 다시 마이그레이션 실행
```

## 📝 최근 수정 사항 (2026-02-03)

### 수정됨
- ✅ DB 경로 독립화 (다른 프로젝트 의존성 제거)
- ✅ JWT Secret 강화 (64바이트 랜덤 값)
- ✅ TLS 검증 비활성화 제거 (보안 개선)
- ✅ .gitignore에 DB 파일 제외 추가

### 개선됨
- ✅ **today API**: 단어 랜덤 선택 (이전에는 고정)
- ✅ **quiz API**: 오답 선택지 중복 방지
- ✅ **flashcard API**: today 모드 추가 (새 단어 70% + 복습 30%)

### 추가 예정
- ⏳ 카카오톡 소셜 로그인
- ⏳ 학습 통계 대시보드 개선
- ⏳ 오프라인 지원 (Service Worker)

## 📄 라이선스

Private Project

---

**만든이**: [Your Name]  
**문의**: [Your Email]
