import { Suspense } from "react";
import { PasswordForm, SettingsForm } from "@/components/admin/SettingsForm";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/settings";

export const metadata = { title: "Site settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin("/admin/settings");
  // Read straight from the DB (not the cached copy) so the form always shows the latest values.
  const rows = await db.setting.findMany();
  const parsed = settingsSchema.safeParse(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  const settings = parsed.success ? parsed.data : settingsSchema.parse({});
  return (
    <>
      <PageHeader title="Site settings" description="Changes go live on the store immediately — no redeploy needed." />
      <SettingsForm initial={settings} />
      <div className="mt-8">
        <PasswordForm />
      </div>
    </>
  );
}
