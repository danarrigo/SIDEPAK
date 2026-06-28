import { pgTable, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { members } from "./members";

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  invoiceId: varchar("invoice_id", { length: 255 }).unique().notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'paid'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
