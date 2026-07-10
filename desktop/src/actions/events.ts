"use server";
import { db } from "@/db";
import { events, eventParticipants } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { memberProgress } from "@/db/schema/gamification";
import { eq, and } from "drizzle-orm";

export async function joinEvent(memberId: number, eventId: number) {
  try {
    const existing = await db.select().from(eventParticipants).where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.memberId, memberId)));
    if (existing.length > 0) return { success: false, error: "Sudah terdaftar di event ini." };
    
    await db.insert(eventParticipants).values({
      eventId,
      memberId,
      status: 'registered'
    });
    return { success: true };
  } catch (err) {
    console.error("Join Event Error:", err);
    return { success: false, error: "Gagal mendaftar event." };
  }
}

export async function submitEvent(memberId: number, name: string, description: string, startDate: Date, endDate: Date) {
  try {
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member || !member.cooperativeId) {
      return { success: false, error: "Anggota tidak terikat ke koperasi." };
    }

    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress || progress.level < 20) {
      return { success: false, error: "Level tidak mencukupi. Anda harus minimal Level 20 untuk mengajukan event." };
    }

    const [event] = await db.insert(events).values({
      name,
      description,
      startDate,
      endDate,
      status: 'pending_approval',
      creatorId: memberId,
      cooperativeId: member.cooperativeId,
    }).returning();

    const { createNotification } = await import("./notifications");
    await createNotification(
      memberId,
      "Event Berhasil Diajukan",
      `Event "${name}" telah diajukan dan sedang menunggu persetujuan admin.`
    );

    return { success: true, event };
  } catch (error) {
    console.error("Submit Event Error:", error);
    return { success: false, error: "Gagal membuat event." };
  }
}

export async function getPendingEvents(cooperativeId: number) {
  try {
    return await db.select().from(events).where(and(eq(events.status, 'pending_approval'), eq(events.cooperativeId, cooperativeId)));
  } catch (error) {
    console.error("Get Pending Events Error:", error);
    return [];
  }
}

export async function approveEvent(eventId: number) {
  try {
    await db.update(events).set({ status: 'active' }).where(eq(events.id, eventId));
    return { success: true };
  } catch (error) {
    console.error("Approve Event Error:", error);
    return { success: false, error: "Failed to approve event" };
  }
}

export async function rejectEvent(eventId: number) {
  try {
    await db.delete(events).where(eq(events.id, eventId));
    return { success: true };
  } catch (error) {
    console.error("Reject Event Error:", error);
    return { success: false, error: "Failed to reject event" };
  }
}

export async function createEventByAdmin(cooperativeId: number, name: string, description: string, startDate: Date, endDate: Date) {
  try {
    await db.insert(events).values({
      name,
      description,
      startDate,
      endDate,
      status: 'active',
      cooperativeId,
    });
    return { success: true };
  } catch (error) {
    console.error("Admin Create Event Error:", error);
    return { success: false, error: "Gagal membuat event." };
  }
}

export async function editEvent(eventId: number, name: string, description: string, startDate: Date, endDate: Date) {
  try {
    await db.update(events).set({ name, description, startDate, endDate }).where(eq(events.id, eventId));
    return { success: true };
  } catch (error) {
    console.error("Edit Event Error:", error);
    return { success: false, error: "Gagal mengedit event." };
  }
}
