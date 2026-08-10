"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, PlayCircle, FileText } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  videoCount: number;
  fileCount: number;
};

export default function BrowsePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data.courses || []);
      setLoading(false);

      if (meData.user?.role === "student") {
        const myRes = await fetch("/api/my-courses");
        const myData = await myRes.json();
        setEnrolledIds((myData.enrolled || []).map((c: any) => c.courseId));
      }
    })();
  }, []);

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "student") {
      setError("Please login as a student to enroll.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: modalCourse!.id, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setEnrolledIds([...enrolledIds, modalCourse!.id]);
        setModalCourse(null);
        setCode("");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary">
            📚 CourseHub
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:block">
                  Hi, {user.name}
                </span>
                {user.role === "admin" ? (
                  <Link href="/admin" className="btn-primary !py-1.5 !text-xs">
                    Admin Panel
                  </Link>
                ) : (
                  <Link href="/dashboard" className="btn-primary !py-1.5 !text-xs">
                    My Courses
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-outline !py-1.5 !text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary !py-1.5 !text-xs">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Browse Courses</h1>
        <p className="mb-8 text-gray-500">
          Pick a course and enter your access code to start learning.
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-52 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card mx-auto max-w-md p-12 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No courses yet</h2>
            <p className="mt-2 text-sm text-gray-500">Courses will appear here soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div key={course.id} className="card overflow-hidden">
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary to-indigo-400">
                    <PlayCircle className="h-12 w-12 text-white/80" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {course.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" /> {course.videoCount} videos
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" /> {course.fileCount} files
                      </span>
                    </div>
                    <div className="mt-4">
                      {isEnrolled ? (
                        <Link
                          href={`/course/${course.id}`}
                          className="btn-primary w-full"
                        >
                          Open Course
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setModalCourse(course);
                            setCode("");
                            setError("");
                          }}
                          className="btn-outline w-full"
                        >
                          Enter Access Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{modalCourse.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your access code to enroll
              </p>
            </div>
            <form onSubmit={handleEnroll} className="space-y-4">
              <input
                type="text"
                required
                className="input text-center !text-xl !tracking-widest uppercase"
                placeholder="ACCESS CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? "Checking..." : "Enroll Now"}
              </button>
              <button
                type="button"
                onClick={() => setModalCourse(null)}
                className="btn-outline w-full"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
