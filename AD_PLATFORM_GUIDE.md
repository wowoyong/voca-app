# 광고 플랫폼 연동 가이드

> 광고 연동은 외부 승인이 필요합니다. 아래 가이드를 따라 진행해주세요.

---

## 📊 추천 플랫폼

### 1순위: Google AdSense (권장)

**장점**:
- 높은 신뢰도
- 자동 광고 최적화
- 글로벌 광고주 풀

**단점**:
- PWA 승인 까다로움
- eCPM 상대적으로 낮음 (한국 기준)

### 2순위: 카카오 애드핏 (한국 특화)

**장점**:
- 한국 시장 특화
- 높은 eCPM
- 간편한 정산

**단점**:
- 트래픽 최소 기준 (일 100~500 UV)
- 심사 있음

---

## 🚀 Google AdSense 신청 방법

### Step 1: 계정 생성 (10분)

1. https://adsense.google.com 접속
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. 웹사이트 URL 입력: `http://192.168.0.34:3005` (임시) 또는 도메인
5. 국가/지역: 대한민국
6. 이용약관 동의

### Step 2: 사이트 등록

1. AdSense 계정 > 사이트 > 사이트 추가
2. URL 입력
3. 확인 코드 받기
4. 확인 코드를 `<head>` 태그에 삽입 (아래 참고)

### Step 3: 확인 코드 삽입

**파일**: `/voca-app/src/app/layout.tsx`

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense 확인 코드 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 4: 광고 단위 생성

승인 후 (1~3일 소요):
1. AdSense > 광고 > 광고 단위별
2. "디스플레이 광고" 선택
3. 광고 단위 이름: "Voca Bottom Banner"
4. 크기: 반응형
5. 코드 복사

### Step 5: 광고 컴포넌트 구현

**파일**: `/voca-app/src/components/AdBanner.tsx` (신규 생성)

```tsx
"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
}

export default function AdBanner({ slot, format = "auto" }: AdBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
```

### Step 6: 광고 배치

#### 예시 1: 하단 배너 (Today 페이지)

**파일**: `/voca-app/src/app/(app)/today/page.tsx`

```tsx
import AdBanner from "@/components/AdBanner";

export default function TodayPage() {
  return (
    <div>
      {/* 기존 콘텐츠 */}
      
      {/* 하단 광고 */}
      <div className="mt-8">
        <AdBanner slot="1234567890" />
      </div>
    </div>
  );
}
```

#### 예시 2: 전면 광고 (Quiz 완료 후)

**파일**: `/voca-app/src/app/(app)/quiz/page.tsx`

```tsx
{completed && (
  <div>
    <h2>완료!</h2>
    
    {/* 전면 광고 */}
    <div className="my-6">
      <AdBanner slot="0987654321" format="rectangle" />
    </div>
    
    <button>다시 풀기</button>
  </div>
)}
```

---

## 🔥 카카오 애드핏 신청 방법

### Step 1: 계정 생성

1. https://adfit.kakao.com 접속
2. 카카오 계정으로 로그인
3. 사업자 정보 입력 (개인/사업자)
4. 정산 계좌 등록

### Step 2: 사이트 등록

1. 사이트 관리 > 사이트 추가
2. 사이트 URL 입력
3. 카테고리: 교육
4. 트래픽 정보 입력 (일 100 UV 이상 권장)

### Step 3: 광고 단위 생성

1. 광고 관리 > 광고 단위 추가
2. 유형: 디스플레이
3. 크기: 320x100 (모바일 배너)
4. 코드 복사

### Step 4: 광고 컴포넌트 구현

```tsx
export default function KakaoAdBanner() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <ins
      className="kakao_ad_area"
      style={{ display: "none" }}
      data-ad-unit="DAN-XXXXXXXXXXXXXXXX"
      data-ad-width="320"
      data-ad-height="100"
    />
  );
}
```

---

## 📊 광고 배치 전략 (Free 플랜)

### 최소 방해 원칙

1. **배너 광고 (2개)**
   - 위치: 페이지 하단
   - 크기: 320x100 또는 반응형
   - 페이지: Today, Quiz, Flashcard, Review

2. **전면 광고 (선택적)**
   - 타이밍: 학습 완료 후에만
   - 빈도: 하루 1~2회 제한
   - 건너뛰기 버튼 제공

3. **금지 사항**
   - ❌ 팝업 광고
   - ❌ 학습 중 광고
   - ❌ 동영상 광고 (자동 재생)

---

## 🔍 심사 통과 팁

### 콘텐츠 품질

1. **충분한 콘텐츠**
   - 2,000단어 이상 (✅ 현재 충족)
   - 고유한 콘텐츠 (저작권 확인)

2. **사용자 경험**
   - 깔끔한 UI (✅)
   - 빠른 로딩 속도
   - 모바일 최적화 (✅ PWA)

3. **트래픽**
   - AdSense: 최소 요구 없음
   - 애드핏: 일 100 UV 권장

### 심사 기간

- **AdSense**: 1~3일
- **애드핏**: 1~2일

---

## ⚙️ 환경 변수 추가

```env
# .env
ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"
ADSENSE_SLOT_BANNER="1234567890"
ADSENSE_SLOT_INTERSTITIAL="0987654321"

# 또는 카카오 애드핏
KAKAO_ADFIT_UNIT="DAN-XXXXXXXXXXXXXXXX"
```

---

## 📈 수익 예상

### MAU 1,000명

- **AdSense**: 월 5~20만원
- **애드핏**: 월 10~30만원

### MAU 10,000명

- **AdSense**: 월 50~300만원
- **애드핏**: 월 100~500만원

*실제 수익은 eCPM, 노출수, 클릭률에 따라 변동

---

## ✅ 체크리스트

### 신청 전

- [ ] 콘텐츠 저작권 확인 완료
- [ ] 사이트 안정적으로 운영 중
- [ ] 개인정보처리방침 게시 (✅)
- [ ] 이용약관 게시 (✅)

### AdSense 신청

- [ ] Google AdSense 계정 생성
- [ ] 사이트 등록
- [ ] 확인 코드 삽입
- [ ] 심사 대기 (1~3일)
- [ ] 승인 후 광고 단위 생성
- [ ] AdBanner 컴포넌트 구현
- [ ] 광고 배치

### 애드핏 신청 (선택)

- [ ] 카카오 애드핏 계정 생성
- [ ] 사업자 정보 입력
- [ ] 사이트 등록
- [ ] 심사 대기 (1~2일)
- [ ] 승인 후 광고 단위 생성
- [ ] KakaoAdBanner 컴포넌트 구현
- [ ] 광고 배치

---

## 🚨 주의사항

1. **자가 클릭 금지**
   - 본인이 광고 클릭 시 계정 정지

2. **클릭 유도 금지**
   - "광고 클릭해주세요" 문구 금지

3. **광고 수정 금지**
   - 광고 코드 임의 수정 금지

4. **정책 준수**
   - AdSense 프로그램 정책 숙지
   - 애드핏 운영 정책 숙지

---

## 📞 문제 해결

### 심사 거부 시

1. 거부 이유 확인
2. 문제 해결 (콘텐츠/트래픽)
3. 2주 후 재신청

### 광고 안 나올 시

1. 확인 코드 정상 삽입 확인
2. 브라우저 콘솔 에러 확인
3. AdBlock 비활성화 테스트
4. 광고 단위 활성화 상태 확인

---

**작성일**: 2026-02-04  
**다음 단계**: 광고 플랫폼 승인 후 실제 연동 진행
