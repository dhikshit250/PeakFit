import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        PeakFit V2 foundation — core features arrive in Milestone 3.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API status</CardTitle>
            <CardDescription>Versioned health endpoint for web and Expo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/api/v1/health"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View /api/v1/health
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next up</CardTitle>
            <CardDescription>Profile, workouts, diet, and progress tracking.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Milestone 3 — core functionality.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}