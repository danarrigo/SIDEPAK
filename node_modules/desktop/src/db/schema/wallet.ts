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

export const disbursements = pgTable("disbursements", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(),
  bankCode: varchar("bank_code", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default('PENDING').notNull(), // 'PENDING', 'COMPLETED', 'FAILED'
  externalId: varchar("external_id", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
