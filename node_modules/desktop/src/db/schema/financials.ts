import { pgTable, serial, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { members } from "./members";

export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // deposit amount
  type: varchar("type", { length: 100 }).default('deposit').notNull(), // 'deposit', 'withdrawal'
  description: varchar("description", { length: 500 }),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // borrowed amount
  interestRate: integer("interest_rate").default(0).notNull(), // percentage or fixed
  status: varchar("status", { length: 50 }).default('pending').notNull(), // 'pending', 'approved', 'paid', 'defaulted'
  dueDate: timestamp("due_date"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dues = pgTable("dues", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 100 }).default('monthly').notNull(), // 'monthly', 'initial' (iuran wajib, iuran pokok)
  status: varchar("status", { length: 50 }).default('paid').notNull(), // 'paid', 'unpaid'
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
