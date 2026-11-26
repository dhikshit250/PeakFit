import Link from "next/link";
import { WorkoutSessionForm } from "@/components/workout-session-form";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { listWorkoutSessions } from "@/services/workout.service";
import { listPersonalRecords } from "@/services/personal-records.service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export default async function WorkoutsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const { items: sessions } = await listWorkoutSessions(
    user.id,
    new URLSearchParams({ pageSize: "10" }),
  );
  const prs = await listPersonalRecords(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workouts"
        description="Log sessions, review history, and track personal records."
        actions={
          <>
            <Link href="/workouts/library" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Exercise library
            </Link>
            <Link href="/workouts/preferences" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Preferences
            </Link>
          </>
        }
      />

      <WorkoutSessionForm />

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState title="No sessions yet" description="Create your first workout above." />
          ) : (
            <ul className="space-y-2 text-sm">
              {sessions.map((s) => (
                <li key={s.id} className="border-b border-border/40 py-2">
                  <Link href={`/workouts/${s.id}`} className="font-medium text-primary hover:underline">
                    {new Date(s.startedAt).toLocaleString()}
                  </Link>
                  <span className="text-muted-foreground"> · {s.exerciseLogs.length} exercises</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal records</CardTitle>
        </CardHeader>
        <CardContent>
          {prs.length === 0 ? (
            <EmptyState title="No PRs yet" description="Log sets with weight to build personal records." />
          ) : (
            <ul className="space-y-2 text-sm">
              {prs.map((p) => (
                <li key={p.id} className="flex justify-between border-b border-border/40 py-2">
                  <span>
                    {p.exerciseName} ({p.recordType})
                  </span>
                  <span className="tabular-nums">
                    {Number(p.value)} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}