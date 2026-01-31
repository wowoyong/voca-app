import { NextRequest, NextResponse } from "next/server";
import { prismaEnglish } from "@/lib/db-english";
import { prismaJapanese } from "@/lib/db-japanese";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateQuiz(prisma: any, lang: string, count: number) {
  const allWords = await prisma.word.findMany();
  if (allWords.length < 4) {
    return null;
  }

  const shuffled = shuffle(allWords);
  const questionWords = shuffled.slice(0, Math.min(count, shuffled.length));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = questionWords.map((word: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrongOptions = shuffle(allWords.filter((w: any) => w.id !== word.id)).slice(0, 3);
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

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "en";
  const count = Math.min(parseInt(req.nextUrl.searchParams.get("count") || "10"), 20);

  try {
    const prisma = lang === "jp" ? prismaJapanese : prismaEnglish;
    const questions = await generateQuiz(prisma, lang, count);

    if (!questions) {
      return NextResponse.json({ error: "퀴즈를 위한 단어가 부족합니다" }, { status: 400 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json({ error: "퀴즈를 생성할 수 없습니다" }, { status: 500 });
  }
}
