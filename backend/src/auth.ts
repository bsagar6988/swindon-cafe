import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserRole =
  | "APP_ADMIN"
  | "CUSTOMER"
  | "RESTAURANT_ADMIN"
  | "RESTAURANT_STAFF"
  | "DELIVERY_RIDER";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-me";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  restaurantId?: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Forbidden for this role" });
    }
    next();
  };
}
