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
import { CORE_MEASUREMENTS } from "@/lib/constants";
import { Customer } from "@/lib/types/database";
import { Trash2 } from "lucide-react";

interface CustomerFormProps {
  customer?: Customer;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!customer;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: customer?.full_name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
    notes: customer?.notes ?? "",
    // Measurements
    bust: customer?.bust ?? "",
    under_bust: customer?.under_bust ?? "",
    waist: customer?.waist ?? "",
    hip: customer?.hip ?? "",
    shoulder_width: customer?.shoulder_width ?? "",
    arm_length: customer?.arm_length ?? "",
    upper_arm: customer?.upper_arm ?? "",
    neck_round: customer?.neck_round ?? "",
    front_neck_depth: customer?.front_neck_depth ?? "",
    back_neck_depth: customer?.back_neck_depth ?? "",
    full_height: customer?.full_height ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data — convert empty strings to null for measurements
    const data = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      notes: formData.notes.trim() || null,
      bust: formData.bust ? Number(formData.bust) : null,
      under_bust: formData.under_bust ? Number(formData.under_bust) : null,
      waist: formData.waist ? Number(formData.waist) : null,
      hip: formData.hip ? Number(formData.hip) : null,
      shoulder_width: formData.shoulder_width
        ? Number(formData.shoulder_width)
        : null,
      arm_length: formData.arm_length ? Number(formData.arm_length) : null,
      upper_arm: formData.upper_arm ? Number(formData.upper_arm) : null,
      neck_round: formData.neck_round ? Number(formData.neck_round) : null,
      front_neck_depth: formData.front_neck_depth
        ? Number(formData.front_neck_depth)
        : null,
      back_neck_depth: formData.back_neck_depth
        ? Number(formData.back_neck_depth)
        : null,
      full_height: formData.full_height ? Number(formData.full_height) : null,
    };

    if (!data.full_name || !data.phone) {
      toast.error("Name and phone are required");
      setLoading(false);
      return;
    }

    let error;
    if (isEditing) {
      ({ error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", customer.id));
    } else {
      ({ error } = await supabase.from("customers").insert(data));
    }

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(
        isEditing ? "Customer updated" : "Customer added"
      );
      router.push("/customers");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (!confirm("Delete this customer and all their orders?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Customer deleted");
      router.push("/customers");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Customer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body Measurements</CardTitle>
          <p className="text-sm text-muted-foreground">
            All measurements in inches. Leave blank if not taken.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {CORE_MEASUREMENTS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  name={field.key}
                  type="number"
                  step="0.25"
                  min="0"
                  value={
                    formData[field.key as keyof typeof formData] as string
                  }
                  onChange={handleChange}
                  placeholder="0"
                  className="h-9"
                />
                {field.hint && (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any preferences, allergies, special notes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Customer"
            : "Add Customer"}
        </Button>

        {isEditing && (
          <>
            <Separator />
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Customer
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
