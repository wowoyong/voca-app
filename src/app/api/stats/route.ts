import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchStats(prisma: any, userId: number) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const dateStr = threeMonthsAgo.toISOString().split("T")[0];

  const sessions = await prisma.dailySession.findMany({
    where: { userId, date: { gte: dateStr } },
    orderBy: { date: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendar = sessions.map((s: any) => ({
    date: s.date,
    count: s.wordsLearned + s.wordsReviewed,
    todayCompleted: s.todayCompleted || false,
    reviewCompleted: s.reviewCompleted || false,
    quizCompleted: s.quizCompleted || false,
  }));

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
  });

  const totalQuizzes = quizAttempts.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const correctCount = quizAttempts.filter((q: any) => q.isCorrect).length;
  const quizAccuracy = totalQuizzes > 0 ? (correctCount / totalQuizzes) * 100 : 0;

  return { calendar, quizAccuracy, totalQuizzes };
}

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma: any = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);

    const result = await fetchStats(prisma, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "통계를 가져올 수 없습니다" }, { status: 500 });
  }
}
