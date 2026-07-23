import type { OrderStatus } from "@restaurant/shared";

export interface StatusAction {
  label: string;
  next: OrderStatus;
  variant: "primary" | "danger";
}

// Mirrors the server-enforced restaurant-side transition map:
// PLACED -> ACCEPTED | CANCELLED
// ACCEPTED -> PREPARING | CANCELLED
// PREPARING -> READY_FOR_PICKUP | CANCELLED
// READY_FOR_PICKUP and beyond is handled by the delivery rider app.
const ACTIONS: Partial<Record<OrderStatus, StatusAction[]>> = {
  PLACED: [
    { label: "Accept", next: "ACCEPTED", variant: "primary" },
    { label: "Reject", next: "CANCELLED", variant: "danger" },
  ],
  ACCEPTED: [
    { label: "Start preparing", next: "PREPARING", variant: "primary" },
    { label: "Cancel", next: "CANCELLED", variant: "danger" },
  ],
  PREPARING: [
    { label: "Mark ready for pickup", next: "READY_FOR_PICKUP", variant: "primary" },
    { label: "Cancel", next: "CANCELLED", variant: "danger" },
  ],
};

export function actionsFor(status: OrderStatus): StatusAction[] {
  return ACTIONS[status] ?? [];
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PLACED: "#E8A93A",
  ACCEPTED: "#1F8A70",
  PREPARING: "#E85D2A",
  READY_FOR_PICKUP: "#2E9E5B",
  OUT_FOR_DELIVERY: "#2E9E5B",
  DELIVERED: "#6B6B6B",
  CANCELLED: "#D64545",
};

export const NON_TERMINAL_STATUSES: OrderStatus[] = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
];
