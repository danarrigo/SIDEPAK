"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, members, cooperatives } from "@/db/schema";
import { and, ilike } from "drizzle-orm";

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

  // Validate that the cooperative exists and belongs to the given desa/kelurahan
  const [coop] = await db.select().from(cooperatives).where(
    and(
      ilike(cooperatives.name, data.koperasi),
      ilike(cooperatives.desa, data.desa)
    )
  );

  if (!coop) {
    return { error: "Koperasi tidak ditemukan di Desa/Kelurahan tersebut." };
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

      // Insert into members table
      await db.insert(members).values({
        userId: authData.user.id,
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        kecamatan: data.kecamatan,
        desa: data.desa,
        koperasi: coop.name,
      });
    } catch (dbError) {
      console.error("Error inserting user/member into database:", dbError);
      return { error: "Failed to create user profile in database." };
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
