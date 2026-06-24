import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

// Type definitions based on your Drizzle schema
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<NewUser>;

export class UsersService {
  /**
   * Create a new user
   */
  static async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  /**
   * Get a user by ID
   */
  static async getById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Get a user by Email
   */
  static async getByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  /**
   * Get a user by NIK
   */
  static async getByNik(nik: string) {
    const [user] = await db.select().from(users).where(eq(users.nik, nik));
    return user;
  }

  /**
   * Get all users
   */
  static async getAll() {
    return await db.select().from(users);
  }

  /**
   * Update a user by ID
   */
  static async update(id: number, data: UpdateUser) {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  /**
   * Delete a user by ID
   */
  static async delete(id: number) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
  }
}
