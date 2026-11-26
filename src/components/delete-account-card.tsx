"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DeleteAccountCard() {
  const { signOut } = useClerk();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (confirm !== "DELETE MY ACCOUNT") {
      setError('Type exactly "DELETE MY ACCOUNT" to confirm.');
      return;
    }
    if (!window.confirm("This permanently deletes your PeakFit data and Clerk account. Continue?")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE MY ACCOUNT" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Deletion failed");
        return;
      }
      await signOut({ redirectUrl: "/" });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently removes your workouts, nutrition, progress, goals, AI plans, and Clerk sign-in. This cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder='Type "DELETE MY ACCOUNT"'
          aria-label="Deletion confirmation"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button variant="destructive" disabled={loading} onClick={() => void onDelete()}>
          {loading ? "Deleting…" : "Delete my account"}
        </Button>
      </CardContent>
    </Card>
  );
}