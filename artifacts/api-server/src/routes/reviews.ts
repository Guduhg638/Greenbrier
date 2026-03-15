import { Router, type IRouter, type Request, type Response } from "express";
import { db, peopleTable, reviewsTable, usersTable } from "@workspace/db";
import { eq, sql, desc, and, isNull } from "drizzle-orm";
import { getSessionUser } from "../lib/session.js";

const router: IRouter = Router();

router.get("/:slug/reviews", async (req: Request, res: Response) => {
  try {
    const [person] = await db.select().from(peopleTable).where(eq(peopleTable.slug, req.params.slug)).limit(1);
    if (!person) {
      res.status(404).json({ error: "Person not found" });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.personId, person.id), isNull(reviewsTable.removed)))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.personId, person.id), isNull(reviewsTable.removed)));

    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        personId: r.personId,
        personName: person.name,
        personSlug: person.slug,
        flagType: r.flagType,
        rating: r.rating,
        text: r.text,
        reportCount: r.reportCount,
        createdAt: r.createdAt,
      })),
      total: Number(count),
      page,
      limit,
    });
  } catch (err) {
    console.error("get reviews error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:slug/reviews", async (req: Request, res: Response) => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user?.emailVerified) {
      res.status(403).json({ error: "You must verify your email before leaving reviews" });
      return;
    }

    const [person] = await db.select().from(peopleTable).where(eq(peopleTable.slug, req.params.slug)).limit(1);
    if (!person) {
      res.status(404).json({ error: "Person not found" });
      return;
    }

    const { flagType, rating, text } = req.body;

    if (!["good", "bad"].includes(flagType)) {
      res.status(400).json({ error: "flagType must be 'good' or 'bad'" });
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "rating must be between 1 and 5" });
      return;
    }
    if (!text || text.trim().length < 10) {
      res.status(400).json({ error: "Review text must be at least 10 characters" });
      return;
    }
    if (text.trim().length > 1000) {
      res.status(400).json({ error: "Review text must be 1000 characters or fewer" });
      return;
    }

    const [review] = await db.insert(reviewsTable).values({
      personId: person.id,
      reviewerUserId: userId,
      flagType,
      rating,
      text: text.trim(),
    }).returning();

    await db.execute(sql`
      UPDATE people SET
        review_count = review_count + 1,
        good_count = CASE WHEN ${flagType} = 'good' THEN good_count + 1 ELSE good_count END,
        bad_count = CASE WHEN ${flagType} = 'bad' THEN bad_count + 1 ELSE bad_count END,
        avg_rating = (
          SELECT AVG(rating) FROM reviews
          WHERE person_id = ${person.id} AND removed IS NULL
        )
      WHERE id = ${person.id}
    `);

    res.status(201).json({
      id: review.id,
      personId: review.personId,
      personName: person.name,
      personSlug: person.slug,
      flagType: review.flagType,
      rating: review.rating,
      text: review.text,
      reportCount: review.reportCount,
      createdAt: review.createdAt,
    });
  } catch (err) {
    console.error("create review error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
