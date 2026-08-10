import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { streamBlob, deleteFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const files = await sql`SELECT * FROM course_files WHERE id = ${params.id}`;
  const file = files[0] as any;
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const session = await getSession();
  const isAdmin = session?.role === "admin";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin) {
    const enrolled = await sql`
      SELECT id FROM enrollments WHERE student_id = ${session.id} AND course_id = ${file.course_id}
    `;
    if (enrolled.length === 0) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }
  }

  let upstream: Response;
  try {
    upstream = await streamBlob(file.stored_name);
    if (!upstream.ok) {
      console.error("Blob fetch failed:", upstream.status);
      return NextResponse.json({ error: "File missing on storage" }, { status: 404 });
    }
  } catch (e) {
    console.error("Blob stream failed:", e);
    return NextResponse.json({ error: "File missing on storage" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") || file.mime_type || "application/octet-stream"
  );
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(file.original_name)}"`
  );
  headers.set("Cache-Control", "no-store");

  return new NextResponse(upstream.body, { status: 200, headers });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const files = await sql`SELECT * FROM course_files WHERE id = ${params.id}`;
    const file = files[0] as any;
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await sql`DELETE FROM course_files WHERE id = ${params.id}`;
    try {
      await deleteFile(file.stored_name);
    } catch {}

    return NextResponse.json({ message: "File deleted" });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
