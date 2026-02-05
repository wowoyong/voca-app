import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // Get from English DB (both DBs should have same settings)
    const user = await getOrCreateLanguageUser(prismaEnglish, authUser.webUserId, authUser.username);

    return NextResponse.json({
      dailyTime: user.dailyTime || "08:00",
      timezone: user.timezone || "Asia/Seoul",
      isActive: user.isActive ?? true,
    });
  } catch (error) {
    console.error("[Notification Time GET] Error:", error);
    return NextResponse.json({ error: "시간 조회 실패" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const body = await req.json();
    const { dailyTime, isActive } = body as { 
      dailyTime?: string; 
      isActive?: boolean;
    };

    // Validate dailyTime if provided
    if (dailyTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(dailyTime)) {
      return NextResponse.json(
        { error: "올바른 시간 형식이 아닙니다 (HH:MM)" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: { dailyTime?: string; isActive?: boolean } = {};
    if (dailyTime !== undefined) {
      updateData.dailyTime = dailyTime;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "업데이트할 데이터가 없습니다" },
        { status: 400 }
      );
    }

    // Update both English and Japanese DBs
    const enUser = await getOrCreateLanguageUser(prismaEnglish, authUser.webUserId, authUser.username);
    const jpUser = await getOrCreateLanguageUser(prismaJapanese, authUser.webUserId, authUser.username);

    await Promise.all([
      prismaEnglish.user.update({
        where: { id: enUser.id },
        data: updateData,
      }),
      prismaJapanese.user.update({
        where: { id: jpUser.id },
        data: updateData,
      }),
    ]);

    console.log(`[Notification Settings] Updated for user ${authUser.webUserId}:`, updateData);

    return NextResponse.json({ success: true, ...updateData });
  } catch (error) {
    console.error("[Notification Time POST] Error:", error);
    return NextResponse.json({ error: "설정 저장 실패" }, { status: 500 });
  }
}
