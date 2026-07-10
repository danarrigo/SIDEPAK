import { pgTable, serial, integer, timestamp, varchar, uuid, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { members } from "./members";

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  iconUrl: varchar("icon_url", { length: 255 }),
  requirementType: varchar("requirement_type", { length: 100 }), // e.g., 'reach_level_10', 'save_100k'
  requirementValue: integer("requirement_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberBadges = pgTable("member_badges", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  rewardPoints: integer("reward_points").notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(), // 'daily', 'weekly', 'one-time'
  actionType: varchar("action_type", { length: 100 }), // e.g., 'saving', 'borrowing'
  targetCount: integer("target_count").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberQuests = pgTable("member_quests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  questId: integer("quest_id").notNull().references(() => quests.id, { onDelete: 'cascade' }),
  progress: integer("progress").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  unq: uniqueIndex("member_quest_unq").on(table.memberId, table.questId)
}));
