import { OnboardingForm } from "@/components/onboarding-form";
import { PageHeader } from "@/components/layout/page-header";

export default function OnboardingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to PeakFit"
        description="Tell us about yourself so we can personalize workouts, nutrition, and AI plans."
      />
      <OnboardingForm />
    </div>
  );
}