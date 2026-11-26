import Link from "next/link";
import { MealLogForm } from "@/components/meal-log-form";
import { ExpenditureLogForm } from "@/components/expenditure-log-form";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { getDietPreferences } from "@/services/preferences.service";
import { calorieProgress } from "@/services/progress.service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { INDIAN_FOODS_HINT } from "@/lib/data/indian-foods";

export default async function DietPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const prefs = await getDietPreferences(user.id);
  const { items } = await calorieProgress.list(user.id, new URLSearchParams({ pageSize: "15" }));
  const meals = items as Array<{
    id: string;
    description: string | null;
    calories: number;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  }>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nutrition"
        description="Log meals and expenditure, track macros, and manage dietary preferences."
        actions={
          <>
            <Link href="/diet/plan" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Meal plan
            </Link>
            <Link href="/diet/preferences" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Preferences
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Your preferences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {prefs ? (
            <p className="flex flex-wrap items-center gap-2">
              <span>
                {prefs.dietType} · Target {prefs.calorieTarget ?? "—"} kcal
              </span>
              {prefs.preferIndianCuisine ? (
                <Badge variant="secondary">Indian cuisine</Badge>
              ) : (
                <Badge variant="outline">Indian cuisine off</Badge>
              )}
            </p>
          ) : (
            <p>Complete onboarding to set diet preferences.</p>
          )}
        </CardContent>
      </Card>

      <div className="content-grid lg:grid-cols-2">
        <MealLogForm />
        <ExpenditureLogForm />
      </div>

      {prefs?.preferIndianCuisine ? (
        <Card>
          <CardHeader>
            <CardTitle>Indian meal ideas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {INDIAN_FOODS_HINT.map((food) => (
              <Badge key={food} variant="outline">
                {food}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent meals</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <EmptyState title="No meals logged" description="Add your first meal above." />
          ) : (
            <ul className="space-y-2 text-sm">
              {meals.map((m) => (
                <li key={m.id} className="flex justify-between gap-4 border-b border-border/40 py-2">
                  <span>{m.description ?? "Meal"}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {m.calories} kcal · P{m.proteinG ?? 0} C{m.carbsG ?? 0} F{m.fatG ?? 0}
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