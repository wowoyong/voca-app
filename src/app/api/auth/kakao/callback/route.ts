import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prismaAuth } from "@/lib/db-auth";

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  
  if (!code) {
    return NextResponse.json({ error: "인증 코드가 없습니다" }, { status: 400 });
  }

  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!kakaoKey || !redirectUri || !jwtSecret) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  try {
    const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: kakaoKey,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const userResponse = await fetch(KAKAO_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const userData = await userResponse.json();
    const kakaoId = userData.id.toString();
    const nickname = userData.properties?.nickname || `kakao_${kakaoId}`;

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
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ 
      userId: user.id, 
      username: user.username 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("voca-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Kakao login error:", error);
    return NextResponse.redirect(new URL("/login?error=kakao", req.url));
  }
}
