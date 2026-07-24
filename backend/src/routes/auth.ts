import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, signToken, type UserRole } from "../auth";

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([
    "CUSTOMER",
    "RESTAURANT_ADMIN",
    "RESTAURANT_STAFF",
    "DELIVERY_RIDER",
  ]),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  const token = signToken({ sub: user.id, role: user.role as UserRole });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: user.id, role: user.role as UserRole });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

const pushTokenSchema = z.object({
  pushToken: z.string().min(1).nullable(),
});

authRouter.post("/push-token", requireAuth, async (req, res) => {
  const parsed = pushTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  await prisma.user.update({
    where: { id: req.auth!.sub },
    data: { pushToken: parsed.data.pushToken },
  });
  res.status(204).end();
});
