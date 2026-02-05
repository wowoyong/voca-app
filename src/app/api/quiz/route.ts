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

// 시드 기반 난수 생성 (오늘의 단어용)
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 시드 기반 배열 셔플
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 오늘 날짜를 시드 숫자로 변환
function getTodaySeed(): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 오늘의 학습 단어 15개 조회 (시드 기반 고정 순서)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTodayWords(prisma: any, userId: number) {
  const todaySeed = getTodaySeed();

  const learnedWordRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", wordId: { not: null } },
    select: { wordId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedWordIds = learnedWordRecords.map((r: any) => r.wordId!);

  const allNewWords = await prisma.word.findMany({
    where: learnedWordIds.length > 0 ? { id: { notIn: learnedWordIds } } : {},
    take: 100,
    orderBy: { difficulty: "asc" },
  });
  
  return seededShuffle(allNewWords, todaySeed).slice(0, 15);
}

// 학습 완료된 단어 중 랜덤 15개 조회 (복습용)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getReviewWords(prisma: any, userId: number) {
  const learnedWordRecords = await prisma.learningRecord.findMany({
    where: { userId, contentType: "word", wordId: { not: null } },
    include: { word: true },
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const learnedWords = learnedWordRecords.filter((r: any) => r.word).map((r: any) => r.word!);
  
  if (learnedWords.length === 0) {
    return [];
  }
  
  return shuffle(learnedWords).slice(0, 15);
}

// 단어 목록으로 4지선다 퀴즈 문제 생성
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateQuiz(prisma: any, lang: string, words: any[]) {
  if (words.length < 4) {
    return null;
  }

  const allWordsData = await prisma.word.findMany();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = words.map((word: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrongOptions = shuffle(allWordsData.filter((w: any) => w.id !== word.id)).slice(0, 3);
    const options = shuffle([
      { id: word.id, text: word.korean },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...wrongOptions.map((w: any) => ({ id: w.id, text: w.korean })),
    ]);

    const questionText = lang === "jp" ? word.japanese : word.english;

    return {
      wordId: word.id,
      question: questionText,
      ttsText: questionText,
      correctId: word.id,
      options,
    };
  });

  return questions;
}

/** GET: 퀴즈 문제 생성 및 반환 (today/review/all 모드) */
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";
  const mode = req.nextUrl.searchParams.get("mode") || "all";

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma: any = lang === "jp" ? prismaJapanese : prismaEnglish;
    
    let words;
    
    if (mode === "today" || mode === "review") {
      const authUser = await getAuthUser();
      if (!authUser) {
        return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
      }
      
      const user = await getOrCreateLanguageUser(prisma, authUser.webUserId, authUser.username);
      
      if (mode === "today") {
        words = await getTodayWords(prisma, user.id);
      } else {
        words = await getReviewWords(prisma, user.id);
        if (words.length === 0) {
          return NextResponse.json({ error: "복습할 단어가 없습니다" }, { status: 400 });
        }
      }
    } else {
      // 기본 동작: 모든 단어 중 랜덤
      const count = Math.min(parseInt(req.nextUrl.searchParams.get("count") || "10"), 20);
      const allWordsData = await prisma.word.findMany();
      words = shuffle(allWordsData).slice(0, count);
    }

    const questions = await generateQuiz(prisma, lang, words);

    if (!questions) {
      return NextResponse.json({ error: "퀴즈를 위한 단어가 부족합니다" }, { status: 400 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json({ error: "퀴즈를 생성할 수 없습니다" }, { status: 500 });
  }
}
