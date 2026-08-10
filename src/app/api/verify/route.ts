import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  studentId: z.string(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const students = await sql`SELECT * FROM students WHERE id = ${body.studentId}`;
    const student = students[0];
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.is_verified) {
      return NextResponse.json(
        { error: "Account already verified" },
        { status: 400 }
      );
    }

    const verifications = await sql`
      SELECT * FROM email_verifications
      WHERE student_id = ${body.studentId} AND code = ${body.code} AND used = false
      ORDER BY created_at DESC LIMIT 1
    `;
    const verification = verifications[0];

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired" },
        { status: 400 }
      );
    }

    await sql`UPDATE students SET is_verified = true WHERE id = ${body.studentId}`;
    await sql`UPDATE email_verifications SET used = true WHERE id = ${verification.id}`;

    return NextResponse.json({ message: "Account verified successfully" });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
