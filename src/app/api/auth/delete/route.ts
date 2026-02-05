import { NextRequest, NextResponse } from "next/server";
import { prismaAuth } from "@/lib/db-auth";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  console.log("[Delete Account] Request received");
  
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      console.log("[Delete Account] No auth user - 401");
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    console.log("[Delete Account] User:", { webUserId: authUser.webUserId, username: authUser.username });

    // Delete from auth database
    await prismaAuth.webUser.delete({
      where: { id: authUser.webUserId },
    });

    console.log("[Delete Account] User deleted successfully");

    const response = NextResponse.json({ message: "회원 탈퇴가 완료되었습니다" });
    response.cookies.delete("voca-auth");

    return response;
  } catch (error) {
    console.error("[Delete Account] Error:", error);
    return NextResponse.json({ error: "회원 탈퇴 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
