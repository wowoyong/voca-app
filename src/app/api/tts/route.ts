import { NextRequest, NextResponse } from "next/server";

/** GET: 텍스트를 음성으로 변환하여 MP3 오디오 반환 (Google TTS) */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  if (!text) {
    return NextResponse.json({ error: "text parameter required" }, { status: 400 });
  }

  try {
    const mod = await import("google-tts-api");
    const getAudioBase64 = mod.getAudioBase64 ?? mod.default?.getAudioBase64;

    const base64 = await getAudioBase64(text, {
      lang: lang === "jp" ? "ja" : "en",
      slow: false,
    });

    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS 생성 실패" }, { status: 500 });
  }
}
