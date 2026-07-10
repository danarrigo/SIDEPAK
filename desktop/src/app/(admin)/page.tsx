import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { members, cooperatives } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  const adminData = await getCurrentMember();
  
  if (!adminData || !adminData.cooperativeId) {
    return <div>Error loading admin data</div>;
  }

  // Fetch some aggregate data for the cooperative
  const coopId = adminData.cooperativeId;
  
  const [coopStats] = await db.select({
    totalMembers: sql<number>`count(${members.id})`,
    activeMembers: sql<number>`sum(case when ${members.statusAnggota} = 'active' then 1 else 0 end)`,
  }).from(members).where(eq(members.cooperativeId, coopId));

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in text-on-surface">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-black text-rose-500 mb-1">
            Dashboard Pengurus
          </h1>
          <p className="font-body-lg text-on-surface-variant">
            Koperasi {adminData.koperasi}
          </p>
        </div>
        
        <div className="bg-surface-container-highest border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface-variant">Selamat datang,</p>
            <p className="font-bold text-on-surface">{adminData.namaLengkap}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Members */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-white">{coopStats?.totalMembers || 0}</h3>
            <p className="text-on-surface-variant text-sm font-bold mt-1">Total Anggota</p>
          </div>
        </div>

        {/* Active Members */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-white">{coopStats?.activeMembers || 0}</h3>
            <p className="text-on-surface-variant text-sm font-bold mt-1">Anggota Aktif (Lunas Simpanan Pokok)</p>
          </div>
        </div>

        {/* Total Loan Value (Mocked for now) */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-white">Rp 25.4Jt</h3>
            <p className="text-on-surface-variant text-sm font-bold mt-1">Pinjaman Aktif</p>
          </div>
        </div>

        {/* Total Assets (Mocked for now) */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-white">Rp 120.5Jt</h3>
            <p className="text-on-surface-variant text-sm font-bold mt-1">Total Aset Koperasi</p>
          </div>
        </div>

      </div>

      {/* Recent Activity / Actions */}
      <div className="glass-card rounded-3xl border border-white/10 p-6">
        <h2 className="font-headline-sm text-xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500">pending_actions</span>
          Menunggu Persetujuan
        </h2>
        
        <div className="text-center py-12 text-on-surface-variant border border-dashed border-white/10 rounded-2xl">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task</span>
          <p>Belum ada pengajuan baru yang perlu diproses hari ini.</p>
        </div>
      </div>
    </div>
  );
}
