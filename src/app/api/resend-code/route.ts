import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateId, generateOtp } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mail";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const students = await sql`SELECT * FROM students WHERE email = ${email}`;
    const student = students[0] as any;

    if (!student || student.is_verified) {
      return NextResponse.json(
        { error: "Student not found or already verified" },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    await sql`
      INSERT INTO email_verifications (id, student_id, code, expires_at)
      VALUES (${generateId()}, ${student.id}, ${otp}, ${new Date(Date.now() + 15 * 60 * 1000).toISOString()})
    `;

    try {
      await sendVerificationEmail(student.email, student.name, otp);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json({
      message: "New verification code sent",
      studentId: student.id,
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
