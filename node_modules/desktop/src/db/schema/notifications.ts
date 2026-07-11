import { pgTable, serial, integer, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { members } from "./members";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
