import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import MembersTableClient from "./MembersTableClient";

export const metadata = {
  title: "Daftar Anggota | Admin Dashboard",
};

export default async function AdminMembersPage() {
  const adminData = await getCurrentMember();
  
  if (!adminData || !adminData.cooperativeId) {
    return <div>Error loading admin data</div>;
  }

  // Fetch all members in this cooperative
  const allMembers = await db.select().from(members).where(eq(members.cooperativeId, adminData.cooperativeId));

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in text-slate-900">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg font-black text-slate-900 mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">groups</span>
          Daftar Anggota Koperasi
        </h1>
        <p className="font-body-lg text-slate-500">
          Kelola data dan status anggota koperasi Anda
        </p>
      </div>

      <MembersTableClient initialMembers={allMembers} />
    </div>
  );
}
