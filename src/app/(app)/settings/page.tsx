import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteAccountCard } from "@/components/delete-account-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

const links = [
  { href: "/profile", title: "Profile & units", description: "Name, age, goal, weight, height, timezone" },
  { href: "/workouts/preferences", title: "Workout preferences", description: "Duration, type, and intensity defaults" },
  { href: "/diet/preferences", title: "Diet preferences", description: "Diet type, calorie target, Indian cuisine" },
] as const;

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage profile data, fitness preferences, and account controls via Clerk."
      />

      <ImagelessSettingsGrid />

      <Card>
        <CardHeader>
          <CardTitle>Account & privacy</CardTitle>
          <CardDescription>Security and sign-in are managed in your Clerk user menu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <Link href="/privacy" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Privacy policy
          </Link>
        </CardContent>
      </Card>

      <DeleteAccountCard />
    </div>
  );
}

function ImagelessSettingsGrid() {
  return (
    <div className="content-grid md:grid-cols-3">
      {links.map((item) => (
        <Card key={item.href} className="bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={item.href} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              Open
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}