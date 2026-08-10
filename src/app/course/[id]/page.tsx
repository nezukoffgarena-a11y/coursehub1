"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { BookOpen, Download, FileText, ListVideo, PlayCircle } from "lucide-react";

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

  useEffect(() => {
    (async () => {
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

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 to-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-primary"
        >
          ← Browse Courses
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 shadow-md shadow-indigo-500/20">
            <BookOpen className="h-6 w-6 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {course?.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {videos.length} lessons · {files.length} materials
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeVideo ? (
              <div className="card overflow-hidden shadow-lg shadow-indigo-500/10">
                <div className="aspect-video bg-black">
                  <div
                    className="h-full w-full"
                    dangerouslySetInnerHTML={{ __html: activeVideo.embedCode }}
                  />
                </div>
                <div className="flex items-start gap-3 border-t border-gray-100 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <PlayCircle className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Now Playing
                    </p>
                    <h2 className="mt-0.5 font-bold text-gray-900">
                      {activeVideo.title}
                    </h2>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex h-64 flex-col items-center justify-center text-center">
                <PlayCircle className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No videos in this course yet.</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <ListVideo className="h-5 w-5 text-primary" /> Course Lessons
              </h3>
              <div className="space-y-2.5">
                {videos.map((video, idx) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                      activeVideo?.id === video.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-gray-200 bg-white hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                        activeVideo?.id === video.id
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {activeVideo?.id === video.id ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium text-gray-800">
                      {video.title}
                    </span>
                  </button>
                ))}
                {videos.length === 0 && (
                  <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
                    Lessons will be added soon.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-primary" /> Course Materials
            </h3>
            <div className="card divide-y divide-gray-100 overflow-hidden">
              {files.length === 0 && (
                <p className="p-8 text-center text-sm text-gray-400">
                  No files uploaded yet.
                </p>
              )}
              {files.map((file) => (
                <a
                  key={file.id}
                  href={`/api/files/${file.id}`}
                  className="group flex items-center gap-3 p-4 transition hover:bg-primary/5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 transition group-hover:bg-red-100">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Download className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
