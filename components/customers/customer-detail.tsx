"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, MessageCircle, Plus } from "lucide-react";
import { CORE_MEASUREMENTS, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { Customer, Order } from "@/lib/types/database";
import { format, parseISO } from "date-fns";

interface CustomerDetailProps {
  customer: Customer;
  orders: Order[];
}

export function CustomerDetail({ customer, orders }: CustomerDetailProps) {
  const whatsappUrl = `https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
      {/* Contact Info */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {customer.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-lg truncate">
                {customer.full_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Added {format(parseISO(customer.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-3 text-sm py-1"
            >
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </a>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 text-sm py-1"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </a>
            )}
            {customer.address && (
              <div className="flex items-center gap-3 text-sm py-1">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-green-700"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
            {CORE_MEASUREMENTS.map((field) => {
              const value = customer[field.key as keyof Customer];
              return (
                <div key={field.key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium">
                    {value != null ? `${value}"` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </div> 

      {/* Notes */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Orders ({orders.length})
            </CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/orders/new?customer=${customer.id}`}>
                <Plus className="w-4 h-4 mr-1" />
                New Order
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No orders yet
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => {
                const statusConfig =
                  ORDER_STATUS_CONFIG[
                    order.status as keyof typeof ORDER_STATUS_CONFIG
                  ];
                const balance = order.total_amount - order.advance_paid;
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">
                            {order.order_number}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${statusConfig?.bgColor} ${statusConfig?.color} text-xs`}
                          >
                            {statusConfig?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due:{" "}
                          {format(
                            parseISO(order.delivery_date),
                            "dd MMM yyyy"
                          )}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">
                          ₹{order.total_amount.toLocaleString("en-IN")}
                        </p>
                        {balance > 0 && (
                          <p className="text-xs text-orange-600">
                            Bal: ₹{balance.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
