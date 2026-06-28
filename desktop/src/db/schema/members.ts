import { pgTable, serial, varchar, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { cooperatives } from "./cooperatives";
import { relations } from "drizzle-orm";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  nomorAnggota: varchar("nomor_anggota", { length: 50 }).unique(),
  statusAnggota: varchar("status_anggota", { length: 20 }).default('active').notNull(),
  nik: varchar("nik", { length: 20 }).notNull().unique(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  jenisKelamin: varchar("jenis_kelamin", { length: 20 }),
  nomorHp: varchar("nomor_hp", { length: 30 }),
  provinsi: varchar("provinsi", { length: 100 }),
  kabupaten: varchar("kabupaten", { length: 100 }),
  kecamatan: varchar("kecamatan", { length: 100 }),
  desa: varchar("desa", { length: 100 }),
  cooperativeId: integer("cooperative_id").references(() => cooperatives.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const membersRelations = relations(members, ({ one }) => ({
  cooperative: one(cooperatives, {
    fields: [members.cooperativeId],
    references: [cooperatives.id],
  }),
}));
