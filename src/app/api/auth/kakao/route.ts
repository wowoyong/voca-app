import { NextRequest, NextResponse } from "next/server";

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";

/** GET: 카카오 OAuth 인증 페이지로 리다이렉트 */
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
