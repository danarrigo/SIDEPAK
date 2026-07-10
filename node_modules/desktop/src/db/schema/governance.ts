import { pgTable, serial, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { members } from "./members";

import { cooperatives } from "./cooperatives";

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),
  status: varchar("status", { length: 50 }).default('active').notNull(), // 'active', 'passed', 'rejected'
  targetQuorumPercentage: integer("target_quorum_percentage").default(50).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  cooperativeId: integer("cooperative_id").references(() => cooperatives.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  voteType: varchar("vote_type", { length: 50 }).notNull(), // 'agree', 'reject', 'abstain'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
