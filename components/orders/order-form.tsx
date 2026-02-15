"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ImagePlus, X } from "lucide-react";
import {
  GARMENT_TYPE_LABELS,
  GARMENT_MEASUREMENTS,
  CORE_MEASUREMENTS,
} from "@/lib/constants";
import { Customer, GarmentType } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

interface OrderItemFormData {
  tempId: string;
  garment_type: GarmentType;
  description: string;
  measurements: Record<string, string>;
  quantity: number;
  price: string;
  notes: string;
  imageFiles: File[];
  imagePreviews: string[];
}

interface OrderFormProps {
  customers: Customer[];
  preselectedCustomer?: Customer | null;
}

export function OrderForm({ customers, preselectedCustomer }: OrderFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomer?.id ?? ""
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [items, setItems] = useState<OrderItemFormData[]>([
    createEmptyItem(),
  ]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  function createEmptyItem(): OrderItemFormData {
    return {
      tempId: uuidv4(),
      garment_type: "blouse",
      description: "",
      measurements: {},
      quantity: 1,
      price: "",
      notes: "",
      imageFiles: [],
      imagePreviews: [],
    };
  }

  // Pre-fill garment measurements from customer profile
  function prefillMeasurements(
    garmentType: GarmentType,
    customer: Customer | undefined
  ): Record<string, string> {
    if (!customer) return {};
    const prefilled: Record<string, string> = {};
    // Map core measurements
    CORE_MEASUREMENTS.forEach((field) => {
      const value = customer[field.key as keyof Customer];
      if (value != null && value !== "") {
        prefilled[field.key] = String(value);
      }
    });
    return prefilled;
  }

  const updateItem = (
    index: number,
    updates: Partial<OrderItemFormData>
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    // Revoke image preview URLs
    items[index].imagePreviews.forEach(URL.revokeObjectURL);
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem = createEmptyItem();
    newItem.measurements = prefillMeasurements(
      newItem.garment_type,
      selectedCustomer
    );
    setItems((prev) => [...prev, newItem]);
  };

  const handleGarmentTypeChange = (index: number, type: GarmentType) => {
    const measurements = prefillMeasurements(type, selectedCustomer);
    updateItem(index, { garment_type: type, measurements });
  };

  const handleMeasurementChange = (
    index: number,
    key: string,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              measurements: { ...item.measurements, [key]: value },
            }
          : item
      )
    );
  };

  const handleImageAdd = async (index: number, files: FileList) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, options);
        newFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    updateItem(index, {
      imageFiles: [...items[index].imageFiles, ...newFiles],
      imagePreviews: [...items[index].imagePreviews, ...newPreviews],
    });
  };

  const removeImage = (itemIndex: number, imageIndex: number) => {
    const item = items[itemIndex];
    URL.revokeObjectURL(item.imagePreviews[imageIndex]);
    updateItem(itemIndex, {
      imageFiles: item.imageFiles.filter((_, i) => i !== imageIndex),
      imagePreviews: item.imagePreviews.filter((_, i) => i !== imageIndex),
    });
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );
  const balance = totalAmount - (Number(advancePaid) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!deliveryDate) {
      toast.error("Please set a delivery date");
      return;
    }
    if (items.some((item) => !item.price || Number(item.price) <= 0)) {
      toast.error("Please set a price for all items");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: selectedCustomerId,
          delivery_date: deliveryDate,
          total_amount: totalAmount,
          advance_paid: Number(advancePaid) || 0,
          notes: orderNotes.trim() || null,
          order_number: "", // trigger will auto-generate
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      for (const item of items) {
        // Convert measurement values to numbers where possible
        const cleanMeasurements: Record<string, number | string> = {};
        Object.entries(item.measurements).forEach(([key, val]) => {
          if (val && val.trim()) {
            const num = Number(val);
            cleanMeasurements[key] = isNaN(num) ? val : num;
          }
        });

        const { data: orderItem, error: itemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            garment_type: item.garment_type,
            description: item.description.trim() || null,
            measurements: cleanMeasurements,
            quantity: item.quantity,
            price: Number(item.price),
            notes: item.notes.trim() || null,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // 3. Upload design images
        for (const file of item.imageFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `orders/${order.id}/${orderItem.id}/${uuidv4()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("design-references")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          await supabase.from("design_images").insert({
            order_item_id: orderItem.id,
            storage_path: filePath,
          });
        }
      }

      toast.success("Order created successfully!");
      router.push(`/orders/${order.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Select Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Select Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <p className="font-medium">{selectedCustomer.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.phone}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomerId("")}
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search customers by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setCustomerSearch("");
                      // Prefill measurements for existing items
                      setItems((prev) =>
                        prev.map((item) => ({
                          ...item,
                          measurements: prefillMeasurements(
                            item.garment_type,
                            customer
                          ),
                        }))
                      );
                    }}
                  >
                    <p className="text-sm font-medium">
                      {customer.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.phone}
                    </p>
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No customers found.{" "}
                    <a
                      href="/customers/new"
                      className="text-primary underline"
                    >
                      Add new customer
                    </a>
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Garment Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">2. Garment Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item, index) => (
            <div key={item.tempId} className="space-y-4">
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Item {index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Garment Type */}
              <div className="space-y-2">
                <Label>Garment Type</Label>
                <Select
                  value={item.garment_type}
                  onValueChange={(v) =>
                    handleGarmentTypeChange(index, v as GarmentType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GARMENT_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Garment-specific measurements */}
              <div className="space-y-2">
                <Label className="text-sm">Measurements</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Core measurements */}
                  {CORE_MEASUREMENTS.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="0"
                        className="h-8 text-sm"
                        value={item.measurements[field.key] ?? ""}
                        onChange={(e) =>
                          handleMeasurementChange(
                            index,
                            field.key,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}

                  <Separator className="col-span-2 my-1" />

                  {/* Garment-specific */}
                  {GARMENT_MEASUREMENTS[item.garment_type]?.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        type={
                          field.key.includes("style") ? "text" : "number"
                        }
                        step="0.25"
                        min="0"
                        placeholder={field.hint ?? "0"}
                        className="h-8 text-sm"
                        value={item.measurements[field.key] ?? ""}
                        onChange={(e) =>
                          handleMeasurementChange(
                            index,
                            field.key,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Design Details</Label>
                <Textarea
                  placeholder="Fabric, color, embroidery, design instructions..."
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Design Reference Images */}
              <div className="space-y-2">
                <Label>Design Reference Photos</Label>
                <div className="flex flex-wrap gap-2">
                  {item.imagePreviews.map((preview, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border"
                    >
                      <img
                        src={preview}
                        alt={`Reference ${imgIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full"
                        onClick={() => removeImage(index, imgIdx)}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">
                      Add
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files)
                          handleImageAdd(index, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, { price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, {
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              {/* Item Notes */}
              <div className="space-y-2">
                <Label>Item Notes</Label>
                <Input
                  placeholder="Any extra notes for this item..."
                  value={item.notes}
                  onChange={(e) =>
                    updateItem(index, { notes: e.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step 3: Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Delivery Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Advance Paid (₹)</Label>
              <Input
                type="number"
                min="0"
                max={totalAmount}
                placeholder="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance Due</span>
              <span
                className={`font-semibold ${
                  balance > 0 ? "text-orange-600" : "text-green-600"
                }`}
              >
                ₹{Math.max(0, balance).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Order Notes</Label>
            <Textarea
              placeholder="General notes for this order..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating Order..." : "Create Order"}
      </Button>
    </form>
  );
}
