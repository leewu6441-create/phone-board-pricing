import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idx = parseInt(searchParams.get("idx") || "0");

  const settings = await getAllSettings();

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

    // External URL — directly pass through (video elements use this directly now)
    if (data.startsWith("http")) {
      return NextResponse.redirect(data);
    }

    // Base64 data URL
    if (!data.startsWith("data:")) {
      return new NextResponse("Invalid", { status: 400 });
    }

    const matches = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return new NextResponse("Invalid format", { status: 400 });

    const mimeType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, "base64");

    // For videos, use chunked streaming to handle larger files
    if (mimeType.startsWith("video/")) {
      const CHUNK_SIZE = 64 * 1024; // 64KB chunks
      const stream = new ReadableStream({
        start(controller) {
          let offset = 0;
          function push() {
            if (offset >= buffer.length) {
              controller.close();
              return;
            }
            const end = Math.min(offset + CHUNK_SIZE, buffer.length);
            controller.enqueue(buffer.subarray(offset, end));
            offset = end;
            // Small delay to avoid overwhelming the connection
            setTimeout(push, 0);
          }
          push();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    // Images: return directly
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
