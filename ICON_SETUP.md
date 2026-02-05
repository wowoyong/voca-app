# 아이콘 설정 가이드

## 현재 상태
아이콘 파일이 맥미니에 없습니다. 로컬 컴퓨터에서 업로드가 필요합니다.

---

## 방법 1: SCP로 파일 복사 (추천)

**로컬 컴퓨터 터미널에서:**

```bash
# Wordio.jpg를 맥미니로 복사
scp ~/Downloads/Wordio.jpg mac-mini-ts:/Users/jojaeyong/WebstormProjects/voca-app/public/icon.jpg
```

---

## 방법 2: 직접 업로드

1. 파일 관리자로 맥미니 접속
2. `/Users/jojaeyong/WebstormProjects/voca-app/public/` 폴더로 이동
3. Wordio.jpg를 icon.jpg로 이름 변경하여 복사

---

## 아이콘 설정 완료 후

**맥미니에서 실행:**

```bash
ssh mac-mini-ts
cd /Users/jojaeyong/WebstormProjects/voca-app

# 1. 아이콘 파일 확인
ls -lh public/icon.jpg

# 2. Next.js 아이콘 설정 (자동으로 처리됨)
# public/icon.jpg가 있으면 Next.js가 자동으로 favicon으로 사용

# 3. 빌드 및 재시작
pnpm build
pm2 restart voca-app

# 4. 브라우저에서 확인
# https://voca.greencatart.work
# 브라우저 탭에 아이콘이 표시됩니다
```

---

## Next.js 아이콘 규칙

Next.js 15는 다음 파일을 자동으로 favicon으로 인식합니다:

- `/app/icon.png` (권장)
- `/app/icon.jpg`
- `/app/icon.ico`
- `/public/favicon.ico` (레거시)

**현재 설정:**
- 파일 위치: `/public/icon.jpg`
- 자동 변환: Next.js가 빌드 시 최적화

---

## 문제 해결

### 아이콘이 표시되지 않을 때

1. **브라우저 캐시 삭제**
   - Chrome: Ctrl+Shift+Delete
   - 하드 새로고침: Ctrl+Shift+R

2. **파일 확인**
   ```bash
   ssh mac-mini-ts ls -lh /Users/jojaeyong/WebstormProjects/voca-app/public/icon.jpg
   ```

3. **빌드 로그 확인**
   ```bash
   ssh mac-mini-ts pm2 logs voca-app --lines 50
   ```

---

**참고**: 아이콘 파일이 없어도 앱은 정상 작동합니다. 브라우저 기본 아이콘이 표시됩니다.
