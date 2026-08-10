"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  Sparkles,
  Video,
} from "lucide-react";

type Course = {
  courseId: string;
  enrolledAt: string;
  title: string;
  description: string;
  videoCount: number;
  fileCount: number;
};

const GRADIENTS = [
  "from-primary to-indigo-400",
  "from-violet-500 to-fuchsia-400",
  "from-sky-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
];

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

  const totalVideos = courses.reduce((sum, c) => sum + c.videoCount, 0);
  const totalFiles = courses.reduce((sum, c) => sum + c.fileCount, 0);

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: courses.length,
      gradient: "from-primary to-indigo-400",
    },
    {
      icon: Video,
      label: "Video Lessons",
      value: totalVideos,
      gradient: "from-violet-500 to-fuchsia-400",
    },
    {
      icon: FileText,
      label: "Materials",
      value: totalFiles,
      gradient: "from-sky-500 to-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 to-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome banner */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-500 px-8 py-10 shadow-xl shadow-indigo-500/20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-purple-400/20 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                <Sparkles className="h-4 w-4" /> Welcome back
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                Hi, {user?.name} 👋
              </h1>
              <p className="mt-2 text-indigo-100">
                Pick up where you left off and keep learning.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-lg transition hover:scale-[1.03] active:scale-[0.98]"
            >
              <LayoutDashboard className="h-4 w-4" /> Browse More Courses
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="card flex items-center gap-4 p-5">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-sm`}>
                    <s.icon className="h-6 w-6 text-white" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  My Courses
                </h2>
                <p className="mt-1 text-gray-500">
                  Courses you enrolled in with your access codes.
                </p>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="card mx-auto max-w-md p-12 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-gray-800">No courses yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You don&apos;t have any courses yet. Ask your instructor for an
                  access code to get started.
                </p>
                <Link href="/courses" className="btn-primary mt-6 w-full">
                  <BookOpen className="h-4 w-4" /> Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, idx) => (
                  <Link
                    key={course.courseId}
                    href={`/course/${course.courseId}`}
                    className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}>
                      <PlayCircle className="h-14 w-14 text-white/80 transition group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 transition group-hover:text-primary">
                        {course.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
                        {course.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <PlayCircle className="h-4 w-4 text-primary" /> {course.videoCount} videos
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-primary" /> {course.fileCount} files
                        </span>
                      </div>
                      <span className="btn-primary mt-5 w-full">
                        <PlayCircle className="h-4 w-4" /> Continue Learning
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
