import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";
import { peopleTable } from "./people";
import { z } from "zod/v4";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  personId: integer("person_id")
    .notNull()
    .references(() => peopleTable.id, { onDelete: "cascade" }),
  reviewerUserId: integer("reviewer_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  flagType: text("flag_type").notNull(), // 'good' | 'bad'
  rating: integer("rating").notNull(), // 1-5
  text: text("text").notNull(),
  reportCount: integer("report_count").notNull().default(0),
  removed: text("removed"), // null = visible, 'moderation' = removed by mod
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
  reportCount: true,
  removed: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
