# 카카오 소셜 로그인 구현 가이드

Next.js 15 App Router에서 카카오 OAuth 2.0을 사용한 소셜 로그인 구현 방법

## 📋 사전 준비

### 1. 카카오 개발자 애플리케이션 등록

1. [카카오 개발자 사이트](https://developers.kakao.com/) 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름, 회사명 입력 후 생성

### 2. 플랫폼 설정

**내 애플리케이션 → 앱 설정 → 플랫폼**

- **Web 플랫폼 등록**: `http://localhost:3005` (개발)
- 프로덕션: 실제 도메인 등록 (예: `https://voca-app.example.com`)

### 3. Redirect URI 설정

**제품 설정 → 카카오 로그인 → Redirect URI 등록**

```
http://localhost:3005/api/auth/kakao/callback
```

프로덕션:
```
https://voca-app.example.com/api/auth/kakao/callback
```

### 4. 동의 항목 설정

**제품 설정 → 카카오 로그인 → 동의 항목**

필수 동의:
- ✅ **닉네임** (필수 동의)
- ✅ **프로필 이미지** (선택 동의)
- ✅ **카카오계정(이메일)** (선택 동의)

### 5. API 키 확인

**내 애플리케이션 → 앱 키**

- **REST API 키**: `abc123...` (사용할 키)
- JavaScript 키: (웹에서 사용)
- Native 앱 키: (앱에서 사용)

---

## 🔧 구현 단계

### Step 1: 환경 변수 설정

`.env` 파일에 추가:

```env
KAKAO_REST_API_KEY="your-rest-api-key-from-kakao-dev"
KAKAO_REDIRECT_URI="http://localhost:3005/api/auth/kakao/callback"
# KAKAO_CLIENT_SECRET="" # 선택사항 (보안 강화 시)
```

### Step 2: 로그인 버튼 추가

`src/app/login/page.tsx` 수정:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 기존 로그인 로직
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/");
    }
  };

  const handleKakaoLogin = () => {
    // 카카오 OAuth 페이지로 리다이렉트
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!)}`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>

        {/* 기존 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button type="submit" className="w-full bg-blue-500 text-white rounded py-2">
            로그인
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="px-3 text-sm text-gray-500">또는</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          className="w-full bg-[#FEE500] text-[#000000] rounded py-2 font-semibold flex items-center justify-center gap-2"
        >
          <img
            src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
            alt="Kakao"
            className="w-5 h-5"
          />
          카카오 로그인
        </button>
      </div>
    </div>
  );
}
```

### Step 3: 환경 변수 타입 정의

`next.config.ts` 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
    NEXT_PUBLIC_KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
  },
};

export default nextConfig;
```

### Step 4: 카카오 콜백 API 라우트 생성

`src/app/api/auth/kakao/callback/route.ts` 생성:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prismaAuth } from "@/lib/db-auth";
import { createToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

interface KakaoUser {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

async function getKakaoToken(code: string): Promise<KakaoTokenResponse | null> {
  try {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY!,
        redirect_uri: process.env.KAKAO_REDIRECT_URI!,
        code,
      }),
    });

    if (!response.ok) {
      console.error("Kakao token error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Get Kakao token failed:", error);
    return null;
  }
}

async function getKakaoUser(accessToken: string): Promise<KakaoUser | null> {
  try {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Kakao user info error:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Get Kakao user failed:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    console.error("Kakao OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=kakao_auth_failed", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    // 1. Exchange code for access token
    const tokenData = await getKakaoToken(code);
    if (!tokenData) {
      return NextResponse.redirect(new URL("/login?error=token_failed", req.url));
    }

    // 2. Get user info from Kakao
    const kakaoUser = await getKakaoUser(tokenData.access_token);
    if (!kakaoUser) {
      return NextResponse.redirect(new URL("/login?error=user_info_failed", req.url));
    }

    // 3. Create or find user in our database
    const username = `kakao_${kakaoUser.id}`;
    const nickname = kakaoUser.kakao_account?.profile?.nickname || username;

    let webUser = await prismaAuth.webUser.findUnique({
      where: { username },
    });

    if (!webUser) {
      // Create new user (no password needed for OAuth users)
      const bcrypt = await import("bcryptjs");
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      webUser = await prismaAuth.webUser.create({
        data: {
          username,
          passwordHash: randomPassword, // Placeholder (user can't login with password)
        },
      });
    }

    // 4. Create JWT token
    const token = await createToken({
      webUserId: webUser.id,
      username: nickname, // Use Kakao nickname for display
    });

    // 5. Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // 6. Redirect to home
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Kakao login error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
```

