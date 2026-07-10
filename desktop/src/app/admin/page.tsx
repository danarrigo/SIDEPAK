import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { members, cooperatives, loans, savings, dues, users } from "@/db/schema";
import { eq, sql, and, ne } from "drizzle-orm";
import AdminCharts from "./AdminCharts";

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
  }).from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(
      and(
        eq(members.cooperativeId, coopId),
        ne(users.role, 'admin')
      )
    );

  // Fetch active loans
  const [loanStats] = await db.select({
    totalActiveLoans: sql<number>`sum(case when ${loans.status} = 'approved' then ${loans.amount} else 0 end)`
  })
  .from(loans)
  .innerJoin(members, eq(loans.memberId, members.id))
  .where(eq(members.cooperativeId, coopId));

  // Fetch savings
  const [savingStats] = await db.select({
    totalDeposits: sql<number>`sum(case when ${savings.type} = 'deposit' then ${savings.amount} else 0 end)`,
    totalWithdrawals: sql<number>`sum(case when ${savings.type} = 'withdrawal' then ${savings.amount} else 0 end)`
  })
  .from(savings)
  .innerJoin(members, eq(savings.memberId, members.id))
  .where(eq(members.cooperativeId, coopId));

  // Fetch dues
  const [dueStats] = await db.select({
    totalDues: sql<number>`sum(case when ${dues.status} = 'paid' then ${dues.amount} else 0 end)`
  })
  .from(dues)
  .innerJoin(members, eq(dues.memberId, members.id))
  .where(eq(members.cooperativeId, coopId));

  const loansByStatusRaw = await db.select({
    status: loans.status,
    count: sql<number>`count(${loans.id})`,
    totalAmount: sql<number>`sum(${loans.amount})`,
  })
  .from(loans)
  .innerJoin(members, eq(loans.memberId, members.id))
  .where(eq(members.cooperativeId, coopId))
  .groupBy(loans.status);

  // Convert raw status counts into an array of objects
  const loansByStatus = loansByStatusRaw.map(row => ({
    status: row.status,
    count: Number(row.count) || 0,
    totalAmount: Number(row.totalAmount) || 0,
  }));

  const activeLoans = Number(loanStats?.totalActiveLoans) || 0;
  const netSavings = (Number(savingStats?.totalDeposits) || 0) - (Number(savingStats?.totalWithdrawals) || 0);
  const totalDuesPaid = Number(dueStats?.totalDues) || 0;
  const totalAssets = netSavings + totalDuesPaid;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-black text-slate-900 mb-1">
            Dashboard Pengurus
          </h1>
          <p className="font-body-lg text-slate-500">
            Koperasi {adminData.koperasi}
          </p>
        </div>
        
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/20 text-tertiary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Selamat datang,</p>
            <p className="font-bold text-slate-900">{adminData.namaLengkap}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Members */}
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-tertiary/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-slate-900">{coopStats?.totalMembers || 0}</h3>
            <p className="text-slate-500 text-sm font-bold mt-1">Total Anggota</p>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-3xl font-black text-slate-900">{coopStats?.activeMembers || 0}</h3>
            <p className="text-slate-500 text-sm font-bold mt-1">Anggota Aktif (Lunas Simpanan Pokok)</p>
          </div>
        </div>

        {/* Total Loan Value */}
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-2xl md:text-3xl font-black text-slate-900">{formatRupiah(activeLoans)}</h3>
            <p className="text-slate-500 text-sm font-bold mt-1">Pinjaman Aktif</p>
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-2xl md:text-3xl font-black text-slate-900">{formatRupiah(totalAssets)}</h3>
            <p className="text-slate-500 text-sm font-bold mt-1">Total Aset Koperasi</p>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <AdminCharts
        loansByStatus={loansByStatus}
        totalAssets={totalAssets}
        totalLoans={activeLoans}
      />

      {/* Recent Activity / Actions */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 p-6">
        <h2 className="font-headline-sm text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">pending_actions</span>
          Menunggu Persetujuan
        </h2>
        
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-2xl">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task</span>
          <p>Belum ada pengajuan baru yang perlu diproses hari ini.</p>
        </div>
      </div>
    </div>
  );
}
