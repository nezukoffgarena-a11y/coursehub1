import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-bold text-primary">📚 CourseHub</div>
        <nav className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href={session.role === "admin" ? "/admin" : "/dashboard"}
                className="btn-primary"
              >
                {session.role === "admin" ? "Admin Panel" : "My Courses"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Free Video Courses for{" "}
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Every Student
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          High-quality video lessons with PDF materials. Register with your email,
          verify your account, and use your access code to start learning today.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn-primary !px-8 !py-3 !text-base">
            Get Started Free
          </Link>
          <Link href="/login" className="btn-outline !px-8 !py-3 !text-base">
            I have an account
          </Link>
        </div>
      </main>
    </div>
  );
}