### Step 5: 기존 인증 스키마 확장 (선택)

카카오 사용자 정보를 저장하고 싶다면:

`prisma/schema-auth.prisma` 수정:

```prisma
model WebUser {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  
  // 카카오 정보 (선택)
  kakaoId      BigInt?  @unique
  nickname     String?
  profileImage String?
  email        String?
  
  createdAt    DateTime @default(now())
}
```

마이그레이션:
```bash
pnpm prisma migrate dev --schema=prisma/schema-auth.prisma --name add-kakao-fields
pnpm prisma:generate
```

---

## 🔄 OAuth 2.0 Flow

```
1. 사용자가 "카카오 로그인" 버튼 클릭
   ↓
2. 카카오 인증 페이지로 리다이렉트
   https://kauth.kakao.com/oauth/authorize?
     response_type=code&
     client_id={REST_API_KEY}&
     redirect_uri={REDIRECT_URI}
   ↓
3. 사용자가 카카오에서 로그인 및 동의
   ↓
4. 카카오가 우리 서버로 리다이렉트 (code 전달)
   http://localhost:3005/api/auth/kakao/callback?code=abc123...
   ↓
5. 서버에서 code를 access_token으로 교환
   POST https://kauth.kakao.com/oauth/token
   ↓
6. access_token으로 사용자 정보 조회
   GET https://kapi.kakao.com/v2/user/me
   ↓
7. DB에 사용자 생성 or 조회
   ↓
8. JWT 토큰 생성 및 쿠키 설정
   ↓
9. 홈페이지로 리다이렉트
```

---

## 🧪 테스트

### 로컬 테스트

1. `.env` 파일에 카카오 API 키 설정
2. 개발 서버 실행: `pnpm dev`
3. `http://localhost:3005/login` 접속
4. "카카오 로그인" 버튼 클릭
5. 카카오 계정으로 로그인
6. 로그인 성공 후 홈페이지로 리다이렉트 확인

### 디버깅

콘솔 로그 확인:
```bash
# 서버 로그
pnpm dev

# PM2 로그
pm2 logs voca-app
```

---

## 🚨 주의사항

### 보안

1. **REST API Key 노출 금지**
   - 클라이언트에서 사용 시 `NEXT_PUBLIC_` 접두사 필요
   - 서버에서만 사용하는 값은 `NEXT_PUBLIC_` 없이

2. **Redirect URI 제한**
   - 카카오 개발자 사이트에 등록된 URI만 허용
   - 프로덕션 배포 시 도메인 업데이트 필수

3. **HTTPS 사용 (프로덕션)**
   - 로컬 개발: HTTP 허용
   - 프로덕션: HTTPS 필수

### 사용자 경험

1. **에러 메시지 표시**
   - 로그인 실패 시 사용자에게 명확한 메시지 제공

2. **로딩 상태**
   - 카카오 인증 진행 중 로딩 표시

3. **계정 연결**
   - 기존 계정과 카카오 계정 연결 기능 (선택)

---

## 📚 참고 자료

- [카카오 로그인 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [카카오 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [OAuth 2.0 스펙](https://oauth.net/2/)

---

## 🐛 문제 해결

### "redirect_uri mismatch" 에러

→ 카카오 개발자 사이트에 등록된 Redirect URI와 코드의 URI가 일치하는지 확인

### "invalid_client" 에러

→ REST API Key가 올바른지 확인

### 사용자 정보를 가져올 수 없음

→ 동의 항목 설정 확인 (닉네임 필수 동의)

---

**구현 완료 후**: 
- `SETUP.md` 파일에 카카오 로그인 설정 추가
- README.md에 기능 추가 명시
