import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// 배열 랜덤 셔플
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 복습 대상 단어와 표현 조회 (오늘까지 복습 예정인 항목)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getReviewData(prisma: any, userId: number) {
  // End of today (23:59:59) in server timezone
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1) Words due for review (nextReviewAt <= end of today)
  const dueRecords = await prisma.learningRecord.findMany({
    where: {
      userId,
      contentType: "word",
      wordId: { not: null },
      nextReviewAt: { lte: endOfToday },
    },
    include: { word: true },
    orderBy: { nextReviewAt: "asc" },
    take: 30,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueWords = dueRecords.filter((r: any) => r.word).map((r: any) => r.word!);

  // 2) Expression reviews
  const dueExprRecords = await prisma.learningRecord.findMany({
    where: {
      userId,
      contentType: "expression",
      expressionId: { not: null },
      nextReviewAt: { lte: endOfToday },
    },
    include: { expression: true },
    orderBy: { nextReviewAt: "asc" },
    take: 10,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueExpressions = dueExprRecords.filter((r: any) => r.expression).map((r: any) => r.expression!);

  return {
    reviewWords: shuffle(dueWords),
    reviewExpressions: shuffle(dueExpressions),
  };
}

/** GET: 복습 대상 단어/표현 조회 (단어 최대 30개, 표현 최대 10개) */
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

    const data = await getReviewData(prisma, user.id);

    // bigint 값을 문자열로 변환하여 직렬화
    const serialize = (obj: unknown): unknown => {
      return JSON.parse(
        JSON.stringify(obj, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    return NextResponse.json(serialize(data));
  } catch (error) {
    console.error("[Review API] Error:", error);
    return NextResponse.json({ error: "복습 데이터를 가져올 수 없습니다" }, { status: 500 });
  }
}
