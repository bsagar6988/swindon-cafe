import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";

export const settingsRouter = Router();

const SETTINGS_ID = "singleton";

export async function getRestaurantSettings() {
  const existing = await prisma.restaurantSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.restaurantSettings.create({ data: { id: SETTINGS_ID, isOpen: true } });
}

settingsRouter.get("/", async (_req, res) => {
  const settings = await getRestaurantSettings();
  res.json({ isOpen: settings.isOpen });
});

const updateSettingsSchema = z.object({
  isOpen: z.boolean(),
});

settingsRouter.patch(
  "/",
  requireAuth,
  requireRole("RESTAURANT_ADMIN", "RESTAURANT_STAFF"),
  async (req, res) => {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    await getRestaurantSettings();
    const updated = await prisma.restaurantSettings.update({
      where: { id: SETTINGS_ID },
      data: { isOpen: parsed.data.isOpen },
    });
    res.json({ isOpen: updated.isOpen });
  }
);
