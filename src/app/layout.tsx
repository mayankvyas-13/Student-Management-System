import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Create, update, delete and list student records.",
};

/** The shell around every page: header with navigation, then the page content. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 py-5">
            <Link href="/students" className="font-serif text-xl tracking-tight">
              Student Records
            </Link>
            <Link href="/students/new" className="link text-sm">
              Add student
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
