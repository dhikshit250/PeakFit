import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PeakFit — Your AI Fitness Coach",
    template: "%s | PeakFit",
  },
  description:
    "Personalized workouts, nutrition, and progress tracking — built for individual fitness goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html
        lang="en"
        className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
          <Suspense
            fallback={
              <div className="h-[var(--header-height)] border-b border-border/60 bg-background/80" aria-hidden />
            }
          >
            <SiteHeader />
          </Suspense>
          <main className="min-w-0 flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}