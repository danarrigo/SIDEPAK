import { getFinancialsData, getActiveLoan } from "@/actions/financials";
import { getCurrentMember } from "@/actions/members";
import { redirect } from "next/navigation";
import { getWinRate, getMemberInventory, getRecentPointTransactions, getMemberProgress, getMemberBadges, useItem as applyInventoryItem } from "@/actions/gamification";
import { logout } from "@/actions/auth";
import TopUpModal from "@/components/TopUpModal";
import Link from "next/link";
import ProfileSettings from "./ProfileSettings";
import React from "react";
import { revalidatePath } from "next/cache";
import { calculateMembershipScore, getRankFromScore } from "@/actions/rank";
export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const { savings, loans, walletTransactions, totalSavings } = await getFinancialsData(currentMember.id);
  const totalTransaksi = savings.length + loans.length + walletTransactions.length;
  const estimasiSHU = totalSavings > 0 ? Math.floor(totalSavings * 0.12) : 0;
  
  const { winRate, totalBattles } = await getWinRate(currentMember.id);

  const activeLoan = await getActiveLoan(currentMember.id);
  const inventory = await getMemberInventory(currentMember.id);
  const activityLog = await getRecentPointTransactions(currentMember.id);
  const progress = await getMemberProgress(currentMember.id);
  const badges = await getMemberBadges(currentMember.id);

  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  
  const membershipScoreValue = calculateMembershipScore(
    progress?.level ?? 1, 
    progress?.walletBalance ?? 0, 
    progress?.creditScore ?? 0
  );
  const actualRank = getRankFromScore(membershipScoreValue);

  let rankName = "BRONZE";
  let rankColor = "from-amber-700 to-amber-900";
  let badgeIcon = "eco";
  let mobileRankName = "Perunggu";
  let mobileColors = ["bg-[#B45309]", "from-[#B45309] to-[#78350F]"];
  
  if (actualRank === "Perak") { 
    rankName = "SILVER"; 
    rankColor = "from-slate-400 to-slate-600"; 
    badgeIcon = "military_tech"; 
    mobileRankName = "Perak";
    mobileColors = ["bg-[#94A3B8]", "from-[#94A3B8] to-[#475569]"];
  }
  else if (actualRank === "Emas") { 
    rankName = "GOLD"; 
    rankColor = "from-yellow-400 to-amber-600"; 
    badgeIcon = "crown"; 
    mobileRankName = "Emas";
    mobileColors = ["bg-[#FBBF24]", "from-[#FBBF24] to-[#B45309]"];
  }
  else if (actualRank === "Platinum") { 
    rankName = "PLATINUM"; 
    rankColor = "from-cyan-400 to-blue-600"; 
    badgeIcon = "diamond"; 
    mobileRankName = "Platinum";
    mobileColors = ["bg-[#22D3EE]", "from-[#22D3EE] to-[#2563EB]"];
  }
  else if (actualRank === "Legenda") { 
    rankName = "LEGEND"; 
    rankColor = "from-purple-500 to-fuchsia-700"; 
    badgeIcon = "auto_awesome"; 
    mobileRankName = "Legenda";
    mobileColors = ["bg-[#A855F7]", "from-[#A855F7] to-[#C026D3]"];
  }

  const initials = currentMember.namaLengkap
    ? currentMember.namaLengkap
        .trim()
        .split(" ")
        .map((e) => (e.length > 0 ? e[0] : ""))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AG";

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop View */}
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-10 space-y-12 pb-32">
        {/* Digital Member Card */}
        <section className="relative w-full max-w-xl mx-auto mb-10 group perspective animate-slide-up">
          <div className={`relative w-full h-[220px] rounded-2xl bg-gradient-to-br ${rankColor} p-8 text-white shadow-2xl overflow-hidden transition-transform duration-700 transform-gpu hover:scale-[1.02]`}>
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <span className="material-symbols-outlined text-[150px]" style={{ fontVariationSettings: "'FILL' 1" }}>{badgeIcon}</span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-headline-lg text-3xl font-black tracking-wide drop-shadow-md">{currentMember.namaLengkap}</h2>
                  <p className="font-label-caps text-white/80 mt-1 uppercase tracking-widest">{currentMember.koperasi as string}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 shadow-lg">
                  <span className="material-symbols-outlined text-3xl drop-shadow">{badgeIcon}</span>
                </div>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-white/80 mb-1 tracking-widest">STATUS ANGGOTA</p>
                <div className="flex items-end gap-3">
                  <span className="font-headline-md text-2xl font-bold drop-shadow-md">{rankName}</span>
                  <span className="font-points-display text-lg opacity-90 mb-0.5">{xp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </section>

        <section className="animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Dampak Personal</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-3xl p-6 border border-outline-variant transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">swap_horiz</span>
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Total Transaksi</p>
                <h4 className="font-headline-lg text-headline-lg text-on-surface">{totalTransaksi}</h4>
              </div>
              <p className="font-body-md text-body-md text-primary mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span> Aktif bertransaksi
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-outline-variant transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center mb-4 text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "\'FILL\' 1" }}>savings</span>
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Estimasi SHU</p>
                <h4 className="font-headline-lg text-headline-lg text-on-surface">Rp 0</h4>
              </div>
              <p className="font-body-md text-body-md text-tertiary mt-2">Belum ada pendapatan</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-outline-variant transition-all flex flex-col justify-between relative group hover:border-primary/50 overflow-hidden cursor-pointer">
              <Link href="/savings" className="absolute inset-0 z-0"></Link>
              <div className="relative z-0 pointer-events-none">
                <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Saldo Dompet</p>
                <h4 className="font-headline-lg text-headline-lg text-on-surface">Rp {progress?.walletBalance?.toLocaleString('id-ID') || 0}</h4>
              </div>
              <div className="mt-4 relative z-10">
                <TopUpModal memberId={currentMember.id} />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-outline-variant transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-error-container rounded-2xl flex items-center justify-center mb-4 text-error">
                  <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Win Rate</p>
                <h4 className="font-headline-lg text-headline-lg text-on-surface">{winRate.toFixed(1)}%</h4>
              </div>
              <p className="font-body-md text-body-md text-error mt-2">Dari {totalBattles} Kompetisi</p>
            </div>
          </div>
        </section>

        {/* 3-Column Layout below Dampak Personal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-slide-up delay-200">
          {/* Column 1: Loan & Activity */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Active Loan Tracker */}
            {activeLoan && (
              <section className="glass-card rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="font-headline-md text-headline-md">Status Pinjaman</h3>
                    <p className="font-body-sm text-on-surface-variant">Cicilan aktif bulan ini</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-label-caps text-[10px] font-bold uppercase">Aktif</span>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">TOTAL PINJAMAN</p>
                      <p className="font-headline-lg text-2xl text-on-surface">Rp {activeLoan.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-label-caps text-[10px] text-on-surface-variant mb-1">BUNGA</p>
                      <p className="font-headline-md text-error font-bold">{activeLoan.interestRate}%</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                    <p className="font-body-sm text-on-surface-variant">Jatuh tempo: <strong>{activeLoan.dueDate ? new Date(activeLoan.dueDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}</strong></p>
                    <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-[10px] font-bold hover:bg-primary/90 transition-colors tracking-widest">BAYAR</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[150px]">credit_card</span>
                </div>
              </section>
            )}

            {/* Recent Activity Log */}
            <section className="glass-card rounded-xl p-6 flex-1 flex flex-col">
              <h3 className="font-headline-md text-headline-md mb-6">Riwayat Aktivitas Poin</h3>
              {activityLog.length === 0 ? (
                <p className="text-on-surface-variant text-sm">Belum ada aktivitas.</p>
              ) : (
                <div className="space-y-4">
                  {activityLog.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.amount > 0 ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}>
                          <span className="material-symbols-outlined text-sm">{log.amount > 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                        </div>
                        <div>
                          <p className="font-body-sm font-bold text-on-surface capitalize">{log.description || log.source}</p>
                          <p className="text-[10px] text-on-surface-variant">{new Date(log.createdAt).toLocaleDateString('id-ID')} {new Date(log.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <span className={`font-points-display font-bold ${log.amount > 0 ? 'text-tertiary' : 'text-error'}`}>
                        {log.amount > 0 ? '+' : ''}{log.amount} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Column 2: Trophy Room */}
          <div className="lg:col-span-1">
            <section className="glass-card rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-headline-md">Inventory</h3>
                <span className="material-symbols-outlined text-tertiary">inventory_2</span>
              </div>
              {inventory.length === 0 ? (
                <div className="text-center py-10 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">category</span>
                  <p className="text-sm text-on-surface-variant">Inventory kosong.</p>
                  <p className="text-[10px] text-primary mt-1">Beli item di Marketplace!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventory.map(inv => (
                    <div key={inv.id} className="p-3 bg-surface-container-highest rounded-xl border border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
                          <span className="material-symbols-outlined text-xl">{inv.item.effectType === 'freeze_streak' ? 'ac_unit' : inv.item.effectType === 'prank' ? 'local_fire_department' : 'stars'}</span>
                        </div>
                        <div>
                          <p className="font-body-sm font-bold text-on-surface">{inv.item.name}</p>
                          <p className="text-[10px] text-on-surface-variant">Tersedia: {inv.quantity}</p>
                        </div>
                      </div>
                      <button className="bg-surface-container-high hover:bg-tertiary hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">PAKAI</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
        
        <div className="w-full space-y-6 mt-12 animate-slide-up delay-300">
          <h3 className="font-headline-md text-headline-md text-on-surface px-2">Pengaturan Akun</h3>
          <ProfileSettings currentPhone={currentMember.nomorHp} />
          
          <div className="mt-8 px-2 pb-8">
            <form action={logout}>
              <button type="submit" className="glass-card flex items-center gap-3 px-6 py-4 rounded-2xl border border-error/30 text-error hover:bg-error/10 hover:border-error/50 transition-colors w-full md:w-auto cursor-pointer">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-body-lg text-body-lg font-bold">Keluar dari Aplikasi</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-16">
        {/* Digital Member Card Top Header */}
        <div className={`bg-gradient-to-br ${mobileColors[1]} pt-12 px-6 pb-6 text-white flex flex-col gap-4 shadow-sm`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white text-2xl font-black tracking-wide leading-tight">{currentMember.namaLengkap}</h1>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-lg px-2.5 py-1">
                <span className="material-symbols-outlined text-xs">{badgeIcon}</span>
                <span className="text-[10px] font-bold tracking-wider">RANK {mobileRankName.toUpperCase()}</span>
              </div>
              <p className="text-white/70 text-[9px] font-bold mt-3">
                No. Anggota: KMP-DSKMJ-2026-{currentMember.id.toString().padStart(4, '0')}
              </p>
              {currentMember.user?.email && (
                <p className="text-white/60 text-[9px] mt-0.5">{currentMember.user.email}</p>
              )}
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0">
              {initials}
            </div>
          </div>

          {/* Streak & XP Badges Row */}
          <div className="flex justify-center gap-2 mt-1">
            <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-orange-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-white text-[10px] font-bold">{progress?.currentStreak || 1} Hari Streak</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#FACC15] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-white text-[10px] font-bold">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 space-y-5">
          {/* Wallet Balance Card */}
          <div className="bg-[#1E293B] rounded-[24px] p-5 text-white shadow flex flex-col gap-4">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-[9px] font-bold uppercase tracking-wider">SALDO DOMPET DIGITAL</span>
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            </div>
            <h2 className="text-2xl font-black text-white">Rp {progress?.walletBalance?.toLocaleString('id-ID') || 0}</h2>
            <div className="flex justify-center">
              <TopUpModal memberId={currentMember.id} />
            </div>
          </div>

          {/* Ranking Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Ranking</h3>
            <div className="bg-[#1C2533] rounded-[20px] p-5 text-white shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { name: 'Perunggu', icon: 'eco', color: 'text-emerald-400', active: rankName === 'BRONZE' },
                  { name: 'Perak', icon: 'military_tech', color: 'text-slate-300', active: rankName === 'SILVER' },
                  { name: 'Emas', icon: 'workspace_premium', color: 'text-amber-400', active: rankName === 'GOLD' },
                  { name: 'Platinum', icon: 'diamond', color: 'text-cyan-400', active: rankName === 'PLATINUM' },
                  { name: 'Legenda', icon: 'grade', color: 'text-purple-400', active: rankName === 'LEGEND' }
                ].map((r, i) => (
                  <React.Fragment key={r.name}>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                        r.active ? `${r.color} border-white bg-white/10` : 'border-white/10 bg-white/5 text-white/40'
                      }`}>
                        <span className="material-symbols-outlined text-lg">{r.icon}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${r.active ? 'text-white' : 'text-white/40'}`}>{r.name}</span>
                    </div>
                    {i < 4 && <div className="h-0.5 w-6 bg-white/10 shrink-0"></div>}
                  </React.Fragment>
                ))}
              </div>
              <hr className="border-white/10" />
              <p className="text-center text-white/60 text-[9px] leading-relaxed">
                Tingkatkan Ranking untuk limit pinjaman lebih tinggi + hadiah eksklusif!
              </p>
            </div>
          </div>

          {/* Active Loan Tracker */}
          {activeLoan && (
            <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Status Pinjaman</h3>
                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded">Aktif</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 block uppercase">TOTAL PINJAMAN</span>
                  <span className="text-base font-black text-slate-800">Rp {activeLoan.amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-slate-400 block uppercase">BUNGA</span>
                  <span className="text-sm font-black text-rose-600">{activeLoan.interestRate}%</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] text-slate-400">Jatuh tempo: <strong className="text-slate-600">{activeLoan.dueDate ? new Date(activeLoan.dueDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}</strong></p>
                <button className="bg-[#0F172A] text-white px-3.5 py-1.5 rounded-lg text-[9px] font-bold hover:bg-slate-800">BAYAR</button>
              </div>
            </div>
          )}

          {/* Dampak Personal */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Dampak Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-20">
                <span className="text-[9px] font-bold text-slate-400">Total Simpanan</span>
                <h4 className="text-sm font-black text-slate-800">Rp {(totalSavings / 1000000).toFixed(1)}Jt</h4>
              </div>
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-20">
                <span className="text-[9px] font-bold text-slate-400">Misi Diselesaikan</span>
                <h4 className="text-sm font-black text-slate-800">{activityLog.length || 0}</h4>
              </div>
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-20">
                <span className="text-[9px] font-bold text-slate-400">Level Kamu</span>
                <h4 className="text-sm font-black text-slate-800">Level {level}</h4>
              </div>
              <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-20">
                <span className="text-[9px] font-bold text-slate-400">Tingkat Kemenangan</span>
                <h4 className="text-sm font-black text-slate-800">{winRate.toFixed(1)}%</h4>
              </div>
            </div>
          </div>

          {/* Estimasi SHU */}
          <div className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimasi SHU</span>
              <span className="text-[8px] text-slate-400">Belum ada pendapatan</span>
            </div>
            <span className="text-sm font-black text-slate-800">Rp 0</span>
          </div>

          {/* Riwayat Aktivitas Poin */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Riwayat Aktivitas Poin</h3>
            <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
              {activityLog.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">Belum ada aktivitas poin tercatat.</p>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((log, index) => (
                    <div key={log.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${log.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            <span className="material-symbols-outlined text-xs">{log.amount > 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 capitalize">{log.description || log.source}</p>
                            <p className="text-[8px] text-slate-400 mt-0.5">{log.source} • {new Date(log.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${log.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.amount > 0 ? '+' : ''}{log.amount} XP
                        </span>
                      </div>
                      {index < activityLog.length - 1 && <hr className="border-slate-50 mt-3" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mutasi & Ledger Keuangan */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Mutasi & Ledger Keuangan</h3>
            <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
              {savings.length === 0 && loans.length === 0 && walletTransactions.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">Belum ada transaksi tercatat.</p>
              ) : (
                <div className="space-y-4">
                  {savings.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Simpanan & Penarikan</span>
                      {savings.map((s: any, idx: number) => {
                        const isDeposit = s.type === 'deposit';
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{s.description || 'Transaksi Simpanan'}</p>
                              <p className="text-[8px] text-slate-400">{new Date(s.transactionDate).toLocaleDateString('id-ID')}</p>
                            </div>
                            <span className={`font-bold ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isDeposit ? '+' : '-'} Rp {s.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(savings.length > 0 && loans.length > 0) && <hr className="border-slate-50" />}

                  {loans.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Pinjaman</span>
                      {loans.map((l: any, idx: number) => {
                        const status = l.status || 'pending';
                        const statusColor = status === 'approved' ? 'text-blue-500 bg-blue-50' : status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-500 bg-amber-50';
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">Pinjaman Dana</p>
                              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${statusColor}`}>{status}</span>
                            </div>
                            <span className="font-bold text-slate-800">Rp {l.amount.toLocaleString('id-ID')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {((savings.length > 0 || loans.length > 0) && walletTransactions.length > 0) && <hr className="border-slate-50" />}

                  {walletTransactions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Top Up & Transaksi Dompet</span>
                      {walletTransactions.map((w: any, idx: number) => {
                        const status = w.status || 'pending';
                        const statusColor = status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-500 bg-amber-50';
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">Top Up Saldo Dompet</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] text-slate-400">{new Date(w.createdAt).toLocaleDateString('id-ID')}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${statusColor}`}>{status}</span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">Rp {w.amount.toLocaleString('id-ID')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inventori (DB-backed via inventory) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Inventori</h3>
            <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
              {inventory.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">inventory_2</span>
                  <p className="text-slate-400 text-xs font-bold">Inventori kosong.</p>
                  <Link href="/marketplace" className="text-[#FACC15] text-[10px] font-bold">Beli item di Toko Misi!</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventory.map((inv) => {
                    const iconColorMap: any = {
                      'freeze_streak': 'bg-cyan-50 text-cyan-600',
                      'prank': 'bg-rose-50 text-rose-600',
                      'points': 'bg-amber-50 text-amber-600'
                    };
                    const iconMap: any = {
                      'freeze_streak': 'ac_unit',
                      'prank': 'local_fire_department',
                      'points': 'stars'
                    };
                    return (
                      <div key={inv.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColorMap[inv.item.effectType] || 'bg-slate-150 text-slate-600'}`}>
                            <span className="material-symbols-outlined text-lg">{iconMap[inv.item.effectType] || 'stars'}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{inv.item.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Tersedia: {inv.quantity}</p>
                          </div>
                        </div>
                        <form action={async () => {
                          "use server";
                          await applyInventoryItem(currentMember.id, inv.item.id);
                          revalidatePath("/profile");
                        }}>
                          <button type="submit" className="bg-[#FACC15] text-[#0F172A] text-[9px] font-black px-4 py-2 rounded-lg transition-all active:scale-95">PAKAI</button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Achievements (DB-backed via badges) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Penghargaan</h3>
            <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
              {badges.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">Belum ada penghargaan</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 min-w-[120px] shrink-0 text-center">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-200">
                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{badge.name}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pengaturan */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Pengaturan</h3>
            <div className="bg-[#718096] rounded-[20px] overflow-hidden text-white shadow-sm flex flex-col">
              {[
                'Profil & Nomor Handphone',
                'Keamanan & Password',
                'Notifikasi',
                'Metode Pembayaran',
                'Pusat Bantuan'
              ].map((item) => (
                <div key={item} className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-all border-b border-white/10 last:border-0">
                  <span className="text-xs font-bold">{item}</span>
                  <span className="material-symbols-outlined text-white/50 text-sm">chevron_right</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <form action={logout} className="pt-2">
            <button type="submit" className="flex items-center justify-center gap-2 py-3 bg-[#0F172A] text-white hover:bg-slate-800 rounded-xl transition-all w-full font-bold text-xs cursor-pointer">
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Keluar dari Aplikasi</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}