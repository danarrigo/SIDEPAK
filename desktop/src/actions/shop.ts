"use server";
import { db } from "@/db";
import { items, memberItems, memberProgress } from "@/db/schema/gamification";
import { eq, and } from "drizzle-orm";

export async function buyShopItem(memberId: number, itemId: number) {
  try {
    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    if (!item) return { success: false, error: "Item tidak ditemukan." };

    const price = item.priceInPoints;

    const progress = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (progress.length === 0) return { success: false, error: "Member progress not found" };

    if (progress[0].pointsBalance < price) {
      return { success: false, error: "Poin tidak mencukupi" };
    }

    await db.update(memberProgress).set({
      pointsBalance: progress[0].pointsBalance - price,
      updatedAt: new Date()
    }).where(eq(memberProgress.id, progress[0].id));

    const existingItem = await db.select().from(memberItems).where(
      and(
        eq(memberItems.memberId, memberId),
        eq(memberItems.itemId, item.id)
      )
    );

    if (existingItem.length > 0) {
      await db.update(memberItems).set({
        quantity: existingItem[0].quantity + 1,
        updatedAt: new Date()
      }).where(eq(memberItems.id, existingItem[0].id));
    } else {
      await db.insert(memberItems).values({
        memberId,
        itemId: item.id,
        quantity: 1
      });
    }

    return { success: true, updatedPoints: progress[0].pointsBalance - price };
  } catch (error) {
    console.error("Buy Shop Item DB Error:", error);
    return { success: false, error: "Failed to purchase item" };
  }
}