import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { CustomerForm } from "@/components/customers/customer-form";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  return (
    <>
      <Header title="Edit Customer" showBack />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <CustomerForm customer={customer} />
      </main>
    </>
  );
}
