import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prismaAuth } from "@/lib/db-auth";

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

/** GET: 카카오 로그인 콜백 처리 (토큰 교환, 사용자 생성/조회, JWT 발급) */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  
  if (!code) {
    return NextResponse.json({ error: "인증 코드가 없습니다" }, { status: 400 });
  }

  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  const kakaoSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://voca.greencatart.work";

  if (!kakaoKey || !redirectUri || !jwtSecret) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: kakaoKey,
      redirect_uri: redirectUri,
      code,
    });

    // Client Secret이 있으면 추가
    if (kakaoSecret) {
      tokenParams.append("client_secret", kakaoSecret);
    }

    console.log("[Kakao Token Request]", {
      client_id: kakaoKey,
      redirect_uri: redirectUri,
      has_secret: !!kakaoSecret,
      code: code.substring(0, 10) + "...",
    });

    const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("[Kakao Token Error]", tokenData);
      return NextResponse.redirect(`${appUrl}/login?error=kakao`);
    }

    console.log("[Kakao Token Success]");

    const accessToken = tokenData.access_token;

    const userResponse = await fetch(KAKAO_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error("[Kakao User Info Error]", errorData);
      return NextResponse.redirect(`${appUrl}/login?error=kakao`);
    }

    const userData = await userResponse.json();
    const kakaoId = userData.id.toString();
    const nickname = userData.properties?.nickname || `kakao_${kakaoId}`;

    console.log("[Kakao User]", { kakaoId, nickname });

    let user = await prismaAuth.webUser.findUnique({
      where: { kakaoId },
    });

    if (!user) {
      let username = nickname;
      let counter = 1;
      
      while (await prismaAuth.webUser.findUnique({ where: { username } })) {
        username = `${nickname}_${counter}`;
        counter++;
      }

      user = await prismaAuth.webUser.create({
        data: {
          kakaoId,
          username,
          passwordHash: null,
        },
      });

      console.log("[New User Created]", { username });
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ 
      webUserId: user.id, 
      username: user.username 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    console.log("[Login Success]", { username: user.username });

    const response = NextResponse.redirect(`${appUrl}/`);
    response.cookies.set("voca-auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Kakao login error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=kakao`);
  }
}
