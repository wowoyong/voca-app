import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

/** GET: 현재 로그인된 사용자 정보 조회 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ username: user.username, webUserId: user.webUserId });
}
