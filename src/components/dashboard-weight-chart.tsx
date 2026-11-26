"use client";

type Point = { at: string; value: number };

export function DashboardWeightChart({ points }: { points: Point[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">Log weight to see your trend.</p>;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return (
    <div className="space-y-3">
      <div
        className="flex min-h-[var(--chart-min-height)] items-end gap-1.5 border-b border-border/50 pb-1"
        style={{ height: "var(--chart-min-height)" }}
      >
        {points.map((p) => {
          const h = ((p.value - min) / span) * 100;
          return (
            <div
              key={p.at}
              className="flex-1 rounded-t bg-[var(--peak-gold)]/80"
              style={{ height: `${Math.max(8, h)}%` }}
              title={`${p.value} kg — ${new Date(p.at).toLocaleDateString()}`}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Range: {min.toFixed(1)}–{max.toFixed(1)} kg ({points.length} entries)
      </p>
    </div>
  );
}