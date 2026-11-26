import { clerkSetup } from "@clerk/testing/playwright";
import { loadEnvLocal } from "./load-env";

export default async function globalSetup() {
  loadEnvLocal();
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn("[e2e] Clerk keys missing — authenticated tests will skip.");
    return;
  }
  await clerkSetup();
}