import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CourseHub - Free Video Courses for Students",
    template: "%s | CourseHub",
  },
  description:
    "High-quality free video courses with PDF materials. Register, use your access code, and start learning today.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
