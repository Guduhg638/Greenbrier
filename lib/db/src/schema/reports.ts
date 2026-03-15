import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";
import { reviewsTable } from "./reviews";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviewsTable.id, { onDelete: "cascade" }),
  reporterUserId: integer("reporter_user_id")
    .references(() => usersTable.id, { onDelete: "set null" }),
  reason: text("reason").notNull(), // 'fake' | 'harmful' | 'personal_info' | 'spam' | 'other'
  details: text("details"),
  status: text("status").notNull().default("pending"), // 'pending' | 'resolved' | 'dismissed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
