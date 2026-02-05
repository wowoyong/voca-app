import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

/** POST: 로그아웃 처리 (인증 쿠키 만료) */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
