import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
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
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <Suspense
            fallback={
              <div className="h-14 border-b border-border/60 bg-background/80" aria-hidden />
            }
          >
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}