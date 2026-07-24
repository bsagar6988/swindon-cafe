import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { orderInclude, serializeOrder } from "../serializers";
import { emitNewOrder, emitOrderUpdate } from "../realtime";
import { getRestaurantSettings } from "./settings";
import { ORDER_STATUS_PUSH_MESSAGES, sendPushNotification } from "../push";

export const ordersRouter = Router();

const FLAT_DELIVERY_FEE_CENTS = 299;

const createOrderSchema = z.object({
  addressId: z.string().min(1),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().positive(),
        notes: z.string().max(300).nullable().optional(),
      })
    )
    .min(1),
});

ordersRouter.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { addressId, items } = parsed.data;

    const settings = await getRestaurantSettings();
    if (!settings.isOpen) {
      return res
        .status(400)
        .json({ error: "The restaurant is currently closed and not accepting orders." });
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.customerId !== req.auth!.sub) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
    });
    if (menuItems.length !== items.length) {
      return res.status(400).json({ error: "One or more menu items not found" });
    }
    const unavailable = menuItems.find((m) => !m.isAvailable);
    if (unavailable) {
      return res
        .status(400)
        .json({ error: `${unavailable.name} is currently unavailable` });
    }

    const subtotalCents = items.reduce((sum, i) => {
      const menuItem = menuItems.find((m) => m.id === i.menuItemId)!;
      return sum + menuItem.priceCents * i.quantity;
    }, 0);
    const totalCents = subtotalCents + FLAT_DELIVERY_FEE_CENTS;

    const order = await prisma.order.create({
      data: {
        customerId: req.auth!.sub,
        deliveryAddressId: addressId,
        subtotalCents,
        deliveryFeeCents: FLAT_DELIVERY_FEE_CENTS,
        totalCents,
        status: "PLACED",
        items: {
          create: items.map((i) => {
            const menuItem = menuItems.find((m) => m.id === i.menuItemId)!;
            return {
              menuItemId: menuItem.id,
              name: menuItem.name,
              priceCents: menuItem.priceCents,
              quantity: i.quantity,
              notes: i.notes ?? null,
            };
          }),
        },
        statusEvents: { create: { status: "PLACED" } },
      },
      include: orderInclude,
    });

    const serialized = serializeOrder(order);
    emitNewOrder(serialized);
    res.status(201).json(serialized);
  }
);

ordersRouter.get("/:id", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: orderInclude,
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const serialized = serializeOrder(order);
  if (req.auth!.role === "RESTAURANT_ADMIN" || req.auth!.role === "RESTAURANT_STAFF") {
    const customerOrderCount = await prisma.order.count({
      where: { customerId: order.customerId },
    });
    res.json({ ...serialized, customerOrderCount });
    return;
  }
  res.json(serialized);
});

ordersRouter.get("/", requireAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  const where =
    req.auth!.role === "CUSTOMER"
      ? { customerId: req.auth!.sub, ...(status ? { status: status as any } : {}) }
      : req.auth!.role === "DELIVERY_RIDER"
      ? {
          assignment: { riderId: req.auth!.sub },
          ...(status ? { status: status as any } : {}),
        }
      : status
      ? { status: status as any }
      : {};

  const orders = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(orders.map(serializeOrder));
});

const RESTAURANT_TRANSITIONS: Record<string, string[]> = {
  PLACED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
};

const RIDER_TRANSITIONS: Record<string, string[]> = {
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

const CUSTOMER_TRANSITIONS: Record<string, string[]> = {
  PLACED: ["CANCELLED"],
};

const statusSchema = z.object({
  status: z.enum([
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

ordersRouter.post("/:id/status", requireAuth, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { status: nextStatus } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: orderInclude,
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const role = req.auth!.role;
  if (role === "RESTAURANT_ADMIN" || role === "RESTAURANT_STAFF") {
    const allowed = RESTAURANT_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res
        .status(400)
        .json({ error: `Cannot move order from ${order.status} to ${nextStatus}` });
    }
  } else if (role === "DELIVERY_RIDER") {
    if (order.assignment?.riderId !== req.auth!.sub) {
      return res.status(403).json({ error: "Not assigned to this order" });
    }
    const allowed = RIDER_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res
        .status(400)
        .json({ error: `Cannot move order from ${order.status} to ${nextStatus}` });
    }
  } else if (role === "CUSTOMER") {
    if (order.customerId !== req.auth!.sub) {
      return res.status(403).json({ error: "Not your order" });
    }
    const allowed = CUSTOMER_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        error: "This order can no longer be cancelled — the restaurant has already started on it.",
      });
    }
  } else {
    return res.status(403).json({ error: "Forbidden for this role" });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      statusEvents: { create: { status: nextStatus } },
    },
    include: orderInclude,
  });

  const serialized = serializeOrder(updated);
  emitOrderUpdate(order.id, serialized);

  const pushMessage = ORDER_STATUS_PUSH_MESSAGES[nextStatus];
  if (pushMessage && role !== "CUSTOMER") {
    sendPushNotification(updated.customer.pushToken, "Order update", pushMessage);
  }

  res.json(serialized);
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

ordersRouter.post(
  "/:id/review",
  requireAuth,
  requireRole("CUSTOMER"),
  async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.customerId !== req.auth!.sub) {
      return res.status(403).json({ error: "Not your order" });
    }
    if (order.status !== "DELIVERED") {
      return res
        .status(400)
        .json({ error: "You can only review an order after it's been delivered" });
    }
    if (order.review) {
      return res.status(409).json({ error: "This order already has a review" });
    }

    await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: req.auth!.sub,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
    });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: orderInclude,
    });
    const serialized = serializeOrder(updated!);
    emitOrderUpdate(order.id, serialized);
    res.status(201).json(serialized.review);
  }
);
