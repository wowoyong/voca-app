import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, language } = body as {
      date: string;
      type: "today" | "review" | "quiz";
      language: "en" | "jp";
    };

    if (!date || !type || !language) {
      return NextResponse.json(
        { error: "Missing required fields: date, type, language" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma: any = language === "jp" ? prismaJapanese : prismaEnglish;
    const languageUser = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);

    // Get or create DailySession
    let session = await prisma.dailySession.findUnique({
      where: {
        date_userId: {
          date,
          userId: languageUser.id,
        },
      },
    });

    if (!session) {
      session = await prisma.dailySession.create({
        data: {
          date,
          userId: languageUser.id,
          wordsLearned: 0,
          wordsReviewed: 0,
        },
      });
    }

    // Update completion field based on type
    const updateData: Record<string, boolean> = {};
    if (type === "today") {
      updateData.todayCompleted = true;
    } else if (type === "review") {
      updateData.reviewCompleted = true;
    } else if (type === "quiz") {
      updateData.quizCompleted = true;
    }

    const updated = await prisma.dailySession.update({
      where: { id: session.id },
      data: updateData,
    });

    console.log(`[DailySession] ${type} completed for ${date}, userId: ${languageUser.id}`);

    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    console.error("[DailySession Complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to update completion status" },
      { status: 500 }
    );
  }
}
