import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Platform - Free Video Courses",
  description: "Free video courses for students with PDF materials",
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
