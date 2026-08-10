import { NextResponse } from "next/server";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 300 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { pathname } = await req.json();
    if (!pathname || typeof pathname !== "string") {
      return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
    }

    const token = await generateClientTokenFromReadWriteToken({
      pathname,
      maximumSizeInBytes: MAX_SIZE,
      allowedContentTypes: [
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/*",
        "image/*",
        "video/*",
        "audio/*",
        "application/octet-stream",
      ],
      validUntil: Date.now() + 60 * 60 * 1000,
      addRandomSuffix: false,
    });

    return NextResponse.json({ token });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
