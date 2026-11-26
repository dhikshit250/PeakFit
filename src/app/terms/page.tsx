import { PublicPage } from "@/components/layout/public-page";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <PublicPage>
      <article className="page-container max-w-3xl space-y-8 pb-20 pt-12 text-muted-foreground md:pt-16">
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Legal</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm">Last updated: November 26, 2026</p>
        </header>

        <Section title="Agreement">
          By using PeakFit you agree to these terms. If you do not agree, do not use the service.
        </Section>
        <Section title="Service">
          PeakFit provides fitness tracking, nutrition logging, progress visualization, and optional AI-generated
          plans. Features may change as the product evolves. AI output is informational and not medical advice.
        </Section>
        <Section title="Your responsibilities">
          You are responsible for the accuracy of data you log and for keeping your account credentials secure. You must
          not attempt to access other users&apos; data or abuse API rate limits.
        </Section>
        <Section title="Health disclaimer">
          PeakFit is not a substitute for professional medical, nutritional, or training advice. Consult qualified
          professionals before starting any program.
        </Section>
        <Section title="Availability">
          We aim for high availability but do not guarantee uninterrupted service. Maintenance and third-party outages
          may occur.
        </Section>
        <Section title="Contact">
          Legal inquiries:{" "}
          <a href="mailto:legal@peakfit.app" className="text-primary hover:underline">
            legal@peakfit.app
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
      <p className="leading-relaxed">{children}</p>
    </section>
  );
}