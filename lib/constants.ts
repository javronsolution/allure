import { GarmentType, OrderStatus } from "@/lib/types/database";

// ============================================================
// Order Status Configuration
// ============================================================

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string }
> = {
  received: {
    label: "Received",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  in_progress: {
    label: "In Progress",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  trial: {
    label: "Trial",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  ready: {
    label: "Ready",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  delivered: {
    label: "Delivered",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "in_progress",
  "trial",
  "ready",
  "delivered",
];

// ============================================================
// Garment Types
// ============================================================

export const GARMENT_TYPE_LABELS: Record<GarmentType, string> = {
  blouse: "Blouse",
  salwar_kameez: "Salwar Kameez",
  lehenga: "Lehenga",
  gown: "Gown",
  dress: "Dress",
  skirt: "Skirt",
  top: "Top",
  other: "Other",
};

// ============================================================
// Core Measurements (saved on customer profile)
// ============================================================

export interface MeasurementField {
  key: string;
  label: string;
  hint?: string;
}

export const CORE_MEASUREMENTS: MeasurementField[] = [
  { key: "bust", label: "Bust / Chest" },
  { key: "under_bust", label: "Under Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder_width", label: "Shoulder Width" },
  { key: "arm_length", label: "Arm Length", hint: "Shoulder to wrist" },
  { key: "upper_arm", label: "Upper Arm", hint: "Circumference" },
  { key: "neck_round", label: "Neck Round" },
  { key: "front_neck_depth", label: "Front Neck Depth" },
  { key: "back_neck_depth", label: "Back Neck Depth" },
  { key: "full_height", label: "Full Height" },
];

// ============================================================
// Garment-Specific Measurements
// These are stored as JSONB on order_items
// ============================================================

export const GARMENT_MEASUREMENTS: Record<GarmentType, MeasurementField[]> = {
  blouse: [
    { key: "blouse_length", label: "Blouse Length", hint: "Shoulder to hem" },
    { key: "cross_front", label: "Cross Front", hint: "Armhole to armhole (front)" },
    { key: "cross_back", label: "Cross Back", hint: "Armhole to armhole (back)" },
    { key: "dart_point", label: "Dart Point", hint: "Shoulder to bust point" },
    { key: "armhole_depth", label: "Armhole Depth", hint: "Shoulder to underarm" },
    { key: "sleeve_length", label: "Sleeve Length" },
    { key: "sleeve_opening", label: "Sleeve Opening / Cuff" },
    { key: "front_opening_style", label: "Front Opening Style", hint: "Center / Side / Back" },
  ],
  salwar_kameez: [
    { key: "kameez_length", label: "Kameez Length", hint: "Shoulder to desired length" },
    { key: "slit_length", label: "Slit Length" },
    { key: "salwar_length", label: "Salwar Length", hint: "Waist to ankle" },
    { key: "salwar_knee_round", label: "Knee Round" },
    { key: "salwar_bottom", label: "Salwar Bottom / Mohri" },
    { key: "crotch_depth", label: "Crotch Depth / Seat" },
    { key: "salwar_style", label: "Salwar Style", hint: "Churidar / Patiala / Straight" },
  ],
  lehenga: [
    { key: "lehenga_length", label: "Lehenga Length", hint: "Waist to floor" },
    { key: "lehenga_waist", label: "Lehenga Waist" },
    { key: "flare", label: "Flare / Kali", hint: "Circle or panel count" },
    { key: "can_can", label: "Can-Can Layers", hint: "Underlayer preference" },
  ],
  gown: [
    { key: "bodice_length", label: "Bodice Length", hint: "Shoulder to waist" },
    { key: "gown_full_length", label: "Full Length", hint: "Shoulder to floor" },
    { key: "train_length", label: "Train Length", hint: "Floor extension" },
    { key: "thigh_circumference", label: "Thigh Circumference" },
    { key: "knee_circumference", label: "Knee Circumference" },
  ],
  dress: [
    { key: "dress_length", label: "Dress Length", hint: "Waist to hem" },
    { key: "bodice_length", label: "Bodice Length", hint: "Shoulder to waist" },
    { key: "thigh_circumference", label: "Thigh Circumference" },
    { key: "knee_circumference", label: "Knee Circumference" },
    { key: "sleeve_length", label: "Sleeve Length" },
    { key: "sleeve_opening", label: "Sleeve Opening" },
  ],
  skirt: [
    { key: "skirt_length", label: "Skirt Length", hint: "Waist to hem" },
    { key: "skirt_waist", label: "Skirt Waist" },
    { key: "thigh_circumference", label: "Thigh Circumference" },
    { key: "knee_circumference", label: "Knee Circumference" },
    { key: "flare", label: "Flare / Style" },
  ],
  top: [
    { key: "top_length", label: "Top Length" },
    { key: "sleeve_length", label: "Sleeve Length" },
    { key: "sleeve_opening", label: "Sleeve Opening" },
    { key: "cross_front", label: "Cross Front" },
    { key: "cross_back", label: "Cross Back" },
  ],
  other: [
    { key: "garment_length", label: "Garment Length" },
    { key: "custom_1", label: "Custom Measurement 1" },
    { key: "custom_2", label: "Custom Measurement 2" },
    { key: "custom_3", label: "Custom Measurement 3" },
  ],
};

// ============================================================
// Defaults
// ============================================================

export const DEFAULT_ORDER_PREFIX = "ALR";
export const DEFAULT_REMINDER_DAYS = 2;
export const DEFAULT_MEASUREMENT_UNIT = "inches" as const;
