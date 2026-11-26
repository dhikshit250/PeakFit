"use client";

import { useState } from "react";
export function PhotoUploader({ onUploaded }: { onUploaded: (url: string, fileId?: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/media/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
      onUploaded(json.data.url, json.data.fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onChange} disabled={loading} />
      {loading && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}