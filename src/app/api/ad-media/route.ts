import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idx = parseInt(searchParams.get("idx") || "0");

  const settings = await getAllSettings();

  // Try new format first, fall back to old key
  let raw = settings.ad_media;
  if (!raw || raw === "[]") {
    raw = settings.ad_images || "";
  }

  if (!raw || raw === "[]") {
    return new NextResponse("No media", { status: 404 });
  }

  try {
    const items = JSON.parse(raw);
    const item = items[idx];
    if (!item) return new NextResponse("Not found", { status: 404 });

    const data = typeof item === "string" ? item : item.data;

    // External URL — redirect
    if (data.startsWith("http")) {
      return NextResponse.redirect(data);
    }

    if (!data.startsWith("data:")) {
      return new NextResponse("Invalid", { status: 400 });
    }

    // Base64 data URL
    const matches = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return new NextResponse("Invalid format", { status: 400 });

    const mimeType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
