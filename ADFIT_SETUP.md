# Kakao AdFit 설정 가이드

**목적**: Voca-App에 Kakao AdFit 광고 연동하기

---

## 1단계: AdFit 계정 생성 및 앱 등록

### 1.1 AdFit 가입
1. https://adfit.kakao.com 접속
2. 카카오 계정으로 로그인
3. 사업자 정보 입력 (개인 또는 사업자)
   - 개인: 주민등록번호 앞자리, 이름
   - 사업자: 사업자등록번호

### 1.2 앱 등록
1. 대시보드 → **앱 관리** → **앱 추가**
2. 정보 입력:
   - **앱 이름**: Wordio
   - **플랫폼**: 웹사이트
   - **사이트 URL**: http://192.168.0.34:3005 (또는 실제 도메인)
   - **카테고리**: 교육 > 외국어/어학
   - **설명**: 영어와 일본어 학습을 위한 단어 암기 웹 애플리케이션
3. 앱 등록 완료 → **앱 키** 발급됨

---

## 2단계: 광고 단위 생성

### 2.1 배너 광고 생성
1. 앱 관리 → 등록한 앱 선택 → **광고 단위 관리**
2. **광고 단위 추가** 클릭
3. 설정:
   - **광고 단위 이름**: Voca 하단 배너
   - **광고 유형**: 배너
   - **광고 크기**: 320x50 (모바일 기본)
4. 생성 완료 → **광고 단위 ID** 복사 (예: DAN-xxxxx)

### 2.2 전면 광고 생성
1. **광고 단위 추가** 클릭
2. 설정:
   - **광고 단위 이름**: Voca 전면 광고
   - **광고 유형**: 전면
   - **광고 크기**: 전면형 (자동 조정)
3. 생성 완료 → **광고 단위 ID** 복사

---

## 3단계: .env 파일 업데이트

맥미니에서 .env 파일 수정:



다음 내용 추가:

XPC_SERVICE_NAME=0
__CF_USER_TEXT_ENCODING=0x0:3:51
SHLVL=2
TERM_FEATURES=T3CwLrMSc7UUw9Ts3BFGsSyHNoSxF
__CFBundleIdentifier=com.googlecode.iterm2
SHELL=/bin/zsh
TERMINFO_DIRS=/Applications/iTerm.app/Contents/Resources/terminfo:/usr/share/terminfo
XPC_FLAGS=0x0
COLORTERM=truecolor
LOGNAME=chojaeyong
OPENAI_API_KEY=YOUR_KEY_HERE
TMPDIR=/var/folders/5h/gp_k9qmd65v6s78pt9ssgpj00000gn/T/
NVM_DIR=/Users/chojaeyong/.nvm
TERM=xterm-256color
SSH_AUTH_SOCK=/private/tmp/com.apple.launchd.a5rZTF5aF2/Listeners
USER=chojaeyong
PATH=/Users/chojaeyong/.bun/bin:/Users/chojaeyong/.opencode/bin:/Users/chojaeyong/.npm-global/bin:/Users/chojaeyong/.codeium/windsurf/bin:/opt/homebrew/bin:/Users/chojaeyong/.nvm/versions/node/v21.7.3/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/opt/pmk/env/global/bin:/opt/homebrew/bin:/Applications/iTerm.app/Contents/Resources/utilities
NVM_BIN=/Users/chojaeyong/.nvm/versions/node/v21.7.3/bin
LC_TERMINAL_VERSION=3.6.6
AGENT=1
ITERM_SESSION_ID=w0t1p0:3A42F387-A19A-469F-87B9-DAE2CA032DD1
LC_TERMINAL=iTerm2
TERM_PROGRAM_VERSION=3.6.6
OLDPWD=/Users/chojaeyong
NODE_EXTRA_CA_CERTS=/opt/homebrew/etc/ca-certificates/cert.pem
HOME=/Users/chojaeyong
COLORFGBG=15;0
NVM_CD_FLAGS=-q
PWD=/Users/chojaeyong
OSLogRateLimit=64
TERM_SESSION_ID=w0t1p0:3A42F387-A19A-469F-87B9-DAE2CA032DD1
NVM_INC=/Users/chojaeyong/.nvm/versions/node/v21.7.3/include/node
BUN_INSTALL=/Users/chojaeyong/.bun
COMMAND_MODE=unix2003
SECURITYSESSIONID=18786
ITERM_PROFILE=Default
TERM_PROGRAM=iTerm.app
DEEPSEEK_API=http://100.111.209.30:11434/api/generate
LaunchInstanceID=676693F0-3061-4743-AEAF-A6EEA76D159F
OPENCODE=1
LANG=ko_KR.UTF-8
_=/usr/bin/env

**주의**: NEXT_PUBLIC_ 접두사는 필수! (클라이언트 사이드에서 접근 가능)

---

## 4단계: 광고 구현 (자동 완료됨)

다음 단계에서 자동으로 구현됩니다:
- ✅ 배너 광고 컴포넌트 (하단 고정)
- ✅ 전면 광고 컴포넌트 (페이지 진입 시)
- ✅ 광고 로드 및 표시 로직

---

## 5단계: 테스트

### 5.1 로컬 테스트
1. PM2 재시작: ssh mac-mini-ts pm2 restart voca-app
2. 브라우저에서 http://192.168.0.34:3005 접속
3. 확인 사항:
   - 하단에 배너 광고 표시되는지
   - 페이지 진입 시 전면 광고 표시되는지 (5초 후 자동 닫힘)

### 5.2 AdFit 대시보드 확인
1. https://adfit.kakao.com → 리포트
2. 노출수, 클릭수 확인 (실시간 반영 약 1-2시간 소요)

---

## 예상 수익

| 일간 사용자 | 노출수 | 예상 수익 (월) |
|-----------|--------|---------------|
| 10명      | 300회  | ₩3,000 - ₩5,000 |
| 100명     | 3,000회 | ₩30,000 - ₩50,000 |
| 1,000명   | 30,000회 | ₩300,000 - ₩500,000 |

**CPM**: ₩100 - ₩300 (1,000회 노출당)

---

## 문제 해결

### 광고가 표시되지 않을 때
1. 브라우저 콘솔에서 에러 확인
2. AdFit 광고 단위 ID가 정확한지 확인
3. .env 파일의 NEXT_PUBLIC_ 접두사 확인
4. PM2 재시작 여부 확인

### 승인 거부될 때
- 앱 정보 보완 (상세한 설명 추가)
- 사이트 접근 가능 여부 확인
- 정책 위반 사항 확인 (음란물, 도박 등)

---

**다음 단계**: 광고 컴포넌트 구현 (자동 진행)
