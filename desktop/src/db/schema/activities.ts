import { pgTable, serial, integer, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { members } from "./members";
import { cooperatives } from "./cooperatives";
import { seasons } from "./gamification";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  cooperativeId: integer("cooperative_id").notNull().references(() => cooperatives.id, { onDelete: 'cascade' }),
  creatorId: integer("creator_id").references(() => members.id, { onDelete: 'set null' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).default('pending_approval').notNull(), // 'pending_approval', 'active', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cooperativeMatches = pgTable("cooperative_matches", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  cooperativeAId: integer("cooperative_a_id").notNull().references(() => cooperatives.id, { onDelete: 'cascade' }),
  cooperativeBId: integer("cooperative_b_id").notNull().references(() => cooperatives.id, { onDelete: 'cascade' }),
  scoreA: integer("score_a").default(0).notNull(),
  scoreB: integer("score_b").default(0).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).default('ongoing').notNull(), // 'ongoing', 'completed'
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => cooperativeMatches.id, { onDelete: 'cascade' }), // Added for Head-to-Head Guild Wars
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

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 50 }).default('registered').notNull(), // 'registered', 'attended', 'cancelled'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
