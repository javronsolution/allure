import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { OrderForm } from "@/components/orders/order-form";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;
  const supabase = await createClient();

  // Fetch all customers for the selector
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("full_name");

  // If a customer ID is passed, pre-select that customer
  let preselectedCustomer = null;
  if (customerId) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    preselectedCustomer = data;
  }

  return (
    <>
      <Header title="New Order" showBack />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <OrderForm
          customers={customers ?? []}
          preselectedCustomer={preselectedCustomer}
        />
      </main>
    </>
  );
}
