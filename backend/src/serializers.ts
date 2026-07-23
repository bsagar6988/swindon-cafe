import type {
  Address as PAddress,
  DeliveryAssignment as PAssignment,
  Order as POrder,
  OrderItem as POrderItem,
  Review as PReview,
  User as PUser,
} from "@prisma/client";

export function serializeAddress(a: PAddress) {
  return {
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    lat: a.lat,
    lng: a.lng,
  };
}

type OrderWithRelations = POrder & {
  items: POrderItem[];
  customer: PUser;
  deliveryAddress: PAddress;
  assignment: (PAssignment & { rider: PUser }) | null;
  review: PReview | null;
};

export function serializeOrder(order: OrderWithRelations) {
  return {
    id: order.id,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status,
    items: order.items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      priceCents: i.priceCents,
      quantity: i.quantity,
    })),
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    deliveryAddress: serializeAddress(order.deliveryAddress),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    assignment: order.assignment
      ? {
          id: order.assignment.id,
          riderId: order.assignment.riderId,
          riderName: order.assignment.rider.name,
          currentLat: order.assignment.currentLat,
          currentLng: order.assignment.currentLng,
        }
      : null,
    review: order.review
      ? {
          id: order.review.id,
          orderId: order.review.orderId,
          rating: order.review.rating,
          comment: order.review.comment,
          createdAt: order.review.createdAt.toISOString(),
        }
      : null,
  };
}

export const orderInclude = {
  items: true,
  customer: true,
  deliveryAddress: true,
  assignment: { include: { rider: true } },
  review: true,
} as const;
