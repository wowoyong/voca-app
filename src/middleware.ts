import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret"
);

const COOKIE_NAME = "voca-auth";

// 인증이 필요한 경로들
const PROTECTED_PATHS = [
  "/",
  "/today",
  "/flashcard",
  "/quiz",
  "/review",
  "/stats",
  "/settings",
  "/privacy",
  "/terms",
];

/** 인증 미들웨어 - 보호된 경로 접근 시 JWT 토큰 검증 후 미인증 시 로그인 리다이렉트 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 체크하지 않음 (각 API에서 자체 인증)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 로그인 페이지는 체크하지 않음
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 보호된 경로인지 확인
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    console.log("[Middleware] No token, redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 토큰 검증
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.log("[Middleware] Invalid token, redirecting to /login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, manifest)
     */
    "/((?!_next/static|_next/image|favicon|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|json)).*)",
  ],
};
