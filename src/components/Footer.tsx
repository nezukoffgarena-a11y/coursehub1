import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-400">
            <GraduationCap className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-gray-900">
            Course<span className="text-primary">Hub</span>
          </span>
        </Link>
        <p className="text-sm text-gray-500">
          Free video courses with PDF materials for every student.
        </p>
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/courses" className="hover:text-primary">
            Courses
          </Link>
          <Link href="/login" className="hover:text-primary">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-primary">
            Register
          </Link>
        </nav>
      </div>
    </footer>
  );
}
