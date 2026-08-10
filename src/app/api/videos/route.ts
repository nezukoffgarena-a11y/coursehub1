import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  embedCode: z.string().min(10),
  provider: z.string().default("embed"),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());

    const course = await sql`SELECT id FROM courses WHERE id = ${body.courseId}`;
    if (!course[0]) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as m FROM videos WHERE course_id = ${body.courseId}
    `;

    const id = generateId();
    await sql`
      INSERT INTO videos (id, course_id, title, embed_code, provider, sort_order)
      VALUES (${id}, ${body.courseId}, ${body.title}, ${body.embedCode}, ${body.provider}, ${Number(maxOrder[0].m) + 1})
    `;

    return NextResponse.json({ video: { id, ...body } }, { status: 201 });
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
