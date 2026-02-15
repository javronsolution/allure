"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  MessageCircle,
  FileText,
  Pencil,
  Trash2,
  IndianRupee,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  ORDER_STATUS_CONFIG,
  ORDER_STATUS_FLOW,
  GARMENT_TYPE_LABELS,
  CORE_MEASUREMENTS,
  GARMENT_MEASUREMENTS,
} from "@/lib/constants";
import {
  Customer,
  Order,
  OrderItem,
  DesignImage,
  OrderStatus,
  GarmentType,
  BoutiqueSettings,
} from "@/lib/types/database";
import { format, parseISO } from "date-fns";
import { OrderPdfButton } from "@/components/pdf/order-pdf-button";

interface OrderItemWithImages extends OrderItem {
  design_images: DesignImage[];
}

interface OrderWithCustomer extends Order {
  customer: Customer;
}

interface OrderDetailProps {
  order: OrderWithCustomer;
  orderItems: OrderItemWithImages[];
  settings: BoutiqueSettings | null;
}

export function OrderDetail({
  order,
  orderItems,
  settings,
}: OrderDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState("");

  const balance = order.total_amount - order.advance_paid;
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Status updated to ${ORDER_STATUS_CONFIG[newStatus].label}`);
      router.refresh();
    }
    setLoading(false);
  };

  const handleAddPayment = async () => {
    const amount = Number(additionalPayment);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setLoading(true);
    const newAdvance = order.advance_paid + amount;
    const { error } = await supabase
      .from("orders")
      .update({ advance_paid: newAdvance })
      .eq("id", order.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`₹${amount.toLocaleString("en-IN")} payment recorded`);
      setAdditionalPayment("");
      setShowPayment(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this order? This cannot be undone.")) return;

    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Order deleted");
      router.push("/orders");
      router.refresh();
    }
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = (forTailor = false) => {
    const items = orderItems
      .map(
        (item, i) =>
          `${i + 1}. ${GARMENT_TYPE_LABELS[item.garment_type as GarmentType]} - ${
            item.description || "No description"
          }`
      )
      .join("\n");

    if (forTailor) {
      return encodeURIComponent(
        `Order: ${order.order_number}\nCustomer: ${order.customer.full_name}\nDelivery: ${format(parseISO(order.delivery_date), "dd MMM yyyy")}\n\nItems:\n${items}\n\nPlease check the attached PDF for measurements and details.`
      );
    }

    return encodeURIComponent(
      `Hello ${order.customer.full_name},\n\nYour order ${order.order_number} has been confirmed.\n\nItems:\n${items}\n\nDelivery Date: ${format(parseISO(order.delivery_date), "dd MMM yyyy")}\nTotal: ₹${order.total_amount.toLocaleString("en-IN")}\nAdvance Paid: ₹${order.advance_paid.toLocaleString("en-IN")}\nBalance: ₹${balance.toLocaleString("en-IN")}\n\nThank you!`
    );
  };

  const customerPhone = order.customer.phone.replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-mono">
                {order.order_number}
              </h2>
              <p className="text-sm text-muted-foreground">
                Created {format(parseISO(order.created_at), "dd MMM yyyy")}
              </p>
            </div>
            <Badge
              className={`${statusConfig.bgColor} ${statusConfig.color} text-sm px-3 py-1`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Status Change */}
          <div className="space-y-2">
            <Label className="text-sm">Update Status</Label>
            <Select
              value={order.status}
              onValueChange={(v) => handleStatusChange(v as OrderStatus)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_FLOW.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_CONFIG[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              Delivery:{" "}
              <strong>
                {format(parseISO(order.delivery_date), "dd MMM yyyy")}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href={`/customers/${order.customer.id}`}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{order.customer.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.customer.phone}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* Order Items */}
      {orderItems.map((item, index) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Item {index + 1}:{" "}
                {GARMENT_TYPE_LABELS[item.garment_type as GarmentType]}
              </CardTitle>
              <span className="text-sm font-medium">
                ₹{item.price.toLocaleString("en-IN")}
                {item.quantity > 1 && ` × ${item.quantity}`}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            {item.description && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Design Details
                </Label>
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {item.description}
                </p>
              </div>
            )}

            {/* Measurements */}
            {item.measurements &&
              Object.keys(item.measurements).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Measurements
                  </Label>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 mt-1">
                    {Object.entries(
                      item.measurements as Record<string, number | string>
                    ).map(([key, value]) => {
                      // Find the label for this key
                      const coreField = CORE_MEASUREMENTS.find(
                        (f) => f.key === key
                      );
                      const garmentFields =
                        GARMENT_MEASUREMENTS[
                          item.garment_type as GarmentType
                        ] ?? [];
                      const garmentField = garmentFields.find(
                        (f) => f.key === key
                      );
                      const label =
                        coreField?.label ??
                        garmentField?.label ??
                        key.replace(/_/g, " ");

                      return (
                        <div
                          key={key}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground capitalize">
                            {label}
                          </span>
                          <span className="font-medium">
                            {typeof value === "number" ? `${value}"` : value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Design Images */}
            {item.design_images && item.design_images.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Design References
                </Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.design_images.map((img) => (
                    <DesignImageThumbnail key={img.id} image={img} />
                  ))}
                </div>
              </div>
            )}

            {/* Item Notes */}
            {item.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium">
              ₹{order.total_amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Advance Paid</span>
            <span className="font-medium text-green-600">
              ₹{order.advance_paid.toLocaleString("en-IN")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="font-medium">Balance Due</span>
            <span
              className={`font-bold ${
                balance > 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              ₹{Math.max(0, balance).toLocaleString("en-IN")}
            </span>
          </div>

          {balance > 0 && (
            <>
              {showPayment ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max={balance}
                    placeholder="Amount"
                    value={additionalPayment}
                    onChange={(e) => setAdditionalPayment(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddPayment}
                    disabled={loading}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPayment(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPayment(true)}
                  className="w-full"
                >
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Record Payment
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <OrderPdfButton
          order={order}
          orderItems={orderItems}
          settings={settings}
        />

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="text-green-700">
            <a
              href={`https://wa.me/${customerPhone}?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Customer
            </a>
          </Button>
          <Button asChild variant="outline" className="text-green-700">
            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage(true)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Tailor
            </a>
          </Button>
        </div>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Order
        </Button>
      </div>
    </div>
  );
}

function DesignImageThumbnail({ image }: { image: DesignImage }) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from("design-references")
    .getPublicUrl(image.storage_path, {
      transform: { width: 200, height: 200 },
    });

  return (
    <a
      href={
        supabase.storage
          .from("design-references")
          .getPublicUrl(image.storage_path).data.publicUrl
      }
      target="_blank"
      rel="noopener noreferrer"
      className="block w-20 h-20 rounded-lg overflow-hidden border"
    >
      <img
        src={data.publicUrl}
        alt={image.caption || "Design reference"}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </a>
  );
}
