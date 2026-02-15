import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { CustomerList } from "@/components/customers/customer-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header
        title="Customers"
        actions={
          <Button asChild size="sm">
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Link>
          </Button>
        }
      />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <CustomerList customers={customers ?? []} />
      </main>
    </>
  );
}
