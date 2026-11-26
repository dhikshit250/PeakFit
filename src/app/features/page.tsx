import Link from "next/link";
import { PublicPage } from "@/components/layout/public-page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { Activity, Apple, Bot, Dumbbell, LineChart, Shield } from "lucide-react";

export const metadata = { title: "Features" };

const features = [
  {
    icon: Dumbbell,
    title: "Workout intelligence",
    description:
      "Log sessions, exercises, and sets. Track personal records automatically when you beat your best.",
  },
  {
    icon: Apple,
    title: "Nutrition that fits you",
    description:
      "Meal and expenditure logging, macro breakdown, Indian cuisine preferences, and daily calorie balance.",
  },
  {
    icon: LineChart,
    title: "Complete progress",
    description:
      "Weight, body fat, measurements, hydration, sleep, steps, and progress photos — all in PostgreSQL.",
  },
  {
    icon: Bot,
    title: "AI coaching",
    description:
      "OpenRouter-powered workout and diet plans from your profile. Saved plans you can revisit anytime.",
  },
  {
    icon: Activity,
    title: "Today view",
    description: "One place for your daily plan, macros snapshot, and quick actions toward your goals.",
  },
  {
    icon: Shield,
    title: "Private by design",
    description: "Clerk authentication, per-user data isolation, and versioned APIs for web and mobile.",
  },
];

export default function FeaturesPage() {
  return (
    <PublicPage>
      <section className="page-container pb-16 pt-12 md:pt-16">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Features</p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Everything you need to train, eat, and improve — in one product.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          PeakFit is built for individuals who want serious tracking without coach overhead. Real data, real APIs, no
          fake dashboard numbers.
        </p>
        <FeaturesGrid />
        <FeaturesCta />
      </section>
    </PublicPage>
  );
}

function FeaturesGrid() {
  const list = features;
  return (
    <div className="content-grid mt-12 md:grid-cols-2 lg:grid-cols-3">
      {list.map((f) => {
        const Icon = f.icon;
        return (
          <Card key={f.title} className="bg-card/70">
            <CardHeader>
              <span className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <CardTitle className="font-heading text-lg">{f.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{f.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

function FeaturesCta() {
  return (
    <div className="mt-16 flex flex-wrap gap-3">
      <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
        Start free
      </Link>
      <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        Talk to us
      </Link>
    </div>
  );
}