"use server";
import { db } from "@/db";
import { members, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMemberData(memberId: number = 1) {
  try {
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member) return null;
    const [user] = await db.select().from(users).where(eq(users.id, member.userId));
    return { ...member, user };
  } catch (error) {
    console.error("Members DB Error:", error);
    return null;
  }
}
