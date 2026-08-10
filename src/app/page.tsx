import { getSession } from "@/lib/auth";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  BookOpen,
  FileText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Video,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  const features = [
    {
      icon: Video,
      title: "Video Lessons",
      description: "Watch high-quality video lessons from any device, at your own pace.",
    },
    {
      icon: FileText,
      title: "PDF Materials",
      description: "Download study guides, slides, and exercises alongside every course.",
    },
    {
      icon: Ticket,
      title: "Access Codes",
      description: "Simple one-time codes make enrolling in your favorite course effortless.",
    },
    {
      icon: Sparkles,
      title: "Always Free",
      description: "Every course is free for students. Learning should have no barriers.",
    },
  ];

  const steps = [
    { step: "1", title: "Create your account", text: "Register in under a minute with just your name and email." },
    { step: "2", title: "Get your access code", text: "Your instructor shares a unique code with you." },
    { step: "3", title: "Start learning", text: "Watch lessons and download materials instantly." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/70 via-white to-white">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 via-indigo-300/20 to-sky-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-40 hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl lg:block" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-2 lg:pt-24">
            <div>
              <span className="badge bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Free online courses for students
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Learn faster with{" "}
                <span className="text-gradient">video courses</span> built for you
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                High-quality video lessons paired with downloadable PDF materials.
                Create your account, use your access code, and start learning today.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn-primary !px-7 !py-3 !text-base">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/courses" className="btn-outline !px-7 !py-3 !text-base">
                  <BookOpen className="h-4 w-4" /> Browse Courses
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> No credit card needed
                </span>
                <span className="inline-flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-primary" /> Instant access
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 to-indigo-300/20 blur-2xl" />
                <div className="relative rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-400">
                      <PlayCircle className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Getting Started</p>
                      <p className="text-xs text-gray-500">CourseHub · Lesson 1</p>
                    </div>
                    <span className="badge ml-auto bg-green-50 text-green-600">● Playing</span>
                  </div>
                  <div className="mt-4 aspect-video rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-purple-500" />
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-3/4 rounded-full bg-gray-200" />
                    <div className="h-2.5 w-1/2 rounded-full bg-gray-100" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="mt-1.5 text-xs font-semibold text-gray-700">Slides.pdf</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <Video className="h-4 w-4 text-primary" />
                      <p className="mt-1.5 text-xs font-semibold text-gray-700">12 lessons</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="eyebrow">Why CourseHub</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to learn
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              A simple, distraction-free way to deliver courses — for teachers and
              students alike.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-indigo-300/20 transition group-hover:from-primary group-hover:to-indigo-400">
                  <f.icon className="h-6 w-6 text-primary transition group-hover:text-white" />
                </span>
                <h3 className="mt-4 font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-12 text-center">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Start learning in 3 easy steps
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.step} className="relative rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-lg font-extrabold text-white shadow-md shadow-indigo-500/30">
                    {s.step}
                  </span>
                  <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-500 px-8 py-14 text-center shadow-xl shadow-indigo-500/25">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {session ? "Welcome back! Continue learning" : "Ready to start learning?"}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
              {session
                ? "Head to your dashboard and pick up right where you left off."
                : "Create your free account and unlock your first course in minutes."}
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={session ? (session.role === "admin" ? "/admin" : "/dashboard") : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-primary shadow-lg transition hover:scale-[1.03] active:scale-[0.98]"
              >
                {session ? "Go to Dashboard" : "Create Free Account"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
