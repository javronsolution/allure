import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { OrderList } from "@/components/orders/order-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .order("delivery_date", { ascending: true });

  return (
    <>
      <PageWrapper
        title="Orders"
        actions={
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Link>
          </Button>
        }
      >
        <OrderList orders={orders ?? []} />
      </PageWrapper>
    </>
  );
}
