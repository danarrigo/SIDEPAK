import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { members } from "./members";

export const cooperatives = pgTable("cooperatives", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provinsi: varchar("provinsi", { length: 100 }),
  kabupaten: varchar("kabupaten", { length: 100 }),
  kecamatan: varchar("kecamatan", { length: 100 }),
  desa: varchar("desa", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cooperativesRelations = relations(cooperatives, ({ many }) => ({
  members: many(members),
}));
