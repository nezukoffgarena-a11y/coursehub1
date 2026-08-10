import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { courseId, blobUrl, filename, mimeType, size } = body;

    if (
      !courseId ||
      !blobUrl ||
      !filename ||
      typeof size !== "number" ||
      size <= 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await sql`SELECT id FROM courses WHERE id = ${courseId}`;
    if (!course[0]) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await sql`
      INSERT INTO course_files (id, course_id, original_name, stored_name, mime_type, size)
      VALUES (${generateId()}, ${courseId}, ${filename}, ${blobUrl}, ${mimeType || "application/octet-stream"}, ${size})
    `;

    return NextResponse.json({ message: "File uploaded" }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
