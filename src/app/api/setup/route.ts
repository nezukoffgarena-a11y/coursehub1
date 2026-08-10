import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existing = await sql`SELECT id FROM admins WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 200 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO admins (id, email, password, name)
      VALUES (${generateId()}, ${email}, ${hash}, 'Admin')
    `;

    return NextResponse.json({ message: "Admin created" }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error", detail: String(e?.message || e) }, { status: 500 });
  }
}
