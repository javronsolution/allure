"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ClipboardList } from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW } from "@/lib/constants";
import { OrderStatus } from "@/lib/types/database";
import { format, parseISO, isPast, isToday } from "date-fns";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface OrderWithCustomer {
  id: string;
  order_number: string;
  delivery_date: string;
  status: OrderStatus;
  total_amount: number;
  advance_paid: number;
  notes: string | null;
  customer: {
    full_name: string;
    phone: string;
  };
}

interface OrderListProps {
  orders: OrderWithCustomer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: string;
}

export function OrderList({
  orders,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  searchQuery,
  statusFilter: initialStatusFilter,
}: OrderListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  const navigate = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page"); // reset to page 1
    const qs = params.toString();
    router.push(qs ? `/orders?${qs}` : "/orders");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    navigate({ q: value.trim() || null });
  };

  const handleStatusFilter = (status: string) => {
    navigate({ status: status === "all" ? null : status });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button
          variant={initialStatusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter("all")}
          className="shrink-0"
        >
          All
        </Button>
        {ORDER_STATUS_FLOW.map((status) => {
          const config = ORDER_STATUS_CONFIG[status];
          return (
            <Button
              key={status}
              variant={initialStatusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status)}
              className="shrink-0"
            >
              {config.label}
            </Button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {searchQuery || initialStatusFilter !== "all"
                ? "No orders found"
                : "No orders yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || initialStatusFilter !== "all"
                ? "Try a different filter"
                : "Create your first order to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            const balance = order.total_amount - order.advance_paid;
            const deliveryDate = parseISO(order.delivery_date);
            const isOverdue =
              isPast(deliveryDate) &&
              !isToday(deliveryDate) &&
              order.status !== "delivered";
            const isDueToday =
              isToday(deliveryDate) && order.status !== "delivered";

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card
                  className={
                    isOverdue
                      ? "border-red-200 bg-red-50/50"
                      : isDueToday
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
                            className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}
                          >
                            {statusConfig.label}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm truncate">
                          {order.customer.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due:{" "}
                          {format(deliveryDate, "dd MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-medium">
                          ₹{order.total_amount.toLocaleString("en-IN")}
                        </p>
                        {balance > 0 && (
                          <p className="text-xs text-orange-600">
                            Bal: ₹{balance.toLocaleString("en-IN")}
                          </p>
                        )}
                        {balance === 0 && order.total_amount > 0 && (
                          <p className="text-xs text-green-600">Paid</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        basePath="/orders"
      />
    </div>
  );
}
