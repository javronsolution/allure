import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "@/components/customers/customer-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageWrapper
        title="Customers"
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Link>
          </Button>
        }
      >
        <CustomerList customers={customers ?? []} />
      </PageWrapper>
    </>
  );
}
