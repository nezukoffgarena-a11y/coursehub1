import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";
import { generateId, generateCode } from "@/lib/utils";
import { encryptCode } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  addCodes: z.number().min(1).max(1000).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const courses = await sql`
    SELECT c.*,
      (SELECT COUNT(*)::int FROM videos v WHERE v.course_id = c.id) as "videoCount",
      (SELECT COUNT(*)::int FROM course_files f WHERE f.course_id = c.id) as "fileCount"
    FROM courses c WHERE c.id = ${params.id}
  `;
  const course = courses[0];
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const videos = await sql`
    SELECT id, title, embed_code as "embedCode", provider, sort_order as "sortOrder", created_at
    FROM videos WHERE course_id = ${params.id}
    ORDER BY sort_order, created_at
  `;
  const files = await sql`
    SELECT id, original_name as "originalName", mime_type as "mimeType", size, created_at
    FROM course_files WHERE course_id = ${params.id}
    ORDER BY created_at DESC
  `;
  const codes = await sql`
    SELECT ac.id, ac.code, ac.used_by as "usedBy", ac.used_at as "usedAt", ac.created_at,
      s.email as "usedByEmail", s.name as "usedByName"
    FROM access_codes ac
    LEFT JOIN students s ON s.id = ac.used_by
    WHERE ac.course_id = ${params.id}
    ORDER BY ac.created_at DESC
  `;

  const usedCount = codes.filter((c: any) => c.used_by).length;

  return NextResponse.json({ course, videos, files, codes, usedCount });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());

    if (body.title !== undefined || body.description !== undefined) {
      const existing = await sql`
        SELECT title, description FROM courses WHERE id = ${params.id}
      `;
      if (!existing[0]) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      await sql`
        UPDATE courses SET title = ${body.title ?? existing[0].title},
          description = ${body.description ?? existing[0].description}
        WHERE id = ${params.id}
      `;
    }

    if (body.addCodes) {
      const course = await sql`SELECT id FROM courses WHERE id = ${params.id}`;
      if (!course[0]) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      const codes: string[] = [];
      for (let i = 0; i < body.addCodes; i++) {
        let code = generateCode();
        while ((await sql`SELECT id FROM access_codes WHERE code = ${code}`).length > 0) {
          code = generateCode();
        }
        codes.push(code);
        await sql`
          INSERT INTO access_codes (id, course_id, code, encrypted_code)
          VALUES (${generateId()}, ${params.id}, ${code}, ${encryptCode(code)})
        `;
      }
      return NextResponse.json({ codes });
    }

    return NextResponse.json({ message: "Course updated" });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const files = await sql`
      SELECT stored_name FROM course_files WHERE course_id = ${params.id}
    `;

    await sql`DELETE FROM courses WHERE id = ${params.id}`;

    for (const file of files as any[]) {
      try {
        await deleteFile(file.stored_name);
      } catch {}
    }

    return NextResponse.json({ message: "Course deleted" });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
