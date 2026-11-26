import { PublicPage } from "@/components/layout/public-page";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PublicPage>
      <article className="page-container max-w-3xl space-y-8 pb-20 pt-12 text-muted-foreground md:pt-16">
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Legal</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm">Last updated: November 26, 2026</p>
        </header>

        <Section title="Overview">
          PeakFit collects account and fitness data you choose to log — profile details, workouts, nutrition, progress
          metrics, and media uploads. Authentication is handled by Clerk; application data is stored in PostgreSQL.
        </Section>
        <Section title="Data we process">
          <ul className="list-disc space-y-2 pl-5">
            <li>Identity and contact information from your Clerk account</li>
            <li>Profile, preferences, and onboarding responses you submit</li>
            <li>Workout, nutrition, and progress records you create</li>
            <li>Progress photos uploaded via ImageKit</li>
            <li>AI plan requests sent to OpenRouter when enabled</li>
          </ul>
        </Section>
        <Section title="How we use data">
          Data is used to render your dashboard, generate personalized AI plans, and secure your account. We do not sell
          your fitness data. API access is scoped per authenticated user.
        </Section>
        <Section title="Your choices">
          You may update profile and preferences in the app, delete individual progress entries, and permanently delete
          your account from Settings. Self-serve deletion removes your PeakFit application data from our database and
          requests deletion of your Clerk authentication account. Some Clerk audit logs may be retained by the identity
          provider according to their policies. Contact us if you need help before or after deletion.
        </Section>
        <Section title="Retention">
          Data you actively log remains until you delete it or delete your account. Planned meals, workouts, progress
          metrics, AI plans, and uploads tied to your user record are removed when your account is deleted (database
          cascade). Backups, if any, roll off on the provider&apos;s normal retention schedule.
        </Section>
        <Section title="Contact">
          Privacy questions:{" "}
          <a href="mailto:privacy@peakfit.app" className="text-primary hover:underline">
            privacy@peakfit.app
          </a>
        </Section>
      </article>
    </PublicPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <div className="leading-relaxed">{children}</div>
    </section>
  );
}