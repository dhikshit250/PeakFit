import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { getProfileClientSnapshot } from "@/services/profile.service";
import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/profile-editor";
import { PageHeader } from "@/components/layout/page-header";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");
  const snapshot = await getProfileClientSnapshot(user.id);

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Personal details, fitness goal, and body statistics." />
      <ProfileEditor initial={snapshot} />
    </div>
  );
}