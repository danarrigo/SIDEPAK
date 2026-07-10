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
import { cache } from "react";

export const getCurrentMember = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));

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
      koperasi: cooperativeName,
      user: {
        email: user.email,
        role: userRecord?.role || 'member'
      }
    };
  } catch (error) {
    console.error("GetCurrentMember Error:", error);
    return null;
  }
});
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

export async function updateCurrentMemberPhone(newPhone: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [member] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!member) return { success: false, error: "Member not found" };

    await db.update(members).set({ nomorHp: newPhone }).where(eq(members.id, member.id));
    
    return { success: true };
  } catch (error) {
    console.error("Update Phone Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateMemberAdmin(memberId: number, data: Partial<typeof members.$inferInsert>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify current user is admin
    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));
    if (userRecord?.role !== 'admin') {
      return { success: false, error: "Unauthorized: Admin only" };
    }

    // Verify target member belongs to the admin's cooperative
    const [adminMember] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!adminMember || !adminMember.cooperativeId) {
      return { success: false, error: "Admin has no cooperative assigned" };
    }

    const [targetMember] = await db.select().from(members).where(eq(members.id, memberId));
    if (!targetMember || targetMember.cooperativeId !== adminMember.cooperativeId) {
      return { success: false, error: "Member not found or not in your cooperative" };
    }

    // Update
    await db.update(members).set({ 
      namaLengkap: data.namaLengkap,
      nomorHp: data.nomorHp,
      statusAnggota: data.statusAnggota,
    }).where(eq(members.id, memberId));

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/members");

    return { success: true };
  } catch (error) {
    console.error("Update Member Admin Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateCurrentAdminProfile(data: { namaLengkap?: string, nik?: string, nomorHp?: string, password?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));
    if (userRecord?.role !== 'admin') {
      return { success: false, error: "Unauthorized: Admin only" };
    }

    const [member] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!member) return { success: false, error: "Member not found" };

    // Update password if provided
    if (data.password && data.password.trim() !== '') {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password
      });
      if (passwordError) {
        return { success: false, error: "Gagal mengubah kata sandi: " + passwordError.message };
      }
    }

    await db.update(members).set({
      namaLengkap: data.namaLengkap !== undefined ? data.namaLengkap : member.namaLengkap,
      nik: data.nik !== undefined ? data.nik : member.nik,
      nomorHp: data.nomorHp !== undefined ? data.nomorHp : member.nomorHp,
    }).where(eq(members.id, member.id));

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/profile");

    return { success: true };
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
