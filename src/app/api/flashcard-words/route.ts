import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";
import { getAuthUser } from "@/lib/auth";
import { getOrCreateLanguageUser } from "@/lib/user";

// 배열 랜덤 셔플 (복습 모드용)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

/** GET: 플래시카드용 단어 조회 (today/review/all 모드) */
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";
  const mode = req.nextUrl.searchParams.get("mode") || "today";

  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma: any = lang === "jp" ? prismaJapanese : prismaEnglish;
    const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);

    let words;

    if (mode === "today") {
      // Get today's 15 words (same as today page)
      const todaySeed = getTodaySeed();
      
      const learnedWordRecords = await prisma.learningRecord.findMany({
        where: { userId: user.id, contentType: "word", wordId: { not: null } },
        select: { wordId: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const learnedWordIds = learnedWordRecords.map((r: any) => r.wordId!);

      const allNewWords = await prisma.word.findMany({
        where: learnedWordIds.length > 0 ? { id: { notIn: learnedWordIds } } : {},
        take: 100,
        orderBy: { difficulty: "asc" },
      });
      
      words = seededShuffle(allNewWords, todaySeed).slice(0, 15);

    } else if (mode === "review") {
      // Get random 15 words from learned vocabulary
      const learnedWordRecords = await prisma.learningRecord.findMany({
        where: { userId: user.id, contentType: "word", wordId: { not: null } },
        include: { word: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const learnedWords = learnedWordRecords.filter((r: any) => r.word).map((r: any) => r.word!);

      if (learnedWords.length === 0) {
        return NextResponse.json({ error: "학습한 단어가 없습니다" }, { status: 404 });
      }

      words = shuffle(learnedWords).slice(0, 15);

    } else {
      // Default: all words (for backward compatibility)
      const allWords = await prisma.word.findMany();
      const count = Math.min(parseInt(req.nextUrl.searchParams.get("count") || "20"), 50);
      words = shuffle(allWords).slice(0, count);
    }

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Flashcard words error:", error);
    return NextResponse.json({ error: "단어를 가져올 수 없습니다" }, { status: 500 });
  }
}
