import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache (clears on deploy)
const cache: Record<string, { text: string; ts: number }> = {};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "";
  const from = searchParams.get("from") || "zh";
  const to = searchParams.get("to") || "vi";

  if (!text.trim()) return NextResponse.json({ text: "" });

  const cacheKey = `${from}:${to}:${text}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < 86400000) {
    return NextResponse.json({ text: cache[cacheKey].text });
  }

  try {
    // MyMemory free translation API (no key needed, 5000 chars/day limit per IP)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      cache[cacheKey] = { text: translated, ts: Date.now() };
      return NextResponse.json({ text: translated });
    }

    // Fallback: return original text
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text });
  }
}
