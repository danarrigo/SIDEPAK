import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  nomorAnggota: varchar("nomor_anggota", { length: 50 }).unique(),
  statusAnggota: varchar("status_anggota", { length: 20 }).default('pending').notNull(),
  nik: varchar("nik", { length: 20 }).notNull().unique(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  jenisKelamin: varchar("jenis_kelamin", { length: 20 }),
  nomorHp: varchar("nomor_hp", { length: 30 }),
  provinsi: varchar("provinsi", { length: 100 }),
  kabupaten: varchar("kabupaten", { length: 100 }),
  kecamatan: varchar("kecamatan", { length: 100 }),
  desa: varchar("desa", { length: 100 }),
  koperasi: varchar("koperasi", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
