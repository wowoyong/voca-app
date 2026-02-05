# Wordio

다국어 단어 학습 웹 애플리케이션 - Spaced Repetition (SM-2) 시스템 기반

영어와 일본어 학습을 지원하는 PWA (Progressive Web App)

**배포 URL**: https://voca.greencatart.work

## 주요 기능

### 학습 모드
| 모드 | 경로 | 설명 |
|------|------|------|
| **오늘의 학습** | `/today` | 새로운 단어 + 복습 단어 (최대 25개, 랜덤) |
| **빈칸 채우기** | `/flashcard` | 예문 빈칸 채우기 4지선다 |
| **퀴즈** | `/quiz` | 단어 뜻 4지선다 퀴즈 |
| **복습** | `/review` | SM-2 기반 복습 대상 단어 (최대 30개) |
| **통계** | `/stats` | 학습 달력, 연속 학습일, 퀴즈 정확도 |

### Spaced Repetition (SM-2 알고리즘)
- `easeFactor`, `interval`, `nextReviewAt` 자동 계산
- `nextReviewAt`은 대상 날짜 자정(00:00)으로 설정
- 조회 시 오늘 끝(23:59:59)까지의 단어를 복습 대상으로 포함
- 난이도에 따른 복습 간격 자동 조정

### TTS (Text-to-Speech)
- Google TTS API 사용
- 영어/일본어 발음 재생

### 인증
- 카카오 소셜 로그인
- JWT 토큰 기반 (쿠키: `voca-auth`, 30일 유효)

## 기술 스택

| 카테고리 | 기술 |
|----------|------|
| **Frontend** | Next.js 15.3.3 (App Router), React 19.1.0 |
| **Language** | TypeScript 5.8.3 |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite 3 (영어/일본어/인증 3개 독립 DB) |
| **ORM** | Prisma 6.9.0 |
| **Auth** | JWT (jose) + 카카오 OAuth |
| **TTS** | google-tts-api |
| **Deploy** | PM2 + Cloudflare Tunnel |

## 설치

### 1. 클론 및 의존성 설치

```bash
git clone git@github.com:wowoyong/voca-app.git
cd voca-app
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
ENGLISH_DATABASE_URL="file:./prisma/data/english.db"
JAPANESE_DATABASE_URL="file:./prisma/data/japanese.db"
AUTH_DATABASE_URL="file:./prisma/data/auth.db"
JWT_SECRET="your-secret-key-here"
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_REDIRECT_URI="https://your-domain/api/auth/kakao/callback"
```

JWT Secret 생성:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 데이터베이스 초기화

```bash
mkdir -p prisma/data
pnpm prisma:generate
```

### 4. 실행

```bash
# 개발 서버 (포트 3005)
pnpm dev

# 프로덕션
pnpm build && pnpm start

# PM2 배포
pm2 start ecosystem.config.cjs
```

## 프로젝트 구조

```
voca-app/
├── src/
│   ├── app/
│   │   ├── (app)/                # 인증된 페이지 (보호 라우트)
│   │   │   ├── page.tsx          # 홈 (대시보드)
│   │   │   ├── today/            # 오늘의 학습
│   │   │   ├── flashcard/        # 빈칸 채우기
│   │   │   ├── quiz/             # 퀴즈
│   │   │   ├── review/           # 복습
│   │   │   ├── stats/            # 통계
│   │   │   ├── settings/         # 설정
│   │   │   ├── privacy/          # 개인정보처리방침
│   │   │   ├── terms/            # 이용약관
│   │   │   ├── AppShell.tsx      # 앱 셸 (네비게이션 + 콘텐츠 래퍼)
│   │   │   └── layout.tsx        # 앱 레이아웃
│   │   ├── api/                  # API 라우트
│   │   │   ├── auth/             # 인증 (로그인/로그아웃/카카오/탈퇴)
│   │   │   ├── today/            # 오늘의 학습 데이터
│   │   │   ├── review/           # 복습 대상 조회
│   │   │   ├── quiz/             # 퀴즈 문제 생성
│   │   │   ├── flashcard-words/  # 빈칸 채우기 단어
│   │   │   ├── learning-record/  # 학습 기록 (SM-2)
│   │   │   ├── daily-session/    # 일일 세션 완료 처리
│   │   │   ├── stats/            # 학습 통계
│   │   │   └── tts/              # 텍스트 음성 변환
│   │   ├── login/                # 로그인 페이지
│   │   └── layout.tsx            # 루트 레이아웃
│   ├── components/               # React 컴포넌트
│   │   ├── BottomNav.tsx         # 하단 네비게이션 (홈/학습/복습/통계)
│   │   ├── SwipeableCard.tsx     # 스와이프 플래시카드
│   │   ├── QuizCard.tsx          # 퀴즈 카드
│   │   ├── StatsCalendar.tsx     # 학습 달력
│   │   ├── ProgressBar.tsx       # 진행률 바
│   │   ├── LanguageToggle.tsx    # EN/JP 전환 토글
│   │   ├── TTSButton.tsx         # TTS 재생 버튼
│   │   ├── InstallPrompt.tsx     # PWA 설치 프롬프트
│   │   ├── AdBanner.tsx          # 광고 배너
│   │   ├── AdInterstitial.tsx    # 전면 광고
│   │   └── PushNotification.tsx  # 푸시 알림
│   ├── hooks/                    # 커스텀 훅
│   │   ├── useLanguage.ts        # 언어 설정 (EN/JP)
│   │   ├── useSwipe.ts           # 터치/마우스 스와이프
│   │   └── useTTS.ts             # TTS 재생
│   ├── lib/                      # 유틸리티
│   │   ├── auth.ts               # JWT 인증
│   │   ├── user.ts               # 사용자 조회/생성
│   │   ├── db-english.ts         # 영어 DB Prisma 클라이언트
│   │   ├── db-japanese.ts        # 일본어 DB Prisma 클라이언트
│   │   └── db-auth.ts            # 인증 DB Prisma 클라이언트
│   ├── generated/                # Prisma 자동 생성 클라이언트
│   └── middleware.ts             # 인증 미들웨어
├── prisma/
│   ├── data/                     # SQLite DB 파일
│   ├── schema-english.prisma
│   ├── schema-japanese.prisma
│   └── schema-auth.prisma
├── next.config.ts                # Next.js 설정 (캐시 헤더 포함)
└── ecosystem.config.cjs          # PM2 설정
```

