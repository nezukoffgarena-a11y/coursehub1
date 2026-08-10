import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await requireStudent();

    const enrollments = await sql`
      SELECT * FROM enrollments WHERE student_id = ${student.id} AND course_id = ${params.id}
    `;
    if (enrollments.length === 0) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

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
      SELECT id, title, embed_code as "embedCode", provider, sort_order as "sortOrder"
      FROM videos WHERE course_id = ${params.id}
      ORDER BY sort_order, created_at
    `;

    const files = await sql`
      SELECT id, original_name as "originalName", mime_type as "mimeType", size, created_at
      FROM course_files WHERE course_id = ${params.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ course, videos, files });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
