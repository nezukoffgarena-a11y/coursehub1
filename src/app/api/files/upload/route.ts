import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
};

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const contentType = req.headers.get("content-type") || "";
    const match = contentType.match(/boundary=(.*)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }
    const boundary = match[1].replace(/^"|"$/g, "");
    const buffer = Buffer.from(await req.arrayBuffer());

    const parts = buffer.toString("latin1").split(`--${boundary}`);

    let courseId = "";
    let filename = "";
    let mimeType = "";
    let fileData: Buffer | null = null;

    for (const part of parts) {
      const headerMatch = part.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]*)")?/);
      if (!headerMatch) continue;
      const name = headerMatch[1];
      const fname = headerMatch[2] || "";

      const headerEnd = part.indexOf("\r\n\r\n");
      if (headerEnd === -1) continue;
      const body = part.slice(headerEnd + 4);
      const cleanBody = body.endsWith("\r\n") ? body.slice(0, -2) : body;

      if (name === "courseId") {
        courseId = cleanBody.trim();
      } else if (name === "file") {
        filename = fname;
        const typeMatch = part.match(/Content-Type: (.+)\r\n/);
        mimeType = typeMatch ? typeMatch[1].trim() : "application/octet-stream";
        fileData = Buffer.from(cleanBody, "latin1");
      }
    }

    if (!courseId || !filename || !fileData) {
      return NextResponse.json({ error: "Missing file or courseId" }, { status: 400 });
    }

    const course = await sql`SELECT id FROM courses WHERE id = ${courseId}`;
    if (!course[0]) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const size = fileData.length;
    const ext = ALLOWED_TYPES[mimeType] || path.extname(filename).replace(".", "").slice(0, 10);
    const storedName = `${generateId()}.${ext}`;

    const blobUrl = await uploadFile(storedName, fileData, mimeType);

    await sql`
      INSERT INTO course_files (id, course_id, original_name, stored_name, mime_type, size)
      VALUES (${generateId()}, ${courseId}, ${filename}, ${blobUrl}, ${mimeType}, ${size})
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
