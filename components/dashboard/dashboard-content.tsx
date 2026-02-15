"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  CalendarDays,
  Plus,
  IndianRupee,
  ClipboardList,
} from "lucide-react";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import { format, parseISO } from "date-fns";

interface OrderWithCustomer {
  id: string;
  order_number: string;
  delivery_date: string;
  status: string;
  total_amount: number;
  advance_paid: number;
  customer: {
    full_name: string;
    phone: string;
  };
}

interface DashboardContentProps {
  overdueOrders: OrderWithCustomer[];
  todayOrders: OrderWithCustomer[];
  upcomingOrders: OrderWithCustomer[];
  recentOrders: OrderWithCustomer[];
  pendingCount: number;
  totalBalance: number;
}

export function DashboardContent({
  overdueOrders,
  todayOrders,
  upcomingOrders,
  recentOrders,
  pendingCount,
  totalBalance,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto py-4 flex-col gap-2">
          <Link href="/orders/new">
            <Plus className="w-5 h-5" />
            <span>New Order</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/customers/new">
            <Plus className="w-5 h-5" />
            <span>New Customer</span>
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <IndianRupee className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ₹{totalBalance.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">Balance Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Orders */}
      {overdueOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="font-semibold text-red-600">
              Overdue ({overdueOrders.length})
            </h2>
          </div>
          <div className="space-y-2">
            {overdueOrders.map((order) => (
              <OrderCard key={order.id} order={order} variant="overdue" />
            ))}
          </div>
        </section>
      )}

      {/* Due Today */}
      {todayOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-600" />
            <h2 className="font-semibold text-yellow-600">
              Due Today ({todayOrders.length})
            </h2>
          </div>
          <div className="space-y-2">
            {todayOrders.map((order) => (
              <OrderCard key={order.id} order={order} variant="today" />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming This Week */}
      {upcomingOrders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold">
              Upcoming This Week ({upcomingOrders.length})
            </h2>
          </div>
          <div className="space-y-2">
            {upcomingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {overdueOrders.length === 0 &&
        todayOrders.length === 0 &&
        upcomingOrders.length === 0 &&
        recentOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start by adding a customer and creating your first order
              </p>
              <Button asChild>
                <Link href="/orders/new">Create First Order</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">View All</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  variant,
}: {
  order: OrderWithCustomer;
  variant?: "overdue" | "today";
}) {
  const statusConfig =
    ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
  const balance = order.total_amount - order.advance_paid;

  return (
    <Link href={`/orders/${order.id}`}>
      <Card
        className={
          variant === "overdue"
            ? "border-red-200 bg-red-50/50"
            : variant === "today"
            ? "border-yellow-200 bg-yellow-50/50"
            : ""
        }
      >
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {order.order_number}
                </span>
                <Badge
                  variant="secondary"
                  className={`${statusConfig?.bgColor} ${statusConfig?.color} text-xs`}
                >
                  {statusConfig?.label}
                </Badge>
              </div>
              <p className="text-sm truncate">{order.customer.full_name}</p>
              <p className="text-xs text-muted-foreground">
                Due: {format(parseISO(order.delivery_date), "dd MMM yyyy")}
              </p>
            </div>
            <div className="text-right shrink-0">
              {balance > 0 && (
                <p className="text-sm font-medium text-orange-600">
                  ₹{balance.toLocaleString("en-IN")}
                </p>
              )}
              {balance === 0 && order.total_amount > 0 && (
                <p className="text-xs text-green-600 font-medium">Paid</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
