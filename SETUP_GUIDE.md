# Wordio 설정 가이드

## ✅ 완료된 작업

### 1. 프로젝트명 변경
- ✅ package.json: wordio
- ✅ 페이지 타이틀: Wordio - 단어 학습
- ✅ 문서 업데이트 완료

### 2. 광고 설정
- ✅ 전면 광고: 광고 ID 없으면 자동 숨김
- ✅ 배너 광고: 광고 ID 없으면 자동 숨김
- ✅ 환경 변수 설정 완료

### 3. 도메인 설정
- ✅ URL: https://voca.greencatart.work
- ✅ Cloudflare Tunnel 연결됨
- ✅ PM2 실행 중

---

## ⏳ 사용자 액션 필요

### 1. 카카오 로그인 설정

**카카오 개발자 센터 (https://developers.kakao.com):**

#### Step 1: 플랫폼 등록


#### Step 2: Redirect URI 등록


#### Step 3: REST API 키 설정
[?1049h[1;24r[1;1H[J[7m  UW PICO 5.09                           New Buffer                             [27m[23;1H[K[24;1H[K[23;1H[7m^[27m[7mG[27m Get Help  [7m^[27m[7mO[27m WriteOut  [7m^[27m[7mR[27m Read File [7m^[27m[7mY[27m Prev Pg   [7m^[27m[7mK[27m Cut Text  [7m^[27m[7mC[27m Cur Pos   [K[24;1H[7m^[27m[7mX[27m Exit      [7m^[27m[7mJ[27m Justify   [7m^[27m[7mW[27m Where is  [7m^[27m[7mV[27m Next Pg   [7m^[27m[7mU[27m UnCut Text[7m^[27m[7mT[27m To Spell  [K[3;1H[22;1H                                                                                [22;35H[7m[ New file ][27m[1;1H[J[7m  UW PICO 5.09                           File: .env                             [27m[23;1H[K[24;1H[K[23;1H[7m^[27m[7mG[27m Get Help  [7m^[27m[7mO[27m WriteOut  [7m^[27m[7mR[27m Read File [7m^[27m[7mY[27m Prev Pg   [7m^[27m[7mK[27m Cut Text  [7m^[27m[7mC[27m Cur Pos   [K[24;1H[7m^[27m[7mX[27m Exit      [7m^[27m[7mJ[27m Justify   [7m^[27m[7mW[27m Where is  [7m^[27m[7mV[27m Next Pg   [7m^[27m[7mU[27m UnCut Text[7m^[27m[7mT[27m To Spell  [K[3;1H[23;1H[K[24;1H[K[?1049l

#### Step 4: 비즈앱 전환 (필수)


---

### 2. 아이콘 설정

**로컬 컴퓨터에서 실행:**



**복사 후 맥미니에서:**
 ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND  No package.json (or package.yaml, or package.json5) was found in "/Users/chojaeyong".

---

### 3. Kakao AdFit 광고 설정 (선택)

**AdFit 대시보드 (https://adfit.kakao.com):**

#### Step 1: 매체 등록


#### Step 2: 광고 단위 생성


#### Step 3: 광고 ID 설정
[?1049h[1;24r[1;1H[J[7m  UW PICO 5.09                           New Buffer                             [27m[23;1H[K[24;1H[K[23;1H[7m^[27m[7mG[27m Get Help  [7m^[27m[7mO[27m WriteOut  [7m^[27m[7mR[27m Read File [7m^[27m[7mY[27m Prev Pg   [7m^[27m[7mK[27m Cut Text  [7m^[27m[7mC[27m Cur Pos   [K[24;1H[7m^[27m[7mX[27m Exit      [7m^[27m[7mJ[27m Justify   [7m^[27m[7mW[27m Where is  [7m^[27m[7mV[27m Next Pg   [7m^[27m[7mU[27m UnCut Text[7m^[27m[7mT[27m To Spell  [K[3;1H[22;1H                                                                                [22;35H[7m[ New file ][27m[1;1H[J[7m  UW PICO 5.09                           File: .env                             [27m[23;1H[K[24;1H[K[23;1H[7m^[27m[7mG[27m Get Help  [7m^[27m[7mO[27m WriteOut  [7m^[27m[7mR[27m Read File [7m^[27m[7mY[27m Prev Pg   [7m^[27m[7mK[27m Cut Text  [7m^[27m[7mC[27m Cur Pos   [K[24;1H[7m^[27m[7mX[27m Exit      [7m^[27m[7mJ[27m Justify   [7m^[27m[7mW[27m Where is  [7m^[27m[7mV[27m Next Pg   [7m^[27m[7mU[27m UnCut Text[7m^[27m[7mT[27m To Spell  [K[3;1H[23;1H[K[24;1H[K[?1049l

---

## 🔍 테스트

### 1. 웹사이트 접속


### 2. 카카오 로그인 테스트
- 로그인 페이지에서 카카오로 시작하기 클릭
- 카카오 계정으로 로그인
- 앱 동의 화면 확인
- 메인 페이지로 리다이렉트 확인

### 3. 광고 확인 (AdFit 설정 후)
- 전면 광고: 첫 진입 시 5초간 표시
- 배너 광고: 하단 메뉴바 위에 고정

---

## 📊 현재 상태

| 항목 | 상태 |
|------|------|
| 프로젝트명 | ✅ Wordio |
| 도메인 | ✅ https://voca.greencatart.work |
| 빌드 | ✅ 성공 |
| PM2 | ✅ 실행 중 |
| 카카오 로그인 | ⏳ API 키 설정 필요 |
| 아이콘 | ⏳ 파일 업로드 필요 |
| 광고 | ⏳ AdFit 설정 필요 (선택) |

---

**생성일**: 2026-02-04  
**프로젝트**: Wordio (구 voca-app)
