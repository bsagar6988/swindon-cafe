import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const menuRouter = Router();

// Public marketplace menu — always scoped to a specific restaurant.
menuRouter.get("/", async (req, res) => {
  const restaurantId = req.query.restaurantId as string | undefined;
  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId query param is required" });
  }
  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({ where: { category: { restaurantId } } }),
  ]);
  res.json({ categories, items });
});

// A restaurant admin's own full menu (including unavailable items), scoped
// to their JWT — used by the restaurant app's menu management screen.
menuRouter.get(
  "/mine",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const restaurantId = req.auth!.restaurantId;
    if (!restaurantId) {
      return res.status(404).json({ error: "No restaurant assigned to this account" });
    }
    const [categories, items] = await Promise.all([
      prisma.menuCategory.findMany({
        where: { restaurantId },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.menuItem.findMany({ where: { category: { restaurantId } } }),
    ]);
    res.json({ categories, items });
  }
);

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
    if (!req.auth!.restaurantId) {
      return res.status(404).json({ error: "No restaurant assigned to this account" });
    }
    const category = await prisma.menuCategory.create({
      data: { ...parsed.data, restaurantId: req.auth!.restaurantId },
    });
    res.status(201).json(category);
  }
);

const categoryUpdateSchema = categorySchema.partial();

menuRouter.patch(
  "/categories/:id",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = categoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const existing = await prisma.menuCategory.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Category not found" });
    if (existing.restaurantId !== req.auth!.restaurantId) {
      return res.status(403).json({ error: "This category belongs to a different restaurant" });
    }
    const category = await prisma.menuCategory.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(category);
  }
);

menuRouter.delete(
  "/categories/:id",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const category = await prisma.menuCategory.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ error: "Category not found" });
    if (category.restaurantId !== req.auth!.restaurantId) {
      return res.status(403).json({ error: "This category belongs to a different restaurant" });
    }

    const itemCount = await prisma.menuItem.count({ where: { categoryId: category.id } });
    if (itemCount > 0) {
      return res.status(400).json({
        error: "Move or remove the items in this category before deleting it.",
      });
    }

    await prisma.menuCategory.delete({ where: { id: category.id } });
    res.status(204).end();
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
    const category = await prisma.menuCategory.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category || category.restaurantId !== req.auth!.restaurantId) {
      return res.status(403).json({ error: "This category belongs to a different restaurant" });
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
    const existing = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    if (existing.category.restaurantId !== req.auth!.restaurantId) {
      return res.status(403).json({ error: "This item belongs to a different restaurant" });
    }
    if (parsed.data.categoryId) {
      const newCategory = await prisma.menuCategory.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (!newCategory || newCategory.restaurantId !== req.auth!.restaurantId) {
        return res.status(403).json({ error: "This category belongs to a different restaurant" });
      }
    }
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(item);
  }
);
