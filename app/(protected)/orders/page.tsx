import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { OrderList } from "@/components/orders/order-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .order("delivery_date", { ascending: true });

  return (
    <>
      <Header
        title="Orders"
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Link>
          </Button>
        }
      />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <OrderList orders={orders ?? []} />
      </main>
    </>
  );
}
