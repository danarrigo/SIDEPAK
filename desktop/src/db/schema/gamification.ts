import { pgTable, serial, integer, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";
import { members } from "./members";
import { cooperatives } from "./cooperatives";

export const memberProgress = pgTable("member_progress", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().unique().references(() => members.id, { onDelete: 'cascade' }),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  pointsBalance: integer("points_balance").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  activeEffect: varchar("active_effect", { length: 255 }),
  walletBalance: integer("wallet_balance").default(0).notNull(),
  creditScore: integer("credit_score").default(700).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  priceInPoints: integer("price_in_points").notNull(),
  effectType: varchar("effect_type", { length: 100 }).notNull(), // e.g., 'freeze_streak', 'prank'
  effectValue: varchar("effect_value", { length: 255 }), // optional modifier
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberItems = pgTable("member_items", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // can be positive or negative
  source: varchar("source", { length: 100 }).notNull(), // e.g., 'quest', 'battle', 'saving', 'loan', 'purchase'
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  priceInPoints: integer("price_in_points").notNull(),
  stock: integer("stock").default(1).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceTransactions = pgTable("marketplace_transactions", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  sellerId: integer("seller_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  marketplaceItemId: integer("marketplace_item_id").notNull().references(() => marketplaceItems.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").default(1).notNull(),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const koperasiSeasonScores = pgTable("koperasi_season_scores", {
  id: serial("id").primaryKey(),
  koperasiId: integer("koperasi_id").notNull().references(() => cooperatives.id, { onDelete: 'cascade' }),
  seasonId: integer("season_id").notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  totalXp: integer("total_xp").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
