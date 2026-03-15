import { Router, type IRouter, type Request, type Response } from "express";
import { db, reportsTable, reviewsTable, peopleTable, usersTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { getSessionUser } from "../lib/session.js";

const router: IRouter = Router();

async function requireMod(req: Request, res: Response): Promise<boolean> {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user?.isMod) {
    res.status(403).json({ error: "Moderator access required" });
    return false;
  }
  return true;
}

router.get("/reports", async (req: Request, res: Response) => {
  if (!(await requireMod(req, res))) return;

  try {
    const status = (req.query.status as string) || "pending";

    const rows = await db
      .select({
        report: reportsTable,
        review: {
          id: reviewsTable.id,
          text: reviewsTable.text,
          flagType: reviewsTable.flagType,
        },
        person: {
          name: peopleTable.name,
          slug: peopleTable.slug,
        },
      })
      .from(reportsTable)
      .innerJoin(reviewsTable, eq(reportsTable.reviewId, reviewsTable.id))
      .innerJoin(peopleTable, eq(reviewsTable.personId, peopleTable.id))
      .where(eq(reportsTable.status, status))
      .orderBy(desc(reportsTable.createdAt))
      .limit(100);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportsTable)
      .where(eq(reportsTable.status, status));

    res.json({
      reports: rows.map(row => ({
        id: row.report.id,
        reviewId: row.report.reviewId,
        reviewText: row.review.text,
        reviewFlagType: row.review.flagType,
        personName: row.person.name,
        personSlug: row.person.slug,
        reason: row.report.reason,
        details: row.report.details ?? null,
        status: row.report.status,
        createdAt: row.report.createdAt,
      })),
      total: Number(count),
    });
  } catch (err) {
    console.error("get reports error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/reports/:id", async (req: Request, res: Response) => {
  if (!(await requireMod(req, res))) return;

  try {
    const reportId = parseInt(req.params.id);
    const { action, removeReview } = req.body;

    if (!["resolve", "dismiss"].includes(action)) {
      res.status(400).json({ error: "action must be 'resolve' or 'dismiss'" });
      return;
    }

    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, reportId)).limit(1);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const newStatus = action === "resolve" ? "resolved" : "dismissed";
    await db.update(reportsTable)
      .set({ status: newStatus })
      .where(eq(reportsTable.id, reportId));

    if (action === "resolve" && removeReview) {
      await db.update(reviewsTable)
        .set({ removed: "moderation" })
        .where(eq(reviewsTable.id, report.reviewId));

      const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, report.reviewId)).limit(1);
      if (review) {
        await db.execute(sql`
          UPDATE people SET
            review_count = GREATEST(0, review_count - 1),
            good_count = CASE WHEN ${review.flagType} = 'good' THEN GREATEST(0, good_count - 1) ELSE good_count END,
            bad_count = CASE WHEN ${review.flagType} = 'bad' THEN GREATEST(0, bad_count - 1) ELSE bad_count END,
            avg_rating = (
              SELECT AVG(rating) FROM reviews
              WHERE person_id = ${review.personId} AND removed IS NULL
            )
          WHERE id = ${review.personId}
        `);
      }
    }

    res.json({ message: `Report ${newStatus}${removeReview ? " and review removed" : ""}` });
  } catch (err) {
    console.error("resolve report error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
