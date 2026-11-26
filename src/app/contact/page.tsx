import Link from "next/link";
import { PublicPage } from "@/components/layout/public-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Contact & Support" };

export default function ContactPage() {
  return (
    <PublicPage>
      <section className="page-container pb-20 pt-12 md:pt-16">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Support</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">We&apos;re here to help</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Questions about your account, data, or AI features? Send a message — we route support requests through email
          (no backend ticket system yet).
        </p>

        <div className="content-grid mt-10 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading">Send a message</CardTitle>
              <CardDescription>Opens your email client with a pre-filled draft to support.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Mail className="size-5 text-primary" />
                <CardTitle className="text-base">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <a href="mailto:support@peakfit.app" className="text-primary hover:underline">
                  support@peakfit.app
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <MessageCircle className="size-5 text-primary" />
                <CardTitle className="text-base">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>See implementation status and API notes in the repository docs.</p>
                <Link href="/features" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Explore features
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}