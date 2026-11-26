import {
  dailyPlanSchema,
  dailyRecommendationsSchema,
  dietPlanSchema,
  workoutPlanSchema,
} from "@/lib/validators/ai";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

type PlanRecord = {
  id: string;
  planType: string;
  model: string;
  generatedAt: Date | string;
  planJson: unknown;
};

export function PlanDetailView({ plan }: { plan: PlanRecord }) {
  const generatedAt =
    typeof plan.generatedAt === "string" ? plan.generatedAt : plan.generatedAt.toISOString();

  return (
    <div className="space-y-6">
      <PlanMetaHeader planType={plan.planType} model={plan.model} generatedAt={generatedAt} />
      <PlanJsonBody planType={plan.planType} planJson={plan.planJson} />
    </div>
  );
}

function PlanMetaHeader({
  planType,
  model,
  generatedAt,
}: {
  planType: string;
  model: string;
  generatedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Badge variant="secondary">{planType}</Badge>
      <span>Model: {model}</span>
      <span>·</span>
      <time dateTime={generatedAt}>{new Date(generatedAt).toLocaleString()}</time>
    </div>
  );
}

function PlanJsonBody({ planType, planJson }: { planType: string; planJson: unknown }) {
  if (planType === "workout") {
    const parsed = workoutPlanSchema.safeParse(planJson);
    if (!parsed.success) return <InvalidPlan />;
    return <WorkoutPlanView plan={parsed.data} />;
  }
  if (planType === "diet") {
    const parsed = dietPlanSchema.safeParse(planJson);
    if (!parsed.success) return <InvalidPlan />;
    return <DietPlanView plan={parsed.data} />;
  }
  if (planType === "daily") {
    const parsed = dailyPlanSchema.safeParse(planJson);
    if (!parsed.success) return <InvalidPlan />;
    return <DailyPlanView plan={parsed.data} />;
  }
  if (planType === "recommendations") {
    const parsed = dailyRecommendationsSchema.safeParse(planJson);
    if (!parsed.success) return <InvalidPlan />;
    return <RecommendationsView plan={parsed.data} />;
  }
  return <InvalidPlan />;
}

function InvalidPlan() {
  return <p className="text-sm text-destructive">This saved plan could not be validated for display.</p>;
}

function WorkoutPlanView({ plan }: { plan: z.infer<typeof workoutPlanSchema> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{plan.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{plan.durationMinutes} minutes</p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <Section title="Warm-up" items={plan.warmup} />
        <div className="space-y-3">
          <h3 className="font-medium">Exercises</h3>
          {plan.exercises.map((ex) => (
            <div key={ex.name} className="rounded-lg border border-border/60 p-3">
              <p className="font-medium">{ex.name}</p>
              <p className="text-muted-foreground">
                {ex.sets} sets × {ex.reps}
                {ex.restSeconds != null ? ` · rest ${ex.restSeconds}s` : ""}
              </p>
              {ex.notes ? <p className="mt-1 text-muted-foreground">{ex.notes}</p> : null}
            </div>
          ))}
        </div>
        <Section title="Cool-down" items={plan.cooldown} />
      </CardContent>
    </Card>
  );
}

function DietPlanView({ plan }: { plan: z.infer<typeof dietPlanSchema> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{plan.title}</CardTitle>
        <p className="text-sm text-muted-foreground tabular-nums">~{plan.totalCalories} kcal total</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {plan.meals.map((meal) => (
          <div key={meal.name} className="rounded-lg border border-border/60 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium">{meal.name}</p>
              <span className="tabular-nums text-muted-foreground">{meal.calories} kcal</span>
            </div>
            <p className="mt-1 text-muted-foreground">{meal.description}</p>
            {meal.quantity ? <p className="mt-1 text-xs text-muted-foreground">Portion: {meal.quantity}</p> : null}
            <p className="mt-2 text-xs tabular-nums text-muted-foreground">
              P{meal.proteinG ?? "—"} · C{meal.carbsG ?? "—"} · F{meal.fatG ?? "—"} g
            </p>
          </div>
        ))}
        {plan.notes ? <p className="text-muted-foreground">{plan.notes}</p> : null}
      </CardContent>
    </Card>
  );
}

function DailyPlanView({ plan }: { plan: z.infer<typeof dailyPlanSchema> }) {
  return (
    <div className="space-y-6">
      <WorkoutPlanView plan={plan.workout} />
      <DietPlanView plan={plan.diet} />
      {plan.tips.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {plan.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function RecommendationsView({ plan }: { plan: z.infer<typeof dailyRecommendationsSchema> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{plan.headline}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {plan.focusAreas.map((f) => (
            <Badge key={f} variant="outline">
              {f}
            </Badge>
          ))}
        </div>
        <div>
          <h3 className="font-medium">Workout</h3>
          <p className="mt-1 text-muted-foreground">{plan.workoutSummary}</p>
        </div>
        <div>
          <h3 className="font-medium">Nutrition</h3>
          <p className="mt-1 text-muted-foreground">{plan.nutritionSummary}</p>
        </div>
        <p className="text-xs text-muted-foreground">{plan.disclaimer}</p>
      </CardContent>
    </Card>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}