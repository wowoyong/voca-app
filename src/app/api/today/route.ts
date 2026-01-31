import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";

const WEB_USER_TELEGRAM_ID = BigInt(9999999999);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateUser(prisma: any) {
  let user = await prisma.user.findUnique({
    where: { telegramId: WEB_USER_TELEGRAM_ID },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: WEB_USER_TELEGRAM_ID,
        chatId: BigInt(0),
        username: "web-user",
        firstName: "Web",
        updatedAt: new Date(),
      },
    });
  }
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTodayData(prisma: any, userId: number) {
  const now = new Date();

  const learnedWordRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", wordId: { not: null } },
    select: { wordId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedWordIds = learnedWordRecords.map((r: any) => r.wordId!);

  const newWords = await prisma.word.findMany({
    where: learnedWordIds.length > 0 ? { id: { notIn: learnedWordIds } } : {},
    take: 12,
    orderBy: { difficulty: "asc" },
  });

  const reviewRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", nextReviewAt: { lte: now } },
    include: { word: true },
    take: 3,
    orderBy: { nextReviewAt: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewWords = reviewRecords.filter((r: any) => r.word).map((r: any) => r.word!);

  const learnedExprRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "expression", expressionId: { not: null } },
    select: { expressionId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedExprIds = learnedExprRecords.map((r: any) => r.expressionId!);

  const newExpressions = await prisma.expression.findMany({
    where: learnedExprIds.length > 0 ? { id: { notIn: learnedExprIds } } : {},
    take: 4,
    orderBy: { difficulty: "asc" },
  });

  const reviewExprRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "expression", nextReviewAt: { lte: now } },
    include: { expression: true },
    take: 1,
    orderBy: { nextReviewAt: "asc" },
  });
  const reviewExpressions = reviewExprRecords
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.expression)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => r.expression!);

  const learnedGrammarRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "grammar", grammarId: { not: null } },
    select: { grammarId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedGrammarIds = learnedGrammarRecords.map((r: any) => r.grammarId!);

  const newGrammar = await prisma.grammarPoint.findMany({
    where: learnedGrammarIds.length > 0 ? { id: { notIn: learnedGrammarIds } } : {},
    take: 1,
    orderBy: { difficulty: "asc" },
  });

  return { newWords, reviewWords, newExpressions, reviewExpressions, grammar: newGrammar };
}

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  try {
    const prisma = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateUser(prisma);
    const data = await getTodayData(prisma, user.id);

    const serialize = (obj: unknown): unknown => {
      return JSON.parse(
        JSON.stringify(obj, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    return NextResponse.json(serialize({ userId: user.id, ...data }));
  } catch (error) {
    console.error("Today API error:", error);
    return NextResponse.json({ error: "데이터를 가져올 수 없습니다" }, { status: 500 });
  }
}
