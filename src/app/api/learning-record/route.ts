import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// SM-2 알고리즘 - 반복 학습 간격 계산 (다음 복습일은 자정 기준)
function sm2(quality: number, repetitionCount: number, easeFactor: number, interval: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newRepCount: number;

  if (quality < 3) {
    newRepCount = 0;
    newInterval = 1;
  } else {
    newRepCount = repetitionCount + 1;
    if (newRepCount === 1) {
      newInterval = 1;
    } else if (newRepCount === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
    }
  }

  // Set nextReviewAt to the start of the target day (00:00:00)
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  nextReview.setHours(0, 0, 0, 0);

  return {
    repetitionCount: newRepCount,
    easeFactor: newEF,
    interval: newInterval,
    nextReviewAt: nextReview,
  };
}

// 학습 기록 생성 또는 갱신 후 일일 세션 카운트 업데이트
async function updateRecord(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  userId: number,
  contentType: string,
  contentId: number,
  quality: number,
) {
  const whereField =
    contentType === "word"
      ? { wordId: contentId }
      : contentType === "expression"
      ? { expressionId: contentId }
      : { grammarId: contentId };

  const existing = await prisma.learningRecord.findFirst({
    where: { userId, contentType, ...whereField },
  });

  if (existing) {
    const updated = sm2(quality, existing.repetitionCount, existing.easeFactor, existing.interval);
    await prisma.learningRecord.update({
      where: { id: existing.id },
      data: { ...updated, lastScore: quality, lastReviewedAt: new Date() },
    });
  } else {
    const initial = sm2(quality, 0, 2.5, 1);
    await prisma.learningRecord.create({
      data: { userId, contentType, ...whereField, ...initial, lastScore: quality },
    });
  }

  // Update daily session
  const today = new Date().toISOString().split("T")[0];
  const session = await prisma.dailySession.findFirst({
    where: { date: today, userId },
  });

  if (session) {
    await prisma.dailySession.update({
      where: { id: session.id },
      data: {
        wordsLearned: { increment: existing ? 0 : 1 },
        wordsReviewed: { increment: existing ? 1 : 0 },
      },
    });
  } else {
    await prisma.dailySession.create({
      data: {
        date: today,
        userId,
        wordsLearned: existing ? 0 : 1,
        wordsReviewed: existing ? 1 : 0,
      },
    });
  }
}

/** POST: 학습 기록 저장 및 SM-2 알고리즘으로 다음 복습일 계산 */
export async function POST(req: NextRequest) {
  const { lang, contentType, contentId, quality } = await req.json();

  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma: any = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);

    await updateRecord(prisma, user.id, contentType, contentId, quality);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Learning record error:", error);
    return NextResponse.json({ error: "기록 업데이트 실패" }, { status: 500 });
  }
}

// 복습 예정 수, 총 학습 수, 연속 학습일(스트릭) 조회
async function getStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  userId: number,
) {
  // Use end of today so that "due today" words are counted
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const reviewDue = await prisma.learningRecord.count({
    where: { userId, nextReviewAt: { lte: endOfToday } },
  });

  const totalLearned = await prisma.learningRecord.count({
    where: { userId },
  });

  const sessions = await prisma.dailySession.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
  });

  let streak = 0;
  const checkDate = new Date();
  for (const session of sessions) {
    const expected = checkDate.toISOString().split("T")[0];
    if (session.date === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { userId, reviewDue, totalLearned, streak };
}

/** GET: 사용자 학습 통계 조회 (복습 예정, 총 학습, 스트릭) */
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

    const result = await getStats(prisma, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Learning record GET error:", error);
    return NextResponse.json({ error: "데이터 조회 실패" }, { status: 500 });
  }
}
