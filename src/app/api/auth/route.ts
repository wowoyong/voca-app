import { NextRequest, NextResponse } from "next/server";
import { createToken, getPin, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (pin !== getPin()) {
    return NextResponse.json({ error: "잘못된 PIN입니다" }, { status: 401 });
  }

  const token = await createToken();

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}
