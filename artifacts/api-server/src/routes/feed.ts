import { Router, type IRouter, type Request, type Response } from "express";
import { db, reviewsTable, peopleTable } from "@workspace/db";
import { eq, desc, isNull, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        review: reviewsTable,
        person: {
          name: peopleTable.name,
          slug: peopleTable.slug,
        },
      })
      .from(reviewsTable)
      .innerJoin(peopleTable, eq(reviewsTable.personId, peopleTable.id))
      .where(isNull(reviewsTable.removed))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewsTable)
      .where(isNull(reviewsTable.removed));

    res.json({
      items: rows.map(row => ({
        review: {
          id: row.review.id,
          personId: row.review.personId,
          personName: row.person.name,
          personSlug: row.person.slug,
          flagType: row.review.flagType,
          rating: row.review.rating,
          text: row.review.text,
          reportCount: row.review.reportCount,
          createdAt: row.review.createdAt,
        },
      })),
      total: Number(count),
      page,
      limit,
    });
  } catch (err) {
    console.error("feed error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
