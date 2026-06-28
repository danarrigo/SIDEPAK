"use server";
import { db } from "@/db";
import { items, memberItems, memberProgress, marketplaceItems, marketplaceTransactions } from "@/db/schema/gamification";
import { members } from "@/db/schema/members";
import { eq, and, desc } from "drizzle-orm";

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

export async function getInAppItems() {
  try {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  } catch (error) {
    console.error("Get InApp Items DB Error:", error);
    return [];
  }
}

export async function getMarketplaceItems() {
  try {
    const mkItems = await db.select().from(marketplaceItems).orderBy(desc(marketplaceItems.createdAt));
    
    // Fetch sellers info
    const itemsWithSellers = await Promise.all(mkItems.map(async (item) => {
      const [seller] = await db.select().from(members).where(eq(members.id, item.sellerId));
      return { ...item, seller };
    }));
    
    return itemsWithSellers;
  } catch (error) {
    console.error("Get Marketplace Items DB Error:", error);
    return [];
  }
}

export async function listMarketplaceItem(data: { sellerId: number, name: string, description: string, priceInPoints: number, stock: number, imageUrl?: string }) {
  try {
    const [newItem] = await db.insert(marketplaceItems).values({
      sellerId: data.sellerId,
      name: data.name,
      description: data.description,
      priceInPoints: data.priceInPoints,
      stock: data.stock,
      imageUrl: data.imageUrl || null
    }).returning();
    
    return { success: true, item: newItem };
  } catch (error) {
    console.error("List Marketplace Item DB Error:", error);
    return { success: false, error: "Gagal mendaftarkan barang" };
  }
}

export async function buyMarketplaceItem(buyerId: number, itemId: number) {
  try {
    const [item] = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, itemId));
    if (!item) return { success: false, error: "Item tidak ditemukan." };
    if (item.stock <= 0) return { success: false, error: "Stok habis." };
    if (item.sellerId === buyerId) return { success: false, error: "Tidak bisa membeli barang sendiri." };

    const price = item.priceInPoints;

    const [buyerProgress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, buyerId));
    if (!buyerProgress || buyerProgress.pointsBalance < price) {
      return { success: false, error: "Poin tidak mencukupi" };
    }

    const [sellerProgress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, item.sellerId));
    if (!sellerProgress) return { success: false, error: "Seller tidak ditemukan" };

    // Update buyer points
    await db.update(memberProgress).set({
      pointsBalance: buyerProgress.pointsBalance - price,
      updatedAt: new Date()
    }).where(eq(memberProgress.id, buyerProgress.id));

    // Update seller points
    await db.update(memberProgress).set({
      pointsBalance: sellerProgress.pointsBalance + price,
      updatedAt: new Date()
    }).where(eq(memberProgress.id, sellerProgress.id));

    // Reduce stock
    await db.update(marketplaceItems).set({
      stock: item.stock - 1,
      updatedAt: new Date()
    }).where(eq(marketplaceItems.id, item.id));

    // Record transaction
    await db.insert(marketplaceTransactions).values({
      buyerId,
      sellerId: item.sellerId,
      marketplaceItemId: item.id,
      quantity: 1,
      totalPrice: price
    });

    return { success: true, updatedPoints: buyerProgress.pointsBalance - price };
  } catch (error) {
    console.error("Buy Marketplace Item DB Error:", error);
    return { success: false, error: "Gagal membeli barang" };
  }
}