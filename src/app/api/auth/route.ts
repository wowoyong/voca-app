import { NextRequest, NextResponse } from "next/server";
import { createToken, COOKIE_NAME } from "@/lib/auth";
import { prismaAuth } from "@/lib/db-auth";
import bcrypt from "bcryptjs";

// 응답에 인증 쿠키 설정
function setCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

/** POST: 회원가입 또는 로그인 처리 (action 값에 따라 분기) */
export async function POST(req: NextRequest) {
  const { action, username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요" }, { status: 400 });
  }

  if (username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: "아이디는 2~20자여야 합니다" }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다" }, { status: 400 });
  }

  try {
    if (action === "register") {
      const existing = await prismaAuth.webUser.findUnique({
        where: { username },
      });
      if (existing) {
        return NextResponse.json({ error: "이미 사용 중인 아이디입니다" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prismaAuth.webUser.create({
        data: { username, passwordHash },
      });

      const token = await createToken({ webUserId: user.id, username: user.username });
      const res = NextResponse.json({ success: true, username: user.username });
      setCookie(res, token);
      return res;
    }

    // Default: login
    const user = await prismaAuth.webUser.findUnique({
      where: { username },
    });
    if (!user) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
    }

    // Check if this is a Kakao user (no password)
    if (!user.passwordHash) {
      return NextResponse.json({ error: "카카오 계정으로 가입된 사용자입니다. 카카오 로그인을 이용해주세요" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
    }

    const token = await createToken({ webUserId: user.id, username: user.username });
    const res = NextResponse.json({ success: true, username: user.username });
    setCookie(res, token);
    return res;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "인증 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
