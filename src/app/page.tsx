import Link from "next/link";
import { PublicPage } from "@/components/layout/public-page";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";
import { Activity, Apple, Bot, Dumbbell } from "lucide-react";

export default function HomePage() {
  return (
    <PublicPage>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.72_0.14_95_/_0.12),_transparent_55%)]"
          aria-hidden
        />
        <section className="page-container relative pb-16 pt-14 md:pb-24 md:pt-20">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">PeakFit V2</p>
          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            Train smarter. Eat better. Track what moves the needle.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A premium fitness platform with AI-assisted planning, deep progress tracking, and a unified dark
            experience — built for individuals, not coach dashboards.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
              Start free
            </Link>
            <Link
              href="/features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              See features
            </Link>
          </div>

          <div className="content-grid mt-16 md:grid-cols-2 lg:grid-cols-4">
            <HeroStat value="12+" label="Progress categories" />
            <HeroStat value="AI" label="Workout & diet plans" />
            <HeroStat value="v1" label="Mobile-ready APIs" />
            <HeroStat value="24/7" label="Your data, your account" />
          </div>
        </section>

        <section className="border-y border-border/60 bg-surface/40">
          <div className="page-container grid gap-4 py-16 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Dumbbell}
              title="Workouts"
              description="Sessions, sets, exercise library, and automatic personal records."
            />
            <FeatureCard
              icon={Apple}
              title="Nutrition"
              description="Meals, macros, expenditure, and Indian cuisine preferences."
            />
            <FeatureCard
              icon={Activity}
              title="Progress"
              description="Weight, sleep, hydration, photos, and goal tracking."
            />
            <FeatureCard
              icon={Bot}
              title="AI coach"
              description="OpenRouter-powered plans saved to your account."
            />
          </div>
        </section>

        <section className="page-container py-20 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to peak?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Create an account in minutes. Onboarding captures your profile, preferences, and goals.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}>
            Get started
          </Link>
        </section>
      </div>
    </PublicPage>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 px-4 py-5">
      <p className="font-heading text-2xl font-semibold tabular-nums text-primary md:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Dumbbell;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full bg-card/60">
      <CardHeader>
        <span className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}