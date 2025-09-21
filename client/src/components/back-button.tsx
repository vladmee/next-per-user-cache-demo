"use client";
import Link from "next/link";

export default function BackHomeButton() {
  return (
    <div className="max-w-7xl w-full px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 mr-auto"
      >
        ← Back
      </Link>
    </div>
  );
}
