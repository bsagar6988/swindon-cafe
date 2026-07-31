import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const restaurantsRouter = Router();

function serializeRestaurant(r: {
  id: string;
  name: string;
  address: string | null;
  isOpen: boolean;
  createdAt: Date;
}) {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    isOpen: r.isOpen,
    createdAt: r.createdAt.toISOString(),
  };
}

// Public marketplace browse list — every restaurant on the platform.
restaurantsRouter.get("/", async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { name: "asc" } });
  res.json(restaurants.map(serializeRestaurant));
});

// APP_ADMIN management list, including each restaurant's admin contact.
restaurantsRouter.get("/admin", requireAuth, requireRole("APP_ADMIN"), async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: { admins: { where: { role: "RESTAURANT_ADMIN" }, select: { email: true } } },
  });
  res.json(
    restaurants.map((r) => ({
      ...serializeRestaurant(r),
      adminEmail: r.admins[0]?.email ?? null,
    }))
  );
});

// A restaurant admin's own restaurant — used to render/manage their own
// dashboard header and open/closed toggle, always derived from the JWT.
restaurantsRouter.get(
  "/mine",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    if (!req.auth!.restaurantId) {
      return res.status(404).json({ error: "No restaurant assigned to this account" });
    }
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.auth!.restaurantId },
    });
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(serializeRestaurant(restaurant));
  }
);

const updateMineSchema = z.object({ isOpen: z.boolean() });

restaurantsRouter.patch(
  "/mine",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    if (!req.auth!.restaurantId) {
      return res.status(404).json({ error: "No restaurant assigned to this account" });
    }
    const parsed = updateMineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const restaurant = await prisma.restaurant.update({
      where: { id: req.auth!.restaurantId },
      data: { isOpen: parsed.data.isOpen },
    });
    res.json(serializeRestaurant(restaurant));
  }
);

// Public restaurant detail — shown on the customer app's menu screen header.
restaurantsRouter.get("/:id", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
  res.json(serializeRestaurant(restaurant));
});

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).nullable().optional(),
});

restaurantsRouter.patch("/:id", requireAuth, requireRole("APP_ADMIN"), async (req, res) => {
  const parsed = updateRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Restaurant not found" });

  const restaurant = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(serializeRestaurant(restaurant));
});

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1).nullable().optional(),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

restaurantsRouter.post("/", requireAuth, requireRole("APP_ADMIN"), async (req, res) => {
  const parsed = createRestaurantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, address, adminName, adminEmail, adminPassword } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const { restaurant, admin } = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: { name, address: address ?? null },
    });
    const admin = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "RESTAURANT_ADMIN",
        restaurantId: restaurant.id,
      },
    });
    return { restaurant, admin };
  });

  res.status(201).json({
    restaurant: serializeRestaurant(restaurant),
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
});
