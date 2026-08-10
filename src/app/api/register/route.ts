import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

    await sql`
      INSERT INTO students (id, email, password, name, is_verified)
      VALUES (${id}, ${email}, ${hash}, ${body.name}, true)
    `;

    const token = signToken({
      id,
      email,
      name: body.name,
      role: "student",
    });
    const res = NextResponse.json({
      message: "Registration successful",
      role: "student",
      name: body.name,
    });
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
