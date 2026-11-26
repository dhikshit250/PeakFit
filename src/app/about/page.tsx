import { PublicPage } from "@/components/layout/public-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PublicPage>
      <article className="page-container max-w-3xl pb-20 pt-12 md:pt-16">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">About</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">Built for the athlete in you</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          PeakFit V2 is a premium fitness platform that unifies workouts, nutrition, progress tracking, and AI-assisted
          planning. We obsess over clarity, consistency, and data you can trust — because your training deserves better
          than spreadsheet chaos.
        </p>

        <ValuesSection />

        <section className="mt-12 space-y-4 text-muted-foreground">
          <h2 className="font-heading text-xl font-semibold text-foreground">Our stack</h2>
          <p className="leading-relaxed">
            Next.js, Clerk, Prisma, PostgreSQL, ImageKit, and OpenRouter — each integration chosen for reliability and
            security. Your data stays scoped to your account; coaches and teams are not the focus.
          </p>
        </section>
      </article>
    </PublicPage>
  );
}

function ValuesSection() {
  const values = [
    { title: "Honest metrics", body: "Dashboards read from your database. Empty states are empty — never fabricated." },
    { title: "One design language", body: "Dark-first UI, energetic accents, and typography tuned for performance brands." },
    { title: "Mobile-ready", body: "Versioned REST APIs power the web app today and the upcoming mobile client." },
  ];
  return (
    <div className="content-grid mt-12">
      {values.map((v) => (
        <Card key={v.title}>
          <CardHeader>
            <CardTitle className="font-heading">{v.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">{v.body}</CardContent>
        </Card>
      ))}
    </div>
  );
}