"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Plus, Settings, Film } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  videoCount: number;
  fileCount: number;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", numberOfCodes: 10 });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "admin") {
        router.push("/login");
        return;
      }
      await loadCourses();
      setLoading(false);
    })();
  }, [router]);

  async function loadCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data.courses || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          numberOfCodes: form.numberOfCodes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setGeneratedCodes(data.codes);
        setShowCreate(false);
        setForm({ title: "", description: "", numberOfCodes: 10 });
        await loadCourses();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
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
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-primary">
              📚 CourseHub
            </Link>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Admin
            </span>
          </div>
          <button onClick={handleLogout} className="btn-outline !py-1.5 !text-xs">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="mt-1 text-gray-500">
              Create courses, add videos and materials, manage access codes.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New Course
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-44 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card mx-auto max-w-md p-12 text-center">
            <Film className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-800">No courses yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Create your first course and start sharing knowledge.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="card overflow-hidden">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary to-indigo-400">
                  <Film className="h-12 w-12 text-white/80" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>{course.videoCount} videos</span>
                    <span>{course.fileCount} files</span>
                  </div>
                  <Link href={`/admin/course/${course.id}`} className="btn-primary mt-4 w-full">
                    <Settings className="mr-2 h-4 w-4" /> Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Create New Course</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Course Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. JavaScript for Beginners"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-20"
                  placeholder="What will students learn?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Number of Access Codes</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  className="input"
                  value={form.numberOfCodes}
                  onChange={(e) =>
                    setForm({ ...form, numberOfCodes: Number(e.target.value) })
                  }
                />
                <p className="mt-1 text-xs text-gray-400">
                  Each code can be used by only one student.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={creating} className="btn-primary w-full">
                {creating ? "Creating..." : "Create Course"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-outline w-full"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {generatedCodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-8">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <KeyRound className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Course Created!</h2>
              <p className="mt-1 text-sm text-gray-500">
                Share these access codes with your students. Each code works only once.
              </p>
            </div>
            <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-2">
                {generatedCodes.map((code, i) => (
                  <div
                    key={code}
                    className="rounded-md bg-white px-3 py-2 text-center font-mono text-sm font-bold tracking-wider text-primary border border-gray-200"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCodes.join("\n"));
              }}
              className="btn-outline w-full mb-2"
            >
              Copy All Codes
            </button>
            <button onClick={() => setGeneratedCodes([])} className="btn-primary w-full">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
