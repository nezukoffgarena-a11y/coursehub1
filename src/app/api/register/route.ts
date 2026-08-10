import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateId, generateOtp } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const existing = await sql`SELECT id FROM students WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    const id = generateId();
    const hash = await bcrypt.hash(body.password, 10);
    const otp = generateOtp();

    await sql`
      INSERT INTO students (id, email, password, name, is_verified)
      VALUES (${id}, ${email}, ${hash}, ${body.name}, false)
    `;

    await sql`
      INSERT INTO email_verifications (id, student_id, code, expires_at)
      VALUES (${generateId()}, ${id}, ${otp}, ${new Date(Date.now() + 15 * 60 * 1000).toISOString()})
    `;

    try {
      await sendVerificationEmail(body.email, body.name, otp);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json({
      message: "Registration successful. Verification code sent to your email.",
      studentId: id,
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
