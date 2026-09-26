"use client";

import { useState } from "react";
import { buildFeedingExportText } from "@/lib/exportFeeding";
import type { FeedingSession } from "@/lib/types";

export default function ExportFeedingButton({
  sessions,
  babyName,
}: {
  sessions: FeedingSession[];
  babyName: string;
}) {
  const [text, setText] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "manual">("idle");

  const handleExport = async () => {
    const generated = buildFeedingExportText(sessions, babyName);
    setText(generated);
    try {
      await navigator.clipboard.writeText(generated);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("manual");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        className="text-sm font-medium bg-accent text-white rounded-xl px-4 py-2 active:scale-[0.98] transition-transform"
      >
        Copier l&apos;historique des tétées
      </button>

      {text && (
        <div className="mt-3">
          <p className="text-xs text-accent mb-2">
            {copyStatus === "copied"
              ? "Copié ✓ — colle-le dans une note sur ton téléphone pour garder une sauvegarde."
              : "Sélectionne tout le texte ci-dessous et copie-le manuellement (appui long → Tout sélectionner → Copier), puis colle-le dans une note."}
          </p>
          <textarea
            readOnly
            value={text}
            onFocus={(e) => e.currentTarget.select()}
            rows={8}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs font-mono text-text"
          />
        </div>
      )}
    </div>
  );
}
