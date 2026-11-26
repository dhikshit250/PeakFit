import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.12_85_/_0.15),_transparent_55%)]"
        aria-hidden
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--peak-gold)]">
          PeakFit V2
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Train smarter. Eat better. Track everything that matters.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A modern fitness platform with AI-assisted plans, full progress tracking, and a
          premium dark experience — built for you, not coaches or trainers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
            Start free
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-3">
          <FeatureCard
            title="AI plans"
            description="OpenRouter-powered workouts and meals from your preferences — server-side only."
          />
          <FeatureCard
            title="Full progress"
            description="Weight, workouts, nutrition, sleep, hydration, goals, and progress photos."
          />
          <FeatureCard
            title="Mobile-ready APIs"
            description="Versioned /api/v1 endpoints for the upcoming Expo app."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}