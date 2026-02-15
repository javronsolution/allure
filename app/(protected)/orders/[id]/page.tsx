import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { OrderDetail } from "@/components/orders/order-detail";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch order with customer and items
  const { data: order } = await supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  // Fetch order items with design images
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, design_images(*)")
    .eq("order_id", id);

  // Fetch boutique settings for PDF
  const { data: settings } = await supabase
    .from("boutique_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <>
      <Header title={order.order_number} showBack />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <OrderDetail
          order={order}
          orderItems={orderItems ?? []}
          settings={settings}
        />
      </main>
    </>
  );
}
