"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { put } from "@vercel/blob/client";
import { Copy, FileText, GraduationCap, KeyRound, Link2, Plus, Trash2 } from "lucide-react";

type Video = {
  id: string;
  title: string;
  embedCode: string;
  provider: string;
};

type CourseFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
};

type Code = {
  id: string;
  code: string;
  usedBy: string | null;
  usedAt: string | null;
  usedByEmail?: string;
};

export default function ManageCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  const [videoForm, setVideoForm] = useState({ title: "", embedCode: "" });
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [addCodesCount, setAddCodesCount] = useState(10);
  const [addingCodes, setAddingCodes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "admin") {
        router.push("/login");
        return;
      }
      await load();
      setLoading(false);
    })();
  }, [router]);

  async function load() {
    const res = await fetch(`/api/courses/${params.id}`);
    const data = await res.json();
    setCourse(data.course);
    setVideos(data.videos || []);
    setFiles(data.files || []);
    setCodes(data.codes || []);
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    setVideoError("");
    setAddingVideo(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          title: videoForm.title,
          embedCode: videoForm.embedCode,
          provider: "embed",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVideoError(data.error);
      } else {
        setVideoForm({ title: "", embedCode: "" });
        await load();
      }
    } catch {
      setVideoError("Network error");
    } finally {
      setAddingVideo(false);
    }
  }

  async function handleDeleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      const ext = (file.name.split(".").pop() || "bin")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 10);
      const pathname = `${(crypto as any).randomUUID?.() || Math.random().toString(36).slice(2)}.${ext || "bin"}`;

      const tokenRes = await fetch("/api/files/upload-handler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) {
        setUploadError(tokenData.error || "Upload not authorized");
        return;
      }

      const blob = await put(pathname, file, {
        access: "private",
        token: tokenData.token,
        contentType: file.type || undefined,
        onUploadProgress: (progress) => setUploadProgress(progress.percentage),
      });

      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          blobUrl: blob.url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error);
      } else {
        await load();
      }
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Check the file type or size and try again.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(id: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleAddCodes() {
    setAddingCodes(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addCodes: addCodesCount }),
      });
      const data = await res.json();
      if (res.ok && data.codes) {
        alert(`Generated ${data.codes.length} codes:\n\n${data.codes.join("\n")}`);
        await load();
      }
    } catch {
    } finally {
      setAddingCodes(false);
    }
  }

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

  const usedCodes = codes.filter((c) => c.usedBy).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="btn-outline !border-transparent !bg-transparent !px-2 !py-1.5">
              ← Back
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-400">
                <GraduationCap className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-gray-900">
                Course<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>
          <button onClick={handleLogout} className="btn-outline !py-2 !text-xs">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{course?.title}</h1>
        <p className="mb-8 text-gray-500">
          {course?.videoCount} videos · {course?.fileCount} files · {usedCodes}/{codes.length} codes used
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Videos section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Videos</h2>
              <button onClick={() => setAddingVideo(!addingVideo)} className="btn-primary !py-1.5 !text-xs">
                <Plus className="mr-1 h-4 w-4" /> Add Video
              </button>
            </div>

            {addingVideo && (
              <form onSubmit={handleAddVideo} className="card mb-4 space-y-3 p-5">
                <div>
                  <label className="label">Video Title</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Lesson 1: Introduction"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Embed Code</label>
                  <textarea
                    required
                    className="input min-h-24 font-mono !text-xs"
                    placeholder="Paste the full iframe embed code from YouTube / Vimeo / Google Drive..."
                    value={videoForm.embedCode}
                    onChange={(e) => setVideoForm({ ...videoForm, embedCode: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Paste the &lt;iframe&gt; code you got from your video hosting provider.
                  </p>
                </div>
                {videoError && (
                  <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {videoError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={addingVideo} className="btn-primary flex-1">
                    {addingVideo ? "Adding..." : "Add Video"}
                  </button>
                  <button type="button" onClick={() => setAddingVideo(false)} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {videos.map((video, idx) => (
                <div key={video.id} className="card flex items-center gap-3 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{video.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete video"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {videos.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
                  No videos yet. Add your first video.
                </p>
              )}
            </div>
          </section>

          {/* Files section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Materials (PDF, etc.)</h2>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary !py-1.5 !text-xs">
                <Plus className="mr-1 h-4 w-4" />{" "}
                {uploading
                  ? uploadProgress !== null
                    ? `Uploading ${uploadProgress}%`
                    : "Uploading..."
                  : "Upload File"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {uploadError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {uploadError}
              </div>
            )}

            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="card flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{file.originalName}</p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  </div>
                  <a href={`/api/files/${file.id}`} target="_blank" className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-primary" title="View">
                    <Link2 className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {files.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
                  No files yet. Upload PDFs, slides, exercises...
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Access codes section */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Access Codes</h2>
              <p className="text-sm text-gray-500">
                Each code works for only one student. {usedCodes} of {codes.length} used.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={1000}
                value={addCodesCount}
                onChange={(e) => setAddCodesCount(Number(e.target.value))}
                className="input !w-24 !py-1.5"
              />
              <button onClick={handleAddCodes} disabled={addingCodes} className="btn-outline !py-1.5 !text-xs">
                <KeyRound className="mr-1 h-4 w-4" />
                {addingCodes ? "Generating..." : "Generate More"}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Used By</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tracking-wider text-gray-800">
                          {code.code}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(code.code)}
                          className="text-gray-400 transition hover:text-primary"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {code.usedBy ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                          Used
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {code.usedBy ? (
                        <span className="block text-xs text-gray-700">{code.usedByEmail}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {code.usedAt ? new Date(code.usedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                      No codes generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
