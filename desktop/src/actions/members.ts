"use server";
import { db } from "@/db";
import { members, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getMemberData(memberId: number) {
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

import { createClient } from "@/utils/supabase/server";

export async function getCurrentMember() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [member] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!member) return null;

    let cooperativeName = null;
    if (member.cooperativeId) {
      // Import cooperatives if not already imported at top
      const { cooperatives } = await import("@/db/schema/cooperatives");
      const [coop] = await db.select().from(cooperatives).where(eq(cooperatives.id, member.cooperativeId));
      cooperativeName = coop?.name || null;
    }
    
    return {
      ...member,
      koperasi: cooperativeName
    };
  } catch (error) {
    console.error("GetCurrentMember Error:", error);
    return null;
  }
}
export async function getActiveMembers(cooperativeId: number) {
  try {
    return await db.select().from(members).where(
      and(
        eq(members.cooperativeId, cooperativeId),
        eq(members.statusAnggota, 'active')
      )
    );
  } catch (error) {
    console.error("GetActiveMembers Error:", error);
    return [];
  }
}
