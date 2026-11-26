import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  Bot,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  User,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const appNavPrimary: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Daily overview" },
  { href: "/today", label: "Today", icon: Sparkles, description: "AI daily plan" },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, description: "Sessions & PRs" },
  { href: "/diet", label: "Nutrition", icon: Apple, description: "Meals & macros" },
  { href: "/progress", label: "Progress", icon: Activity, description: "Metrics & photos" },
  { href: "/goals", label: "Goals", icon: Target, description: "Track targets" },
];

export const appNavSecondary: AppNavItem[] = [
  { href: "/assistant", label: "AI Coach", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const publicNav = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}