import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("boutique_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <>
      <Header title="Settings" />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <SettingsForm settings={settings} />
      </main>
    </>
  );
}
