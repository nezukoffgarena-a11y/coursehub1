import Link from "next/link";
import { GraduationCap, PlayCircle, ShieldCheck, Ticket } from "lucide-react";

const perks = [
  { icon: PlayCircle, text: "High-quality video lessons on any device" },
  { icon: Ticket, text: "Instant access with a single use code" },
  { icon: ShieldCheck, text: "Free for all students, no credit card needed" },
];

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative px-12 py-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap className="h-6 w-6 text-white" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Course<span className="text-indigo-200">Hub</span>
            </span>
          </Link>
        </div>

        <div className="relative px-12">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white">
            Your gateway to free, high-quality courses
          </h2>
          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-indigo-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-12 py-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm italic leading-relaxed text-indigo-100">
              &ldquo;The easiest way to share knowledge with my students — videos and
              materials all in one place.&rdquo;
            </p>
            <p className="mt-3 text-sm font-semibold text-white">CourseHub Teacher</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-gradient-to-b from-indigo-50/60 to-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-400">
                <GraduationCap className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-gray-900">
                Course<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-2 text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
