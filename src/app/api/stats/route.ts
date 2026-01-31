import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";

const WEB_USER_TELEGRAM_ID = BigInt(9999999999);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchStats(prisma: any) {
  const user = await prisma.user.findUnique({
    where: { telegramId: WEB_USER_TELEGRAM_ID },
  });

  if (!user) {
    return { calendar: [], quizAccuracy: 0, totalQuizzes: 0 };
  }

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const dateStr = threeMonthsAgo.toISOString().split("T")[0];

  const sessions = await prisma.dailySession.findMany({
    where: { userId: user.id, date: { gte: dateStr } },
    orderBy: { date: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendar = sessions.map((s: any) => ({
    date: s.date,
    count: s.wordsLearned + s.wordsReviewed,
  }));

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
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
    const prisma = lang === "jp" ? prismaJapanese : prismaEnglish;
    const result = await fetchStats(prisma);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "통계를 가져올 수 없습니다" }, { status: 500 });
  }
}
