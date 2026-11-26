import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { getDashboardSummary, getChartSeries } from "@/services/dashboard.service";
import { DashboardWeightChart } from "@/components/dashboard-weight-chart";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Droplets, Flame, Footprints, Scale, Target } from "lucide-react";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const summary = await getDashboardSummary(user.id);
  const weightSeries = await getChartSeries(user.id, "weight", "30d");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome${
          summary.profile?.fullName ? `, ${summary.profile.fullName.split(/\s+/)[0]}` : ""
        }`}
        description="Live overview from your account — every number is loaded from your database."
      />

      <div className="content-grid sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Weight"
          value={summary.latestWeight ? `${Number(summary.latestWeight.weightKg)} kg` : "—"}
          hint="Latest entry"
          icon={Scale}
        />
        <StatCard
          title="Calories today"
          value={String(summary.nutritionToday.intakeCalories)}
          hint={`Burn: ${summary.nutritionToday.expenditureCalories} kcal`}
          icon={Flame}
        />
        <StatCard
          title="Water today"
          value={`${summary.hydrationTodayMl} ml`}
          hint="Logged intake"
          icon={Droplets}
        />
        <StatCard
          title="Steps today"
          value={summary.stepsToday != null ? String(summary.stepsToday) : "—"}
          hint="Activity day"
          icon={Footprints}
        />
      </div>

      <div className="content-grid lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weight trend (30d)</CardTitle>
            <CardDescription>From your weight log</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardWeightChart points={weightSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Macros today</CardTitle>
            <CardDescription>Protein, carbs, and fat from meal logs</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center text-sm">
            <Macro label="Protein" value={`${summary.nutritionToday.proteinG}g`} />
            <Macro label="Carbs" value={`${summary.nutritionToday.carbsG}g`} />
            <Macro label="Fat" value={`${summary.nutritionToday.fatG}g`} />
          </CardContent>
        </Card>
      </div>

      <div className="content-grid lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent workouts</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.workoutsThisWeek.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                description="Log a workout to see it here."
                action={
                  <Link href="/workouts" className={cn(buttonVariants({ size: "sm" }))}>
                    Log workout
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2 text-sm">
                {summary.workoutsThisWeek.map((s) => (
                  <li key={s.id} className="flex justify-between border-b border-border/50 py-2">
                    <span>{new Date(s.startedAt).toLocaleString()}</span>
                    <span className="text-muted-foreground">{s.source}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/workouts"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex")}
            >
              Manage workouts
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-primary" aria-hidden />
              Active goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.activeGoals.length === 0 ? (
              <EmptyState
                title="No active goals"
                description="Set a measurable target to track progress."
                action={
                  <Link href="/goals" className={cn(buttonVariants({ size: "sm" }))}>
                    Create goal
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2 text-sm">
                {summary.activeGoals.map((g) => (
                  <li key={g.id} className="flex justify-between border-b border-border/50 py-2">
                    <span>{g.title ?? g.metricType}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {g.currentValue != null ? Number(g.currentValue) : 0} / {Number(g.targetValue)} {g.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/goals" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex")}>
              View goals
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}