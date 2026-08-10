"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, FileText, PlayCircle } from "lucide-react";

type Course = {
  courseId: string;
  enrolledAt: string;
  title: string;
  description: string;
  videoCount: number;
  fileCount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "student") {
        router.push("/login");
        return;
      }
      setUser(meData.user);

      const res = await fetch("/api/my-courses");
      const data = await res.json();
      setCourses(data.enrolled || []);
      setLoading(false);
    })();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            📚 CourseHub
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              Hi, {user?.name}
            </span>
            <button onClick={handleLogout} className="btn-outline !py-1.5 !text-xs">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mb-8 text-gray-500">
          Courses you enrolled in with your access codes.
        </p>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-44 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card mx-auto max-w-md p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-800">No courses yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              You don&apos;t have any courses yet. Contact your instructor to get
              an access code.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.courseId} href={`/course/${course.courseId}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary to-indigo-400">
                  <PlayCircle className="h-12 w-12 text-white/80" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                    {course.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" /> {course.videoCount} videos
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-4 w-4" /> {course.fileCount} files
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
