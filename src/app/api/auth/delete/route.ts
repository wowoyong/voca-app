import { NextRequest, NextResponse } from "next/server";
import { prismaAuth } from "@/lib/db-auth";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // Delete from auth database
    // Note: English/Japanese DBs use telegramId, not webUserId
    // Web users don't have data in those DBs unless they've used the app
    // For now, we only delete the auth record
    await prismaAuth.webUser.delete({
      where: { id: authUser.webUserId },
    });

    const response = NextResponse.json({ message: "회원 탈퇴가 완료되었습니다" });
    response.cookies.delete("voca-auth");

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "회원 탈퇴 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
