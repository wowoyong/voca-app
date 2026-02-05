import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret"
);

const COOKIE_NAME = "voca-auth";

interface AuthPayload {
  webUserId: number;
  username: string;
}

/** JWT 토큰 생성 - 30일 만료 기간으로 서명 */
export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

/** JWT 토큰 유효성 검증 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** 쿠키에서 JWT 토큰을 읽어 인증된 사용자 정보 반환 */
export async function getAuthUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.webUserId && payload.username) {
      return {
        webUserId: payload.webUserId as number,
        username: payload.username as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** 현재 요청이 인증된 상태인지 확인 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export { COOKIE_NAME };
