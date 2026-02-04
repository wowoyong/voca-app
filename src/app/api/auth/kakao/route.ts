import { NextRequest, NextResponse } from "next/server";

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";

export async function GET(req: NextRequest) {
  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!kakaoKey || !redirectUri) {
    return NextResponse.json(
      { error: "카카오 로그인 설정이 올바르지 않습니다" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: kakaoKey,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return NextResponse.redirect(`${KAKAO_AUTH_URL}?${params}`);
}
