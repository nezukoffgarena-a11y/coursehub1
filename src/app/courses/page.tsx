"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  KeyRound,
  Lock,
  PlayCircle,
  Search,
} from "lucide-react";

type Course = {
  id: string;
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
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

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
  const [query, setQuery] = useState("");

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

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 to-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Browse Courses
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Pick a course and enter your access code to start learning instantly.
          </p>
          <div className="relative mx-auto mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input !pl-10"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card mx-auto max-w-md p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-800">
              {query ? "No courses match your search" : "No courses yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {query
                ? "Try a different keyword."
                : "Courses will appear here soon."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, idx) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div
                    className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}`}
                  >
                    <PlayCircle className="h-14 w-14 text-white/80 transition group-hover:scale-110" />
                    {isEnrolled && (
                      <span className="badge absolute left-3 top-3 bg-white/95 text-green-600 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                      </span>
                    )}
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
                    <div className="mt-5">
                      {isEnrolled ? (
                        <Link href={`/course/${course.id}`} className="btn-primary w-full">
                          <PlayCircle className="h-4 w-4" /> Open Course
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
                          <KeyRound className="h-4 w-4" /> Enter Access Code
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 shadow-md shadow-indigo-500/30">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">{modalCourse.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your access code to enroll
              </p>
            </div>
            <form onSubmit={handleEnroll} className="space-y-4">
              <input
                type="text"
                required
                className="input text-center !text-xl !tracking-widest uppercase !font-mono"
                placeholder="ACCESS CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
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
