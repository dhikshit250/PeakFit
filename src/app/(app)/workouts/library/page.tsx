import Link from "next/link";
import { EXERCISE_LIBRARY } from "@/lib/data/exercise-library";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export const metadata = { title: "Exercise library" };

export default function ExerciseLibraryPage() {
  const groups = [...new Set(EXERCISE_LIBRARY.map((e) => e.muscleGroup))].sort();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exercise library"
        description="Reference movements for logging sessions. Select exercises when creating a workout."
        actions={
          <Link href="/workouts" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to workouts
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <Badge key={g} variant="outline">
            {g}
          </Badge>
        ))}
      </div>

      <ExerciseGrid />
    </div>
  );
}

function ExerciseGrid() {
  return (
    <div className="content-grid md:grid-cols-2 lg:grid-cols-3">
      {EXERCISE_LIBRARY.map((exercise) => (
        <Card key={exercise.name} className="bg-card/70 transition-colors hover:border-primary/30">
          <CardHeader>
            <CardTitle className="font-heading text-base">{exercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{exercise.muscleGroup}</Badge>
            <Badge variant="outline">{exercise.equipment}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}