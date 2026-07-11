import { eq } from "drizzle-orm";
import { db } from "../db";
import { members } from "../db/schema";

export type NewMember = typeof members.$inferInsert;
export type UpdateMember = Partial<NewMember>;

export class MembersService {
  static async create(data: NewMember) {
    const [member] = await db.insert(members).values(data).returning();
    return member;
  }

  static async getById(id: number) {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  static async getByUserId(userId: string) {
    const [member] = await db.select().from(members).where(eq(members.userId, userId));
    return member;
  }

  static async getByNik(nik: string) {
    const [member] = await db.select().from(members).where(eq(members.nik, nik));
    return member;
  }

  static async getByNomorAnggota(nomorAnggota: string) {
    const [member] = await db.select().from(members).where(eq(members.nomorAnggota, nomorAnggota));
    return member;
  }

  static async getAll() {
    return await db.select().from(members);
  }

  static async update(id: number, data: UpdateMember) {
    const [member] = await db
      .update(members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  static async delete(id: number) {
    const [member] = await db.delete(members).where(eq(members.id, id)).returning();
    return member;
  }
}
