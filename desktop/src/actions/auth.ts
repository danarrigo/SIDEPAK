"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, members, cooperatives, memberProgress } from "@/db/schema";
import { and, ilike, eq } from "drizzle-orm";

export async function login(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: (formData.get("email") as string)?.trim() ?? "",
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: (formData.get("email") as string)?.trim() ?? "",
    password: formData.get("password") as string,
    nik: (formData.get("nik") as string)?.trim() ?? "",
    namaLengkap: (formData.get("namaLengkap") as string)?.trim() ?? "",
    provinsi: (formData.get("provinsi") as string)?.trim() ?? "",
    kabupaten: (formData.get("kabupaten") as string)?.trim() ?? "",
    kecamatan: (formData.get("kecamatan") as string)?.trim() ?? "",
    desa: (formData.get("desa") as string)?.trim() ?? "",
    koperasi: (formData.get("koperasi") as string)?.trim() ?? "",
  };

  // Check if the cooperative exists for the given desa/kelurahan
  let [coop] = await db.select().from(cooperatives).where(
    and(
      ilike(cooperatives.name, data.koperasi),
      ilike(cooperatives.desa, data.desa)
    )
  );

  // If it doesn't exist, create it automatically
  if (!coop) {
    try {
      const [newCoop] = await db.insert(cooperatives).values({
        name: data.koperasi,
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        kecamatan: data.kecamatan,
        desa: data.desa,
      }).returning();
      coop = newCoop;
    } catch (dbError) {
      console.error("Error creating cooperative:", dbError);
      return { error: "Gagal membuat koperasi baru." };
    }
  }

  // Pre-check if NIK is already registered to avoid orphaned Supabase accounts
  const existingMember = await db.select().from(members).where(eq(members.nik, data.nik));
  if (existingMember.length > 0) {
    return { error: "NIK sudah terdaftar di sistem. Silakan gunakan NIK lain atau login." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    try {
      // Insert into public users table
      await db.insert(users).values({
        id: authData.user.id,
        email: data.email,
        role: "member",
        isActive: true,
      });

      const [newMember] = await db.insert(members).values({
        userId: authData.user.id,
        nik: data.nik,
        statusAnggota: 'inactive', // Changed to inactive initially since they haven't paid yet
        namaLengkap: data.namaLengkap,
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        kecamatan: data.kecamatan,
        desa: data.desa,
        cooperativeId: coop.id,
      }).returning();

      // Initialize gamification & wallet progress
      await db.insert(memberProgress).values({
        memberId: newMember.id,
      });
    } catch (dbError) {
      console.error("Error inserting user/member into database:", dbError);
      // Fallback: If SQL insert fails for any unexpected reason, sign out to prevent a phantom session
      await supabase.auth.signOut();
      return { error: "Gagal membuat profil pengguna. Silakan coba lagi." };
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
