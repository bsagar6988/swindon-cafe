import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/summary",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const restaurantId = req.auth!.restaurantId;
    if (!restaurantId) {
      return res.status(404).json({ error: "No restaurant assigned to this account" });
    }
    const days = Math.min(Math.max(Number(req.query.days) || 14, 1), 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const [deliveredOrders, ordersInRange, bestSellersRaw] = await Promise.all([
      prisma.order.findMany({
        where: { status: "DELIVERED", restaurantId },
        select: { totalCents: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: since }, restaurantId },
        select: { createdAt: true, totalCents: true, status: true },
      }),
      prisma.orderItem.groupBy({
        by: ["name"],
        where: { order: { restaurantId } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const revenueTotalCents = deliveredOrders.reduce((sum, o) => sum + o.totalCents, 0);

    const byDay = new Map<string, { orders: number; revenueCents: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      byDay.set(d.toISOString().slice(0, 10), { orders: 0, revenueCents: 0 });
    }
    for (const o of ordersInRange) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const bucket = byDay.get(key);
      if (bucket) {
        bucket.orders += 1;
        if (o.status === "DELIVERED") bucket.revenueCents += o.totalCents;
      }
    }

    res.json({
      revenueTotalCents,
      ordersPerDay: Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v })),
      bestSellers: bestSellersRaw.map((b) => ({
        name: b.name,
        quantity: b._sum.quantity ?? 0,
      })),
    });
  }
);
