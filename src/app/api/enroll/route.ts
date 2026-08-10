import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { decryptCode } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  courseId: z.string(),
  code: z.string().min(1).max(30),
});

export async function POST(req: NextRequest) {
  try {
    const student = await requireStudent();
    const body = schema.parse(await req.json());
    const enteredCode = body.code.trim().toUpperCase();

    const courses = await sql`SELECT * FROM courses WHERE id = ${body.courseId}`;
    if (!courses[0]) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrolled = await sql`
      SELECT id FROM enrollments WHERE student_id = ${student.id} AND course_id = ${body.courseId}
    `;
    if (enrolled.length > 0) {
      return NextResponse.json(
        { error: "You already have access to this course" },
        { status: 400 }
      );
    }

    const accessCodes = await sql`
      SELECT * FROM access_codes WHERE course_id = ${body.courseId}
    `;

    let matched: any = null;
    for (const codeRow of accessCodes) {
      try {
        if (decryptCode(codeRow.encrypted_code) === enteredCode) {
          matched = codeRow;
          break;
        }
      } catch {}
    }

    if (!matched) {
      return NextResponse.json({ error: "Invalid course code" }, { status: 400 });
    }

    if (matched.used_by) {
      return NextResponse.json(
        { error: "This code has already been used by another student" },
        { status: 409 }
      );
    }

    const claimed = await sql`
      UPDATE access_codes SET used_by = ${student.id}, used_at = ${new Date().toISOString()}
      WHERE id = ${matched.id} AND used_by IS NULL
      RETURNING id
    `;

    if (claimed.length === 0) {
      return NextResponse.json(
        { error: "This code has already been used by another student" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO enrollments (id, student_id, course_id, code)
      VALUES (${generateId()}, ${student.id}, ${body.courseId}, ${enteredCode})
    `;

    return NextResponse.json({ message: "Enrolled successfully" });
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
