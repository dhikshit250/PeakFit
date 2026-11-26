"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUploader } from "@/components/photo-uploader";

const inputClass = "field min-w-[140px]";

const tabs = [
  { key: "weight", label: "Weight", endpoint: "/api/v1/progress/weight" },
  { key: "water", label: "Water", endpoint: "/api/v1/progress/water" },
  { key: "sleep", label: "Sleep", endpoint: "/api/v1/progress/sleep" },
  { key: "steps", label: "Steps", endpoint: "/api/v1/progress/steps" },
  { key: "body-fat", label: "Body fat", endpoint: "/api/v1/progress/body-fat" },
  { key: "measurements", label: "Measurements", endpoint: "/api/v1/progress/measurements" },
  { key: "photos", label: "Photos", endpoint: "/api/v1/progress/photos" },
] as const;

type Entry = Record<string, unknown> & { id: string };

export function ProgressHub() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("weight");
  const active = tabs.find((t) => t.key === tab)!;
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({ pageSize: "50" });
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    return `${active.endpoint}?${params}`;
  }, [active.endpoint, from, to]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(buildUrl());
    const json = await res.json();
    setItems((json.data ?? []) as Entry[]);
    setLoading(false);
  }, [buildUrl]);

  useEffect(() => {
    let cancelled = false;
    fetch(buildUrl())
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setItems((json.data ?? []) as Entry[]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [buildUrl]);

  async function remove(id: string) {
    const res = await fetch(`${active.endpoint}/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => {
              setTab(t.key);
              setLoading(true);
              setItems([]);
            }}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2 text-sm">
        <label className="flex flex-col gap-1">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </label>
        <Button size="sm" variant="outline" onClick={() => load()}>
          Apply filter
        </Button>
      </div>

      <LogForm endpoint={active.endpoint} kind={active.key} onSaved={load} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No entries yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2">
                  <span className="text-xs break-all">{formatEntry(item, active.key)}</span>
                  <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatEntry(item: Entry, kind: string) {
  if (kind === "photos") {
    return `${item.caption ?? "Photo"} — ${String(item.imageUrl)}`;
  }
  if (kind === "steps") {
    return `${String(item.date)}: ${item.steps} steps`;
  }
  if (kind === "weight") return `${item.recordedAt}: ${item.weightKg} kg`;
  if (kind === "water") return `${item.recordedAt}: ${item.amountMl} ml`;
  if (kind === "sleep") return `${item.recordedAt}: ${item.durationMinutes} min`;
  if (kind === "body-fat") return `${item.recordedAt}: ${item.bodyFatPercent}%`;
  if (kind === "measurements")
    return `${item.recordedAt}: waist ${item.waistCm ?? "—"} chest ${item.chestCm ?? "—"}`;
  return JSON.stringify(item);
}

function LogForm({
  endpoint,
  kind,
  onSaved,
}: {
  endpoint: string;
  kind: string;
  onSaved: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFileId, setPhotoFileId] = useState<string | undefined>();

  async function savePhotoRecord(url: string, fileId?: string) {
    setPhotoUrl(url);
    setPhotoFileId(fileId);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        takenAt: new Date().toISOString(),
        imageUrl: url,
        cloudinaryPublicId: fileId ?? null,
        caption: "Progress photo",
      }),
    });
    if (res.ok) onSaved();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const now = new Date().toISOString();
    let body: Record<string, unknown> = { recordedAt: now };

    if (kind === "weight") body = { recordedAt: now, weightKg: Number(fd.get("value")) };
    if (kind === "water") body = { recordedAt: now, amountMl: Number(fd.get("value")) };
    if (kind === "sleep")
      body = { recordedAt: now, durationMinutes: Number(fd.get("value")), quality: 7 };
    if (kind === "steps") body = { date: now.slice(0, 10), steps: Number(fd.get("value")) };
    if (kind === "body-fat") body = { recordedAt: now, bodyFatPercent: Number(fd.get("value")) };
    if (kind === "measurements")
      body = { recordedAt: now, waistCm: Number(fd.get("value")), chestCm: Number(fd.get("value2")) };
    if (kind === "photos") {
      await savePhotoRecord(photoUrl || String(fd.get("url")), photoFileId);
      return;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      e.currentTarget.reset();
      onSaved();
    }
  }

  if (kind === "photos") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload progress photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PhotoUploader onUploaded={savePhotoRecord} />
          {photoUrl && <p className="text-xs text-muted-foreground">Uploaded: {photoUrl}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
          {kind === "measurements" ? (
            <>
              <input name="value" placeholder="Waist cm" required type="number" className={inputClass} />
              <input name="value2" placeholder="Chest cm" type="number" className={inputClass} />
            </>
          ) : (
            <input
              name="value"
              placeholder={kind === "steps" ? "Steps" : "Value"}
              required
              type="number"
              className={inputClass}
            />
          )}
          <Button type="submit" size="sm">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}