import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateId, generateCode } from "@/lib/utils";
import { encryptCode } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  numberOfCodes: z.number().min(1).max(1000).default(10),
});

export async function GET() {
  const courses = await sql`
    SELECT c.*,
      (SELECT COUNT(*)::int FROM videos v WHERE v.course_id = c.id) as "videoCount",
      (SELECT COUNT(*)::int FROM course_files f WHERE f.course_id = c.id) as "fileCount"
    FROM courses c ORDER BY c.created_at DESC
  `;
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = schema.parse(await req.json());

    const courseId = generateId();
    await sql`
      INSERT INTO courses (id, title, description, created_by)
      VALUES (${courseId}, ${body.title}, ${body.description || ""}, ${admin.id})
    `;

    const codes: string[] = [];
    for (let i = 0; i < body.numberOfCodes; i++) {
      let code = generateCode();
      while ((await sql`SELECT id FROM access_codes WHERE code = ${code}`).length > 0) {
        code = generateCode();
      }
      codes.push(code);
      await sql`
        INSERT INTO access_codes (id, course_id, code, encrypted_code)
        VALUES (${generateId()}, ${courseId}, ${code}, ${encryptCode(code)})
      `;
    }

    return NextResponse.json({ courseId, codes }, { status: 201 });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
