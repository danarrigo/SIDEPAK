import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nik: varchar("nik", { length: 20 }).notNull().unique(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  jenisKelamin: varchar("jenis_kelamin", { length: 20 }),
  nomorHp: varchar("nomor_hp", { length: 30 }),
  kataSandi: varchar("kata_sandi", { length: 255 }).notNull(),
  provinsi: varchar("provinsi", { length: 100 }),
  kabupaten: varchar("kabupaten", { length: 100 }),
  kecamatan: varchar("kecamatan", { length: 100 }),
  desa: varchar("desa", { length: 100 }),
  koperasi: varchar("koperasi", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