## API 엔드포인트

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/auth` | POST | ID/PW 로그인 |
| `/api/auth/kakao` | GET | 카카오 로그인 리다이렉트 |
| `/api/auth/kakao/callback` | GET | 카카오 OAuth 콜백 |
| `/api/auth/me` | GET | 현재 사용자 정보 |
| `/api/auth/logout` | POST | 로그아웃 |
| `/api/auth/delete` | DELETE | 회원 탈퇴 |
| `/api/today?lang=en\|jp` | GET | 오늘의 학습 단어 |
| `/api/review?lang=en\|jp` | GET | 복습 대상 단어 (최대 30개) |
| `/api/quiz?lang=en\|jp` | GET | 퀴즈 문제 생성 |
| `/api/flashcard-words?lang=en\|jp` | GET | 빈칸 채우기 단어 |
| `/api/learning-record` | GET/POST | 학습 기록 조회/저장 |
| `/api/daily-session/complete` | POST | 일일 세션 완료 처리 |
| `/api/stats?lang=en\|jp` | GET | 학습 통계 (달력, 퀴즈 정확도) |
| `/api/tts?text=...&lang=en\|jp` | GET | TTS 오디오 스트림 |

## 데이터베이스 스키마

### 영어/일본어 DB (공통)
- **User**: 사용자 프로필
- **Word**: 단어 (영어/일본어, 한국어 뜻, 발음, 예문)
- **Expression**: 표현/관용구
- **GrammarPoint**: 문법 포인트
- **LearningRecord**: SM-2 학습 기록 (easeFactor, interval, nextReviewAt)
- **QuizAttempt**: 퀴즈 시도 기록
- **DailySession**: 일일 학습 세션 (todayCompleted, reviewCompleted, quizCompleted)

### 인증 DB
- **WebUser**: 웹 사용자 (username, passwordHash, kakaoId)

## 배포

### PM2

```bash
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs voca-app
pm2 restart voca-app
```

### Cloudflare Tunnel

도메인 `greencatart.work`을 통해 Cloudflare Tunnel로 서비스.
`next.config.ts`에 HTML 캐시 무효화 헤더 설정 포함.

## 최근 수정 사항

### 2026-02-05
- 복습 버튼 클릭 지원 (알아요/모르겠어요 실제 버튼)
- useSwipe 훅 마우스 드래그 지원 추가

### 2026-02-04
- UX 개선: 하단 네비 4탭 구조 (홈/학습/복습/통계)
- 학습 버튼 "다음"/"학습 끝내기" 구분
- 홈 페이지 복습 CTA 배너 추가
- SM-2 nextReviewAt 자정 기준으로 수정
- 복습 전용 API (`/api/review`) 추가
- 통계 API 인증 사용자 기반으로 수정
- Cloudflare 캐시 무효화 헤더 추가
- 퀴즈 React Hooks 위반 수정

### 2026-02-03
- DB 경로 독립화
- JWT Secret 강화
- today API 랜덤 선택
- quiz API 오답 중복 방지
- flashcard today 모드 추가

## 라이선스

Private Project
