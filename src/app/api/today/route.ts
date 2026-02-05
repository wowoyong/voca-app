import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// 시드 기반 난수 생성 (같은 시드면 같은 결과)
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 시드 기반 배열 셔플 (하루 동안 동일한 순서 유지)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 오늘 날짜를 시드 숫자로 변환 (자정에 변경)
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

// 오늘의 신규 단어 15개 + 복습 단어 10개 조회
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTodayData(prisma: any, userId: number) {
  const now = new Date();
  const todaySeed = getTodaySeed();

  console.log("[Today API] Getting data for userId:", userId);

  // Get learned word IDs
  const learnedWordRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", wordId: { not: null } },
    select: { wordId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedWordIds = learnedWordRecords.map((r: any) => r.wordId!);

  console.log("[Today API] Learned word IDs count:", learnedWordIds.length);

  // ✅ 신규 회원도 단어를 볼 수 있도록 수정
  // 학습하지 않은 단어 우선, 없으면 전체 단어에서 선택
  let allNewWords = await prisma.word.findMany({
    where: learnedWordIds.length > 0 ? { id: { notIn: learnedWordIds } } : {},
    take: 100,
    orderBy: { difficulty: "asc" },
  });

  console.log("[Today API] Unlearned words found:", allNewWords.length);

  // 학습하지 않은 단어가 없으면 전체 단어에서 선택
  if (allNewWords.length === 0) {
    console.log("[Today API] No unlearned words, fetching all words");
    allNewWords = await prisma.word.findMany({
      take: 100,
      orderBy: { difficulty: "asc" },
    });
    console.log("[Today API] All words found:", allNewWords.length);
  }
  
  // ✅ Use seeded shuffle - same seed = same order for the day
  const newWords = seededShuffle(allNewWords, todaySeed).slice(0, 15);

  console.log("[Today API] Selected new words:", newWords.length);

  // Get review words (due for review)
  const reviewRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", nextReviewAt: { lte: now } },
    include: { word: true },
    take: 10,
    orderBy: { nextReviewAt: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewWords = reviewRecords.filter((r: any) => r.word).map((r: any) => r.word!);

  console.log("[Today API] Review words:", reviewWords.length);

  return { 
    newWords, 
    reviewWords,
    newExpressions: [],
    reviewExpressions: [],
    grammar: []
  };
}

/** GET: 오늘의 학습 데이터 조회 (신규 단어, 복습 단어, 표현, 문법) */
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  console.log("[Today API] Request received for lang:", lang);

  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      console.log("[Today API] No auth user");
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    console.log("[Today API] Auth user:", { webUserId: authUser.webUserId, username: authUser.username });

    const prisma = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);

    console.log("[Today API] Language user:", { id: user.id, telegramId: user.telegramId.toString(), username: user.username });

    const data = await getTodayData(prisma, user.id);

    // bigint 값을 문자열로 변환하여 직렬화
    const serialize = (obj: unknown): unknown => {
      return JSON.parse(
        JSON.stringify(obj, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    const response = serialize({ userId: user.id, ...data });
    console.log("[Today API] Success, returning data");
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Today API] Error:", error);
    return NextResponse.json({ error: "데이터를 가져올 수 없습니다" }, { status: 500 });
  }
}
