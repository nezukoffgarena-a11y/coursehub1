"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, PlayCircle } from "lucide-react";

type Video = {
  id: string;
  title: string;
  embedCode: string;
  provider: string;
  sortOrder: number;
};

type CourseFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch(`/api/courses/${params.id}/access`);
      if (res.status === 403 || res.status === 401) {
        router.push("/courses");
        return;
      }
      const data = await res.json();
      setCourse(data.course);
      setVideos(data.videos || []);
      setFiles(data.files || []);
      if (data.videos?.length) setActiveVideo(data.videos[0]);
      setLoading(false);
    })();
  }, [params.id, router]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-sm font-medium text-gray-500 hover:text-primary">
              ← Courses
            </Link>
            <span className="text-xl font-bold text-primary">📚 CourseHub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">Hi, {user?.name}</span>
            <button onClick={handleLogout} className="btn-outline !py-1.5 !text-xs">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{course?.title}</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeVideo ? (
              <div className="card overflow-hidden">
                <div className="aspect-video bg-black">
                  <div
                    className="h-full w-full"
                    dangerouslySetInnerHTML={{ __html: activeVideo.embedCode }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900">
                    {activeVideo.title}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="card flex h-64 flex-col items-center justify-center text-center">
                <PlayCircle className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No videos in this course yet.</p>
              </div>
            )}

            <h3 className="mb-3 mt-8 text-lg font-semibold text-gray-900">
              Course Lessons
            </h3>
            <div className="space-y-2">
              {videos.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    activeVideo?.id === video.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">
                    {video.title}
                  </span>
                  <PlayCircle className="h-5 w-5 text-gray-400" />
                </button>
              ))}
              {videos.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
                  Lessons will be added soon.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Course Materials
            </h3>
            <div className="card divide-y divide-gray-100">
              {files.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-400">
                  No files uploaded yet.
                </p>
              )}
              {files.map((file) => (
                <a
                  key={file.id}
                  href={`/api/files/${file.id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">Download</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
