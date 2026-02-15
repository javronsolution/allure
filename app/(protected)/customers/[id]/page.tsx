import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { CustomerDetail } from "@/components/customers/customer-detail";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function CustomerDetailPage({
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

  // Fetch customer's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header
        title={customer.full_name}
        showBack
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href={`/customers/${id}/edit`}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Link>
          </Button>
        }
      />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <CustomerDetail customer={customer} orders={orders ?? []} />
      </main>
    </>
  );
}
