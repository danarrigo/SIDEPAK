"use server";
import { db } from "@/db";
import { events, eventParticipants } from "@/db/schema/activities";
import { eq, and } from "drizzle-orm";
import { memberProgress } from "@/db/schema/gamification";

export async function joinEvent(memberId: number, eventId: number) {
  try {
    // Check if the event exists
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return { success: false, error: "Event tidak ditemukan." };

    // Check if the user is already registered
    const existingParticipation = await db.select().from(eventParticipants).where(
      and(
        eq(eventParticipants.memberId, memberId),
        eq(eventParticipants.eventId, eventId)
      )
    );

    if (existingParticipation.length > 0) {
      return { success: false, error: "Anda sudah terdaftar di event ini." };
    }

    // Insert into event_participants
    await db.insert(eventParticipants).values({
      memberId,
      eventId,
      status: 'registered'
    });

    return { success: true, message: "Berhasil mendaftar ke event!" };
  } catch (error) {
    console.error("Join Event DB Error:", error);
    return { success: false, error: "Gagal mendaftar ke event." };
  }
}

export async function getEventsByCooperative(cooperativeId: number) {
  try {
    const coopEvents = await db.select().from(events).where(eq(events.cooperativeId, cooperativeId));
    return { success: true, events: coopEvents };
  } catch (error) {
    console.error("Get Events DB Error:", error);
    return { success: false, error: "Gagal mengambil data event." };
  }
}

export async function getMemberEventParticipations(memberId: number) {
  try {
    const participations = await db.select({
      id: eventParticipants.id,
      status: eventParticipants.status,
      joinedAt: eventParticipants.joinedAt,
      event: {
        id: events.id,
        name: events.name,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
      }
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(eq(eventParticipants.memberId, memberId));

    return { success: true, participations };
  } catch (error) {
    console.error("Get Member Events DB Error:", error);
    return { success: false, error: "Gagal mengambil data partisipasi event." };
  }
}

export async function createEvent(memberId: number, name: string, description: string, startDate: Date, endDate: Date) {
  try {
    const progress = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (progress.length === 0 || progress[0].level < 20) {
      return { success: false, error: "Level tidak mencukupi untuk membuat event. Dibutuhkan minimal Level 20." };
    }

    const { members } = await import("@/db/schema/members");
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member || !member.cooperativeId) {
      return { success: false, error: "Anggota tidak terdaftar pada koperasi mana pun." };
    }

    await db.insert(events).values({
      cooperativeId: member.cooperativeId,
      creatorId: memberId,
      name,
      description,
      startDate,
      endDate
    });

    return { success: true, message: "Berhasil membuat event koperasi!" };
  } catch (error) {
    console.error("Create Event DB Error:", error);
    return { success: false, error: "Gagal membuat event." };
  }
}
