# Wordio 프로젝트 TODO 리스트

프로젝트: Wordio (영어/일본어 단어 학습 웹앱)
기술 스택: Next.js 15.5.11, TypeScript, Prisma, SQLite, PM2
배포 URL: https://voca.greencatart.work
최종 업데이트: 2026-02-04

---

## 완료된 작업 (Phase 1 & 2)

### 기본 기능
- 카카오 로그인 연동
- JWT 인증 시스템
- 인증 미들웨어
- 회원 탈퇴 + 로그아웃

### 학습 기능
- /today - 오늘의 단어 (15개, 학습완료 버튼, 진행상황 저장)
- /review - 복습
- /flashcard - 플래시카드
- /quiz - 퀴즈
- /stats - 통계 페이지

### 통계 & 달력 시스템
- 3단계 학습 달력 (today/review/quiz 완료 추적)
  - Tier 1: 오늘의 단어만 (연한 녹색)
  - Tier 2: 단어 + 복습 (중간 녹색)
  - Tier 3: 단어 + 복습 + 퀴즈 (진한 녹색)
- 월별 통계 요약 (총 학습일, 단어, +복습, +퀴즈)
- Streak 강조 카드 (대형 그라디언트)

### 알림 설정
- 알림 시간 설정 (시간 선택 위젯)
- 알림 ON/OFF 토글 스위치
- API: /api/settings/notification-time

### PWA & 최적화
- PWA manifest + 아이콘들
- Service Worker (오프라인 캐싱)
- next.config 최적화
- 유니코드 이스케이프 수정

---

## 우선순위 높은 작업 (Phase 3)

### 1. Push 알림 실제 발송 기능 완성
현재 상태: UI만 구현됨

필요 작업:
- [ ] VAPID 키 환경 변수 추가 (.env)
  - Public Key: BNtW96_DI1oCmcO_mpztvKroOzzKs2Pab0z3B5K3kA9TWrUIoAu6UUkVYT0kCFaDfQUrVuIWk4vnP2Y4nzKlPOM
  - Private Key: QAkJtKiziwH4lJmdI7W6p1WX7elvKGakRZYYU9-fS5s

- [ ] Push 구독 API 생성 (/api/push/subscribe)
  - Push subscription 객체를 DB에 저장

- [ ] Push 발송 API 생성 (/api/push/send)
  - web-push 라이브러리 사용

- [ ] 크론잡 설정 (매일 정해진 시간에 발송)
  - User의 dailyTime 필드 활용
  - isActive = true인 사용자에게만 발송

예상 소요 시간: 2-3시간

### 2. 실제 사용자 테스트
카카오 비즈앱 승인 후 진행
- [ ] 신규 회원 가입 → 로그인
- [ ] 학습 플로우 테스트
- [ ] 통계 확인
- [ ] PWA 설치

---

## 선택적 개선 사항 (Phase 4)

### UI/UX
- [ ] 다크모드 지원
- [ ] 햅틱 피드백 (모바일)
- [ ] 학습 완료 애니메이션

### 통계 & 분석
- [ ] 학습 패턴 분석
- [ ] 목표 설정 기능
- [ ] 레벨 시스템 (XP, 배지)

### 수익화
- [ ] AdFit 광고 활성화
- [ ] 프리미엄 플랜

### 기술적 개선
- [ ] 성능 모니터링 (Sentry, Analytics)
- [ ] 테스트 추가 (Jest, Playwright)
- [ ] CI/CD 파이프라인

---

## 알려진 이슈

- [ ] @next/swc 버전 불일치 경고 (기능 정상)
- [ ] 데이터베이스 백업 자동화
- [ ] Rate limiting 추가

---

## 배포 정보

Mac Mini 서버
- SSH: ssh mac-mini-ts
- 프로젝트 경로: /Users/jojaeyong/WebstormProjects/voca-app
- PM2 프로세스: voca-app (ID: 7)
- 도메인: https://voca.greencatart.work

배포 명령어:
```
ssh mac-mini-ts
cd /Users/jojaeyong/WebstormProjects/voca-app
pnpm build
pm2 restart voca-app
```

---

## 현재 상태 요약

| 카테고리 | 완료율 | 상태 |
|---------|--------|------|
| 핵심 기능 | 100% | 완료 |
| UI/UX | 95% | 우수 |
| 알림 시스템 | 60% | UI만 완료 |
| 통계/분석 | 80% | 달력 완료 |
| PWA | 90% | 설치 가능 |

전체 완료율: 약 85%

---

다음 액션:
1. 카카오 비즈앱 승인 대기
2. Push 알림 발송 기능 구현
3. 실제 사용자 테스트
4. 피드백 수집 및 개선

---

마지막 업데이트: 2026-02-04 19:35 KST
작성자: Claude (Sisyphus Agent)
