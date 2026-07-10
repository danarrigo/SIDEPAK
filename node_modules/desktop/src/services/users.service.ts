import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<NewUser>;

export class UsersService {
  static async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  static async getById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async getByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  static async getAll() {
    return await db.select().from(users);
  }

  static async update(id: string, data: UpdateUser) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  static async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
  }
}
