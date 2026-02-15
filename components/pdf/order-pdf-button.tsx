"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import {
  Customer,
  Order,
  OrderItem,
  DesignImage,
  GarmentType,
  BoutiqueSettings,
} from "@/lib/types/database";
import {
  GARMENT_TYPE_LABELS,
  CORE_MEASUREMENTS,
  GARMENT_MEASUREMENTS,
} from "@/lib/constants";

interface OrderItemWithImages extends OrderItem {
  design_images: DesignImage[];
}

interface OrderWithCustomer extends Order {
  customer: Customer;
}

interface OrderPdfButtonProps {
  order: OrderWithCustomer;
  orderItems: OrderItemWithImages[];
  settings: BoutiqueSettings | null;
}

export function OrderPdfButton({
  order,
  orderItems,
  settings,
}: OrderPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGeneratePdf = async () => {
    setLoading(true);

    try {
      // Dynamically import react-pdf to reduce initial bundle
      const {
        Document,
        Page,
        Text,
        View,
        StyleSheet,
        pdf,
      } = await import("@react-pdf/renderer");

      const { format, parseISO } = await import("date-fns");

      const styles = StyleSheet.create({
        page: {
          padding: 30,
          fontSize: 10,
          fontFamily: "Helvetica",
          color: "#1a1a1a",
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingBottom: 10,
          borderBottomWidth: 2,
          borderBottomColor: "#1a1a1a",
        },
        boutiqueName: {
          fontSize: 20,
          fontFamily: "Helvetica-Bold",
          letterSpacing: 1,
        },
        boutiqueContact: {
          fontSize: 8,
          color: "#666",
          marginTop: 2,
        },
        orderInfo: {
          textAlign: "right" as const,
        },
        orderNumber: {
          fontSize: 14,
          fontFamily: "Helvetica-Bold",
        },
        section: {
          marginBottom: 15,
        },
        sectionTitle: {
          fontSize: 11,
          fontFamily: "Helvetica-Bold",
          marginBottom: 6,
          paddingBottom: 3,
          borderBottomWidth: 1,
          borderBottomColor: "#e0e0e0",
          textTransform: "uppercase" as const,
          letterSpacing: 0.5,
        },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 2,
        },
        label: {
          color: "#666",
          width: "45%",
        },
        value: {
          fontFamily: "Helvetica-Bold",
          width: "55%",
          textAlign: "right" as const,
        },
        measurementGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
        },
        measurementItem: {
          width: "50%",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 2,
          paddingRight: 10,
        },
        measurementLabel: {
          color: "#666",
          fontSize: 9,
        },
        measurementValue: {
          fontFamily: "Helvetica-Bold",
          fontSize: 9,
        },
        itemHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "#f5f5f5",
          padding: 6,
          marginBottom: 8,
          borderRadius: 3,
        },
        itemTitle: {
          fontFamily: "Helvetica-Bold",
          fontSize: 11,
        },
        itemPrice: {
          fontFamily: "Helvetica-Bold",
          fontSize: 11,
        },
        description: {
          marginBottom: 8,
          lineHeight: 1.4,
          color: "#333",
        },
        paymentSection: {
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 2,
          borderTopColor: "#1a1a1a",
        },
        totalRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 3,
        },
        totalLabel: {
          fontSize: 12,
          fontFamily: "Helvetica-Bold",
        },
        totalValue: {
          fontSize: 12,
          fontFamily: "Helvetica-Bold",
        },
        footer: {
          position: "absolute" as const,
          bottom: 30,
          left: 30,
          right: 30,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          textAlign: "center" as const,
          fontSize: 8,
          color: "#999",
        },
        notes: {
          marginTop: 4,
          padding: 6,
          backgroundColor: "#fafafa",
          borderRadius: 3,
          fontSize: 9,
          lineHeight: 1.4,
        },
      });

      const balance = order.total_amount - order.advance_paid;

      const OrderDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.boutiqueName}>
                  {settings?.boutique_name ?? "Allure Boutique"}
                </Text>
                {settings?.phone && (
                  <Text style={styles.boutiqueContact}>
                    Phone: {settings.phone}
                  </Text>
                )}
                {settings?.address && (
                  <Text style={styles.boutiqueContact}>
                    {settings.address}
                  </Text>
                )}
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.boutiqueContact}>
                  Date: {format(parseISO(order.created_at), "dd MMM yyyy")}
                </Text>
                <Text style={styles.boutiqueContact}>
                  Delivery:{" "}
                  {format(parseISO(order.delivery_date), "dd MMM yyyy")}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>
                  {order.customer.full_name}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{order.customer.phone}</Text>
              </View>
              {order.customer.address && (
                <View style={styles.row}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>
                    {order.customer.address}
                  </Text>
                </View>
              )}
            </View>

            {/* Order Items */}
            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.section}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    Item {index + 1}:{" "}
                    {
                      GARMENT_TYPE_LABELS[
                        item.garment_type as GarmentType
                      ]
                    }
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price.toLocaleString("en-IN")}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </Text>
                </View>

                {/* Description */}
                {item.description && (
                  <View>
                    <Text
                      style={{
                        ...styles.measurementLabel,
                        marginBottom: 2,
                      }}
                    >
                      Design Details:
                    </Text>
                    <Text style={styles.description}>
                      {item.description}
                    </Text>
                  </View>
                )}

                {/* Measurements */}
                {item.measurements &&
                  Object.keys(item.measurements).length > 0 && (
                    <View>
                      <Text
                        style={{
                          ...styles.measurementLabel,
                          marginBottom: 4,
                          fontFamily: "Helvetica-Bold",
                          fontSize: 10,
                        }}
                      >
                        Measurements:
                      </Text>
                      <View style={styles.measurementGrid}>
                        {Object.entries(
                          item.measurements as Record<
                            string,
                            number | string
                          >
                        ).map(([key, value]) => {
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
                          const fieldLabel =
                            coreField?.label ??
                            garmentField?.label ??
                            key.replace(/_/g, " ");

                          return (
                            <View
                              key={key}
                              style={styles.measurementItem}
                            >
                              <Text style={styles.measurementLabel}>
                                {fieldLabel}
                              </Text>
                              <Text style={styles.measurementValue}>
                                {typeof value === "number"
                                  ? `${value}"`
                                  : value}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                {/* Item Notes */}
                {item.notes && (
                  <Text style={styles.notes}>Note: {item.notes}</Text>
                )}
              </View>
            ))}

            {/* Payment Summary */}
            <View style={styles.paymentSection}>
              <View style={styles.totalRow}>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ₹{order.total_amount.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.label}>Advance Paid</Text>
                <Text style={{ ...styles.value, color: "#16a34a" }}>
                  ₹{order.advance_paid.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Balance Due</Text>
                <Text
                  style={{
                    ...styles.totalValue,
                    color: balance > 0 ? "#ea580c" : "#16a34a",
                  }}
                >
                  ₹{Math.max(0, balance).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* Order Notes */}
            {order.notes && (
              <View style={{ ...styles.section, marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Order Notes</Text>
                <Text style={styles.notes}>{order.notes}</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer} fixed>
              <Text>
                {settings?.pdf_footer_text ?? "Thank you for choosing us!"}
              </Text>
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(<OrderDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${order.order_number}-${order.customer.full_name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={loading}
      className="w-full"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
