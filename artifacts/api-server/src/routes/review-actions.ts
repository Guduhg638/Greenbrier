import { Router, type IRouter, type Request, type Response } from "express";
import { db, reviewsTable, reportsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "../lib/session.js";

const router: IRouter = Router();

router.post("/:id/report", async (req: Request, res: Response) => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const reviewId = parseInt(req.params.id);
    const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, reviewId)).limit(1);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const { reason, details } = req.body;
    const validReasons = ["fake", "harmful", "personal_info", "spam", "other"];
    if (!reason || !validReasons.includes(reason)) {
      res.status(400).json({ error: "Valid reason is required" });
      return;
    }

    const existing = await db
      .select({ id: reportsTable.id })
      .from(reportsTable)
      .where(and(eq(reportsTable.reviewId, reviewId), eq(reportsTable.reporterUserId, userId)))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "You have already reported this review" });
      return;
    }

    await db.insert(reportsTable).values({
      reviewId,
      reporterUserId: userId,
      reason,
      details: details?.trim() || null,
    });

    await db.update(reviewsTable)
      .set({ reportCount: sql`${reviewsTable.reportCount} + 1` })
      .where(eq(reviewsTable.id, reviewId));

    res.status(201).json({ message: "Report submitted. Our moderation team will review it." });
  } catch (err) {
    console.error("report review error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
