import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

export async function GET() {
  try {
    const student = await requireStudent();

    const enrolled = await sql`
      SELECT e.course_id as "courseId", e.enrolled_at as "enrolledAt", c.title, c.description, c.thumbnail,
        (SELECT COUNT(*)::int FROM videos v WHERE v.course_id = c.id) as "videoCount",
        (SELECT COUNT(*)::int FROM course_files f WHERE f.course_id = c.id) as "fileCount"
      FROM enrollments e JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ${student.id}
      ORDER BY e.enrolled_at DESC
    `;

    return NextResponse.json({ enrolled });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
