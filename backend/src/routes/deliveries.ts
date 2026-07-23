import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { orderInclude, serializeOrder } from "../serializers";
import { emitOrderUpdate } from "../realtime";

export const deliveriesRouter = Router();

deliveriesRouter.get(
  "/available",
  requireAuth,
  requireRole("DELIVERY_RIDER"),
  async (_req, res) => {
    const orders = await prisma.order.findMany({
      where: { status: "READY_FOR_PICKUP", assignment: null },
      include: orderInclude,
      orderBy: { createdAt: "asc" },
    });
    res.json(orders.map(serializeOrder));
  }
);

deliveriesRouter.post(
  "/:orderId/accept",
  requireAuth,
  requireRole("DELIVERY_RIDER"),
  async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "READY_FOR_PICKUP" || order.assignment) {
      return res
        .status(400)
        .json({ error: "Order is not available for pickup" });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "OUT_FOR_DELIVERY",
        statusEvents: { create: { status: "OUT_FOR_DELIVERY" } },
        assignment: { create: { riderId: req.auth!.sub } },
      },
      include: orderInclude,
    });

    const serialized = serializeOrder(updated);
    emitOrderUpdate(order.id, serialized);
    res.json(serialized);
  }
);

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

deliveriesRouter.post(
  "/:orderId/location",
  requireAuth,
  requireRole("DELIVERY_RIDER"),
  async (req, res) => {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: orderInclude,
    });
    if (!order?.assignment || order.assignment.riderId !== req.auth!.sub) {
      return res.status(403).json({ error: "Not assigned to this order" });
    }

    await prisma.deliveryAssignment.update({
      where: { orderId: order.id },
      data: { currentLat: parsed.data.lat, currentLng: parsed.data.lng },
    });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: orderInclude,
    });
    const serialized = serializeOrder(updated!);
    emitOrderUpdate(order.id, serialized);
    res.status(204).end();
  }
);
