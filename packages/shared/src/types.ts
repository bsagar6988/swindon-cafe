export type UserRole =
  | "CUSTOMER"
  | "RESTAURANT_ADMIN"
  | "RESTAURANT_STAFF"
  | "DELIVERY_RIDER";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  lat?: number | null;
  lng?: number | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  priceCents: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface DeliveryAssignment {
  id: string;
  riderId: string;
  riderName: string;
  currentLat?: number | null;
  currentLng?: number | null;
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  deliveryAddress: Address;
  createdAt: string;
  updatedAt: string;
  assignment?: DeliveryAssignment | null;
  review?: Review | null;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  at: string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}
