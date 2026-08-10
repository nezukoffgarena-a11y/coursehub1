"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LayoutDashboard, LogOut, Menu, Shield, X } from "lucide-react";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    })();
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        pathname === href
          ? "bg-primary/10 text-primary"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-400 shadow-sm shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              Course<span className="text-primary">Hub</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLink("/", "Home")}
            {navLink("/courses", "Browse Courses")}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link href="/admin" className="btn-outline !py-2 !text-xs">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              ) : (
                <Link href="/dashboard" className="btn-outline !py-2 !text-xs">
                  <LayoutDashboard className="h-4 w-4" /> My Courses
                </Link>
              )}
              <button onClick={handleLogout} className="btn-outline !py-2 !text-xs">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline !py-2 !text-xs">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary !py-2 !text-xs">
                Get Started Free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLink("/", "Home")}
            {navLink("/courses", "Browse Courses")}
            {user ? (
              <>
                {user.role === "admin" ? (
                  <Link href="/admin" className="btn-outline mt-2 w-full" onClick={() => setOpen(false)}>
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                ) : (
                  <Link href="/dashboard" className="btn-outline mt-2 w-full" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> My Courses
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-outline w-full">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/login" className="btn-outline w-full" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Get Started Free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
