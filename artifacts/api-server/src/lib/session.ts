import { Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function getSessionUser(req: Request): number | null {
  return req.session?.userId ?? null;
}

export function requireAuth(req: Request): number {
  const userId = getSessionUser(req);
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}
