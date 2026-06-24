import { eq } from "drizzle-orm";
import { db } from "../db";
import { cooperatives } from "../db/schema";

// Type definitions based on your Drizzle schema
export type NewCooperative = typeof cooperatives.$inferInsert;
export type UpdateCooperative = Partial<NewCooperative>;

export class CooperativesService {
  /**
   * Create a new cooperative
   */
  static async create(data: NewCooperative) {
    const [cooperative] = await db.insert(cooperatives).values(data).returning();
    return cooperative;
  }

  /**
   * Get a cooperative by ID
   */
  static async getById(id: number) {
    const [cooperative] = await db.select().from(cooperatives).where(eq(cooperatives.id, id));
    return cooperative;
  }

  /**
   * Get all cooperatives
   */
  static async getAll() {
    return await db.select().from(cooperatives);
  }

  /**
   * Update a cooperative by ID
   */
  static async update(id: number, data: UpdateCooperative) {
    const [cooperative] = await db
      .update(cooperatives)
      .set(data)
      .where(eq(cooperatives.id, id))
      .returning();
    return cooperative;
  }

  /**
   * Delete a cooperative by ID
   */
  static async delete(id: number) {
    const [cooperative] = await db.delete(cooperatives).where(eq(cooperatives.id, id)).returning();
    return cooperative;
  }
}
