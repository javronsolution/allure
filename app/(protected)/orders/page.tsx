import { createClient } from "@/lib/supabase/server";
import { OrderList } from "@/components/orders/order-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

const PAGE_SIZE = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() ?? "";
  const statusFilter = params.status ?? "all";

  // Build query
  let query = supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)", { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (search) {
    // Search by order number or join to customer name
    query = query.or(
      `order_number.ilike.%${search}%,customer.full_name.ilike.%${search}%`
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: orders, count } = await query
    .order("delivery_date", { ascending: true })
    .range(from, to);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
        <OrderList
          orders={orders ?? []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          searchQuery={search}
          statusFilter={statusFilter}
        />
      </PageWrapper>
    </>
  );
}
