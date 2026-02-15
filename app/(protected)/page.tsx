import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Fetch overdue orders (past delivery date, not delivered)
  const { data: overdueOrders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .lt("delivery_date", today)
    .neq("status", "delivered")
    .order("delivery_date", { ascending: true });

  // Fetch orders due today
  const { data: todayOrders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .eq("delivery_date", today)
    .neq("status", "delivered")
    .order("created_at", { ascending: false });

  // Fetch upcoming orders (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data: upcomingOrders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .gt("delivery_date", today)
    .lte("delivery_date", nextWeekStr)
    .neq("status", "delivered")
    .order("delivery_date", { ascending: true });

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, customer:customers(full_name, phone)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Get stats
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .neq("status", "delivered");

  // Calculate total balance
  const { data: balanceData } = await supabase
    .from("orders")
    .select("total_amount, advance_paid")
    .neq("status", "delivered");

  const totalBalance =
    balanceData?.reduce(
      (sum, order) => sum + (order.total_amount - order.advance_paid),
      0
    ) ?? 0;

  return (
    <>
      <Header title="Dashboard" />
      <main className="px-4 py-4 max-w-lg mx-auto space-y-6">
        <DashboardContent
          overdueOrders={overdueOrders ?? []}
          todayOrders={todayOrders ?? []}
          upcomingOrders={upcomingOrders ?? []}
          recentOrders={recentOrders ?? []}
          pendingCount={pendingCount ?? 0}
          totalBalance={totalBalance}
        />
      </main>
    </>
  );
}
