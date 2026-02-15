import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("boutique_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <>
    <PageWrapper title="Settings">
         <SettingsForm settings={settings} />
    </PageWrapper>
    </>
  );
}
