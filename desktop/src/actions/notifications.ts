"use server";
import { db } from "@/db";
import { notifications } from "@/db/schema/notifications";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMemberNotifications(memberId: number) {
  try {
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.memberId, memberId))
      .orderBy(desc(notifications.createdAt));
    return notifs;
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return [];
  }
}

export async function deleteNotification(notificationId: number) {
  try {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function createTestNotification(memberId: number) {
  try {
    await db.insert(notifications).values({
      memberId,
      title: "Notifikasi Uji Coba",
      message: "Ini adalah pesan notifikasi yang dikirim dari tombol tes. Silakan klik untuk menghapusnya.",
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create Test Notification Error:", error);
    return { success: false, error: "Failed to create test notification" };
  }
}
