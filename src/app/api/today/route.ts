import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// Seeded random number generator (consistent results for same seed)
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Shuffle function using seeded random
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Get today's date as seed (changes at 00:00)
function getTodaySeed(): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Convert date string to number seed
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTodayData(prisma: any, userId: number) {
  const now = new Date();
  const todaySeed = getTodaySeed();

  // Get learned word IDs
  const learnedWordRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", wordId: { not: null } },
    select: { wordId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedWordIds = learnedWordRecords.map((r: any) => r.wordId!);

  // ✅ Fetch MORE words and use seeded shuffle for consistent daily selection
  const allNewWords = await prisma.word.findMany({
    where: learnedWordIds.length > 0 ? { id: { notIn: learnedWordIds } } : {},
    take: 100, // Fetch 100 words for better variety
    orderBy: { difficulty: "asc" },
  });
  
  // ✅ Use seeded shuffle - same seed = same order for the day
  const newWords = seededShuffle(allNewWords, todaySeed).slice(0, 15);

  // Get review words (due for review)
  const reviewRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", nextReviewAt: { lte: now } },
    include: { word: true },
    take: 10,
    orderBy: { nextReviewAt: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewWords = reviewRecords.filter((r: any) => r.word).map((r: any) => r.word!);

  // ✅ Return all expected fields (expressions and grammar as empty arrays for now)
  return { 
    newWords, 
    reviewWords,
    newExpressions: [],
    reviewExpressions: [],
    grammar: []
  };
}

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const prisma = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);
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
