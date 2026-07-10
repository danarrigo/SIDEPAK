import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

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

      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                <th className="px-6 py-4 font-bold">NIK</th>
                <th className="px-6 py-4 font-bold">No. HP</th>
                <th className="px-6 py-4 font-bold">Desa</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{member.namaLengkap}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{member.nik}</td>
                  <td className="px-6 py-4">{member.nomorHp || '-'}</td>
                  <td className="px-6 py-4">{member.desa}</td>
                  <td className="px-6 py-4">
                    {member.statusAnggota === 'active' ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20">
                        Inaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-tertiary hover:bg-tertiary/10 p-2 rounded-xl transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {allMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Belum ada anggota yang terdaftar di koperasi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
