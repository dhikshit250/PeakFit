import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { getWorkoutSession } from "@/services/workout.service";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/utils";

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutSessionPage({ params }: Props) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const session = await getWorkoutSession(user.id, id);
  if (!session) redirect("/workouts");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Session detail"
        description={`${new Date(session.startedAt).toLocaleString()} · ${session.source}`}
        actions={
          <Link href="/workouts" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            All workouts
          </Link>
        }
      />

      {session.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{session.notes}</CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {session.exerciseLogs.map((ex) => (
          <Card key={ex.id}>
            <CardHeader>
              <CardTitle className="font-heading text-base">{ex.exerciseName}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[240px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Set</th>
                    <th className="pb-2 font-medium">Reps</th>
                    <th className="pb-2 font-medium">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s) => (
                    <tr key={s.id} className="border-b border-border/40">
                      <td className="py-2 tabular-nums">{s.setNumber}</td>
                      <td className="py-2 tabular-nums">{s.reps ?? "—"}</td>
                      <td className="py-2 tabular-nums">{s.weightKg != null ? Number(s.weightKg) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}