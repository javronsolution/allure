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
import { Save, Download } from "lucide-react";
import { BoutiqueSettings } from "@/lib/types/database";

interface SettingsFormProps {
  settings: BoutiqueSettings | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    boutique_name: settings?.boutique_name ?? "Allure Boutique",
    phone: settings?.phone ?? "",
    address: settings?.address ?? "",
    measurement_unit: settings?.measurement_unit ?? "inches",
    reminder_days: settings?.reminder_days ?? 2,
    pdf_footer_text: settings?.pdf_footer_text ?? "Thank you for choosing us!",
    order_prefix: settings?.order_prefix ?? "ALR",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    const updateData = {
      boutique_name: formData.boutique_name.trim(),
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      measurement_unit: formData.measurement_unit,
      reminder_days: Number(formData.reminder_days) || 2,
      pdf_footer_text: formData.pdf_footer_text.trim() || null,
      order_prefix: formData.order_prefix.trim() || "ALR",
    };

    let error;
    if (settings) {
      ({ error } = await supabase
        .from("boutique_settings")
        .update(updateData)
        .eq("id", settings.id));
    } else {
      ({ error } = await supabase
        .from("boutique_settings")
        .insert(updateData));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved");
      router.refresh();
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    try {
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .order("full_name");

      const { data: orders } = await supabase
        .from("orders")
        .select("*, customer:customers(full_name)")
        .order("created_at", { ascending: false });

      // Export customers CSV
      if (customers && customers.length > 0) {
        const headers = Object.keys(customers[0]).join(",");
        const rows = customers.map((c) =>
          Object.values(c)
            .map((v) => `"${v ?? ""}"`)
            .join(",")
        );
        const csv = [headers, ...rows].join("\n");
        downloadFile(csv, "allure-customers.csv", "text/csv");
      }

      // Export orders CSV
      if (orders && orders.length > 0) {
        const headers =
          "order_number,customer_name,delivery_date,status,total_amount,advance_paid,balance,notes,created_at";
        const rows = orders.map(
          (o: any) =>
            `"${o.order_number}","${o.customer?.full_name ?? ""}","${o.delivery_date}","${o.status}","${o.total_amount}","${o.advance_paid}","${o.total_amount - o.advance_paid}","${o.notes ?? ""}","${o.created_at}"`
        );
        const csv = [headers, ...rows].join("\n");
        downloadFile(csv, "allure-orders.csv", "text/csv");
      }

      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    type: string
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Boutique Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Boutique Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            This information appears on your PDFs
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="boutique_name">Boutique Name</Label>
            <Input
              id="boutique_name"
              name="boutique_name"
              value={formData.boutique_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shop address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Measurement Unit</Label>
            <Select
              value={formData.measurement_unit}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, measurement_unit: v as "inches" | "cm" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inches">Inches</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_prefix">Order Number Prefix</Label>
            <Input
              id="order_prefix"
              name="order_prefix"
              value={formData.order_prefix}
              onChange={handleChange}
              placeholder="ALR"
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">
              Orders will be numbered as {formData.order_prefix}-0001,{" "}
              {formData.order_prefix}-0002, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder_days">Reminder Days Before Deadline</Label>
            <Input
              id="reminder_days"
              name="reminder_days"
              type="number"
              min="1"
              max="14"
              value={formData.reminder_days}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive a reminder this many days before a delivery date
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PDF Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PDF Footer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="pdf_footer_text">Footer Message</Label>
            <Textarea
              id="pdf_footer_text"
              name="pdf_footer_text"
              value={formData.pdf_footer_text}
              onChange={handleChange}
              placeholder="Thank you for choosing us!"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              This appears at the bottom of every PDF order slip
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? "Saving..." : "Save Settings"}
      </Button>

      <Separator />

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Export</CardTitle>
          <p className="text-sm text-muted-foreground">
            Download all your data as CSV files for backup
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleExportData}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
