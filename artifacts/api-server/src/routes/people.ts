import { Router, type IRouter, type Request, type Response } from "express";
import { db, peopleTable, usersTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import { getSessionUser } from "../lib/session.js";

const router: IRouter = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q) {
      res.json({ people: [], total: 0 });
      return;
    }

    const results = await db
      .select()
      .from(peopleTable)
      .where(ilike(peopleTable.name, `%${q}%`))
      .limit(20);

    res.json({
      people: results.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        avgRating: p.avgRating ?? null,
        reviewCount: p.reviewCount,
        goodCount: p.goodCount,
        badCount: p.badCount,
        createdAt: p.createdAt,
      })),
      total: results.length,
    });
  } catch (err) {
    console.error("search error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const userId = getSessionUser(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user?.emailVerified) {
      res.status(403).json({ error: "You must verify your email before adding people" });
      return;
    }

    const { name, description } = req.body;
    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: "Name must be at least 2 characters" });
      return;
    }
    if (name.trim().length > 100) {
      res.status(400).json({ error: "Name must be 100 characters or fewer" });
      return;
    }

    let slug = slugify(name.trim());
    const existing = await db.select({ id: peopleTable.id }).from(peopleTable).where(eq(peopleTable.slug, slug)).limit(1);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const [person] = await db.insert(peopleTable).values({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
    }).returning();

    res.status(201).json({
      id: person.id,
      name: person.name,
      slug: person.slug,
      description: person.description ?? null,
      avgRating: person.avgRating ?? null,
      reviewCount: person.reviewCount,
      goodCount: person.goodCount,
      badCount: person.badCount,
      createdAt: person.createdAt,
    });
  } catch (err) {
    console.error("create person error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const [person] = await db.select().from(peopleTable).where(eq(peopleTable.slug, req.params.slug)).limit(1);
    if (!person) {
      res.status(404).json({ error: "Person not found" });
      return;
    }

    res.json({
      id: person.id,
      name: person.name,
      slug: person.slug,
      description: person.description ?? null,
      avgRating: person.avgRating ?? null,
      reviewCount: person.reviewCount,
      goodCount: person.goodCount,
      badCount: person.badCount,
      createdAt: person.createdAt,
    });
  } catch (err) {
    console.error("get person error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
