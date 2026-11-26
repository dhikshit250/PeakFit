"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Status = {
  configured: boolean;
  primaryModel: string | null;
  fallbackModel: string | null;
  fallbackConfigured: boolean;
  connectivity?: string;
  probe?: { ok: boolean; modelUsed?: string; usedFallback?: boolean };
};

export function AiStatusPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [probing, setProbing] = useState(false);

  useEffect(() => {
    fetch("/api/v1/ai/status")
      .then((r) => r.json())
      .then((j) => setStatus(j.data))
      .catch(() => setStatus(null));
  }, []);

  async function probe() {
    setProbing(true);
    const res = await fetch("/api/v1/ai/status?probe=1");
    const json = await res.json();
    if (res.ok) setStatus(json.data);
    setProbing(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {!status ? (
          <p>Loading status…</p>
        ) : (
          <>
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant={status.configured ? "default" : "destructive"}>
                {status.configured ? "Configured" : "Not configured"}
              </Badge>
              {status.primaryModel ? <span>Primary: {status.primaryModel}</span> : null}
            </p>
            {status.fallbackConfigured ? <p>Fallback: {status.fallbackModel}</p> : <p>No fallback model configured</p>}
            {status.connectivity ? <p>Connectivity: {status.connectivity}</p> : null}
            {status.probe ? (
              <p>
                Probe: {status.probe.ok ? "ok" : "degraded"}
                {status.probe.modelUsed ? ` (${status.probe.modelUsed})` : ""}
                {status.probe.usedFallback ? " · used fallback" : ""}
              </p>
            ) : null}
            <Button size="sm" variant="outline" disabled={!status.configured || probing} onClick={() => void probe()}>
              {probing ? "Testing…" : "Test connectivity"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}