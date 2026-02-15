"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ClipboardList, Filter } from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW } from "@/lib/constants";
import { OrderStatus } from "@/lib/types/database";
import { format, parseISO, isPast, isToday } from "date-fns";

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
}

export function OrderList({ orders }: OrderListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className="shrink-0"
        >
          All
        </Button>
        {ORDER_STATUS_FLOW.map((status) => {
          const config = ORDER_STATUS_CONFIG[status];
          return (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="shrink-0"
            >
              {config.label}
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {search || statusFilter !== "all"
                ? "No orders found"
                : "No orders yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {search || statusFilter !== "all"
                ? "Try a different filter"
                : "Create your first order to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {filtered.map((order) => {
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

      <p className="text-xs text-muted-foreground text-center">
        {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
}
