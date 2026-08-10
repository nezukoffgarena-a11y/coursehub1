import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateId, generateOtp } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["admin", "student"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    if (body.role === "admin") {
      const admins = await sql`SELECT * FROM admins WHERE email = ${email}`;
      const admin = admins[0] as any;
      if (!admin || !(await bcrypt.compare(body.password, admin.password))) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = signToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin",
      });
      const res = NextResponse.json({ role: "admin", name: admin.name });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    const students = await sql`SELECT * FROM students WHERE email = ${email}`;
    const student = students[0] as any;
    if (!student || !(await bcrypt.compare(body.password, student.password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!student.is_verified) {
      return NextResponse.json(
        { error: "Please verify your email first", needsVerification: true },
        { status: 403 }
      );
    }

    const token = signToken({
      id: student.id,
      email: student.email,
      name: student.name,
      role: "student",
    });
    const res = NextResponse.json({ role: "student", name: student.name });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
