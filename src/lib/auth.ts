import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "course-platform-secret";
const COOKIE_NAME = "cp_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
};

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireStudent(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export { COOKIE_NAME };
