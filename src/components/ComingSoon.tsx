"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function ComingSoon({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold">{title}</h1>
        <ThemeToggle />
      </div>
      <div className="rounded-2xl bg-surface border border-border p-8 flex flex-col items-center text-center gap-3 mt-6">
        <span className="text-4xl">{emoji}</span>
        <p className="text-sm text-text-muted max-w-[26ch]">{description}</p>
        <Link href="/feeding" className="mt-2 text-sm font-medium text-accent">
          Suivre une tétée en attendant →
        </Link>
      </div>
    </div>
  );
}
