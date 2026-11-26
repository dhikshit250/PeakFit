"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileClientSnapshot } from "@/services/profile.service";

export function ProfileEditor({ initial }: { initial: ProfileClientSnapshot }) {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fd.get("fullName"),
        age: Number(fd.get("age")),
        goal: fd.get("goal"),
        weightKg: Number(fd.get("weightKg")),
        heightCm: Number(fd.get("heightCm")),
        bio: fd.get("bio"),
      }),
    });
    const prefs = await fetch("/api/v1/profile/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timezone: fd.get("timezone"),
        unitSystem: fd.get("unitSystem"),
      }),
    });
    setMessage(res.ok && prefs.ok ? "Profile saved." : "Save failed.");
  }

  const p = initial.profile;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Personal info</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="fullName" defaultValue={p?.fullName ?? ""} placeholder="Full name" className="field" />
          <div className="grid grid-cols-2 gap-2">
            <input name="age" type="number" defaultValue={p?.age ?? ""} placeholder="Age" className="field" />
            <input
              name="weightKg"
              type="number"
              step="0.1"
              defaultValue={p?.weightKg ?? ""}
              placeholder="Weight kg"
              className="field"
            />
          </div>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            defaultValue={p?.heightCm ?? ""}
            placeholder="Height cm"
            className="field"
          />
          <select name="goal" defaultValue={p?.goal ?? "MAINTAIN"} className="field">
            <option value="CUT">Cut</option>
            <option value="MAINTAIN">Maintain</option>
            <option value="BULK">Bulk</option>
          </select>
          <textarea name="bio" defaultValue={p?.bio ?? ""} placeholder="Bio" className="field min-h-20" />
          <input name="timezone" defaultValue={initial.user.timezone} className="field" />
          <select name="unitSystem" defaultValue={initial.user.unitSystem} className="field">
            <option value="METRIC">Metric</option>
            <option value="IMPERIAL">Imperial</option>
          </select>
          <p className="text-xs text-muted-foreground">Signed in as {initial.user.email ?? "—"}</p>
          <Button type="submit">Save profile</Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}