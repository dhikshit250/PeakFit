"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeletePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this saved plan?")) return;
    setLoading(true);
    const res = await fetch(`/api/v1/ai/plans/${planId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/assistant");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button size="sm" variant="destructive" disabled={loading} onClick={() => void onDelete()}>
      Delete
    </Button>
  );
}