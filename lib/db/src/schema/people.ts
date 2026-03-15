import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const peopleTable = pgTable("people", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  reviewCount: integer("review_count").notNull().default(0),
  goodCount: integer("good_count").notNull().default(0),
  badCount: integer("bad_count").notNull().default(0),
  avgRating: real("avg_rating"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPersonSchema = createInsertSchema(peopleTable).omit({
  id: true,
  createdAt: true,
  reviewCount: true,
  goodCount: true,
  badCount: true,
  avgRating: true,
});

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof peopleTable.$inferSelect;
