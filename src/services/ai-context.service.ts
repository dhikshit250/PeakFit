import { getDashboardSummary } from "@/services/dashboard.service";
import { getProfileSnapshot } from "@/services/profile.service";
import { INDIAN_FOODS_HINT } from "@/lib/data/indian-foods";

const MEDICAL_DISCLAIMER =
  "PeakFit AI provides general fitness and nutrition information only — not medical advice. Consult a qualified professional for health conditions.";

/** Synthetic profile for tests and development probes — no real PII. */
export const SYNTHETIC_AI_CONTEXT = {
  unitSystem: "METRIC",
  timezone: "UTC",
  fitnessGoal: "MAINTAIN",
  ageRange: "30-39",
  heightCm: 175,
  weightKg: 72,
  workoutPreferences: {
    durationMinutes: 45,
    workoutType: "Strength Training",
    intensity: "MODERATE",
  },
  dietPreferences: {
    dietType: "Balanced",
    calorieTarget: 2200,
    preferIndianCuisine: true,
  },
  recentProgress: {
    stepsToday: 6500,
    hydrationTodayMl: 1800,
    nutritionToday: { intakeCalories: 0, expenditureCalories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    activeGoals: [],
    workoutsThisWeek: 0,
  },
  indianFoodExamples: INDIAN_FOODS_HINT.slice(0, 8),
  disclaimer: MEDICAL_DISCLAIMER,
};

function ageToRange(age: number | null | undefined): string | null {
  if (age == null || age < 13) return null;
  const bucket = Math.floor(age / 10) * 10;
  return `${bucket}-${bucket + 9}`;
}

export async function buildAiUserContext(userId: string) {
  const snapshot = await getProfileSnapshot(userId);
  const summary = await getDashboardSummary(userId);
  const profile = snapshot.profile;
  const dp = snapshot.dietPreferences;
  const wp = snapshot.workoutPreferences;

  return {
    unitSystem: snapshot.user.unitSystem,
    timezone: snapshot.user.timezone,
    fitnessGoal: profile?.goal ?? null,
    ageRange: ageToRange(profile?.age),
    heightCm: profile?.heightCm != null ? Number(profile.heightCm) : null,
    weightKg: summary.latestWeight != null ? Number(summary.latestWeight.weightKg) : null,
    workoutPreferences: wp
      ? {
          durationMinutes: wp.durationMinutes,
          workoutType: wp.workoutType,
          intensity: wp.intensity,
        }
      : null,
    dietPreferences: dp
      ? {
          dietType: dp.dietType,
          calorieTarget: dp.calorieTarget,
          preferIndianCuisine: dp.preferIndianCuisine,
        }
      : null,
    recentProgress: {
      stepsToday: summary.stepsToday,
      hydrationTodayMl: summary.hydrationTodayMl,
      nutritionToday: summary.nutritionToday,
      activeGoals: summary.activeGoals.map((g) => ({
        metric: g.metricType,
        title: g.title,
        target: Number(g.targetValue),
        current: g.currentValue != null ? Number(g.currentValue) : null,
        unit: g.unit,
      })),
      workoutsThisWeek: summary.workoutsThisWeek.length,
    },
    indianFoodExamples: dp?.preferIndianCuisine ? INDIAN_FOODS_HINT.slice(0, 12) : [],
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

export function getAiSystemPreamble() {
  return `You are PeakFit's fitness assistant. ${MEDICAL_DISCLAIMER} Do not diagnose or prescribe medication.`;
}