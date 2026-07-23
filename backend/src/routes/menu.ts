import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const menuRouter = Router();

menuRouter.get("/", async (_req, res) => {
  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.menuItem.findMany(),
  ]);
  res.json({ categories, items });
});

const categorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

menuRouter.post(
  "/categories",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const category = await prisma.menuCategory.create({ data: parsed.data });
    res.status(201).json(category);
  }
);

const itemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().positive(),
  imageUrl: z.string().nullable().optional(),
  isAvailable: z.boolean().default(true),
});

menuRouter.post(
  "/items",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = itemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await prisma.menuItem.create({ data: parsed.data });
    res.status(201).json(item);
  }
);

const itemUpdateSchema = itemSchema.partial();

menuRouter.patch(
  "/items/:id",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = itemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(item);
  }
);
