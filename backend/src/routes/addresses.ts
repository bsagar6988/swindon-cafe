import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { serializeAddress } from "../serializers";

export const addressesRouter = Router();

addressesRouter.get("/", requireAuth, async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { customerId: req.auth!.sub },
  });
  res.json(addresses.map(serializeAddress));
});

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

addressesRouter.post("/", requireAuth, async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const address = await prisma.address.create({
    data: { ...parsed.data, customerId: req.auth!.sub },
  });
  res.status(201).json(serializeAddress(address));
});
