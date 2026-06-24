import { pgTable, serial, integer, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { members } from "./members";
import { cooperatives } from "./cooperatives";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  cooperativeId: integer("cooperative_id").notNull().references(() => cooperatives.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  opponentId: integer("opponent_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  challengerPoints: integer("challenger_points").default(0).notNull(),
  opponentPoints: integer("opponent_points").default(0).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  winnerId: integer("winner_id").references(() => members.id), // null if ongoing or draw
  status: varchar("status", { length: 50 }).default('ongoing').notNull(), // 'ongoing', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
