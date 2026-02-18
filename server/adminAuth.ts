import type { RequestHandler } from "express";
import { isAuthenticated } from "./replit_integrations/auth";

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS
  ? process.env.ADMIN_USER_IDS.split(",").map(id => id.trim()).filter(Boolean)
  : null;

if (!ADMIN_USER_IDS || ADMIN_USER_IDS.length === 0) {
  console.warn("[admin] WARNING: ADMIN_USER_IDS not set. Admin panel will accept any authenticated user. Set ADMIN_USER_IDS to restrict access.");
}

export const isAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  if (ADMIN_USER_IDS && ADMIN_USER_IDS.length > 0) {
    if (!user.claims || !ADMIN_USER_IDS.includes(user.claims.sub)) {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
  }

  next();
};
