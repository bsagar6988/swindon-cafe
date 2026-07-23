import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const ridersRouter = Router();

function serializeRider(rider: { id: string; name: string; email: string; createdAt: Date }) {
  return {
    id: rider.id,
    name: rider.name,
    email: rider.email,
    createdAt: rider.createdAt.toISOString(),
  };
}

ridersRouter.get(
  "/",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (_req, res) => {
    const riders = await prisma.user.findMany({
      where: { role: "DELIVERY_RIDER" },
      orderBy: { createdAt: "desc" },
    });
    res.json(riders.map(serializeRider));
  }
);

const createRiderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

ridersRouter.post(
  "/",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = createRiderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rider = await prisma.user.create({
      data: { name, email, passwordHash, role: "DELIVERY_RIDER" },
    });

    res.status(201).json(serializeRider(rider));
  }
);

ridersRouter.delete(
  "/:id",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const rider = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!rider || rider.role !== "DELIVERY_RIDER") {
      return res.status(404).json({ error: "Rider not found" });
    }

    const assignmentCount = await prisma.deliveryAssignment.count({
      where: { riderId: rider.id },
    });
    if (assignmentCount > 0) {
      return res.status(400).json({
        error:
          "This rider has delivery history and can't be deleted. Remove is blocked to keep past orders intact.",
      });
    }

    await prisma.user.delete({ where: { id: rider.id } });
    res.status(204).end();
  }
);
