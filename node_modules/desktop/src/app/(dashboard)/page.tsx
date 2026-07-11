import React from "react";
import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentMember } from "@/actions/members";
import { getFinancialsData } from "@/actions/financials";
import { getActiveQuests } from "@/actions/quests";
import { getKoperasiStats } from "@/actions/governance";

import { redirect } from "next/navigation";
import MissionList from "@/components/MissionList";
import Leaderboard from "@/components/Leaderboard";

import { calculateMembershipScore, getRankFromScore, getNextRankRequirement, getRankBenefits } from "@/actions/rank";
import { createClient } from "@/utils/supabase/server";
import StreakIndicator from "@/components/StreakIndicator";
import NotificationButton from "@/components/NotificationButton";

export default async function DesktopDashboard() {
  const currentMember = await getCurrentMember();
  if (!currentMember) {
    // If Supabase has a session but the user is not in the database (e.g. after a DB reset),
    // redirecting to /login causes an infinite loop because middleware redirects back to /.
    // So we show a clear session button here.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Sesi Tidak Valid</h2>
          <p className="text-slate-500 mb-6">Data akun Anda tidak ditemukan, namun sesi login masih tersimpan di browser Anda. Silakan hapus sesi dan login ulang.</p>
          <form action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}>
            <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Hapus Sesi & Login Ulang
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [dbData, financials, activeQuests, koperasiStats] = await Promise.all([
    getDashboardData(currentMember.id),
    getFinancialsData(currentMember.id),
    getActiveQuests(currentMember.id),
    getKoperasiStats(currentMember.cooperativeId as number)
  ]);
  

  const points = dbData?.progress?.pointsBalance || 0;
  const streak = Math.max(1, dbData?.progress?.currentStreak ?? 1);
  const level = dbData?.progress?.level || 1;
  const creditScore = dbData?.progress?.creditScore || 700;
  const walletBalance = dbData?.progress?.walletBalance || 0;
  const memberName = currentMember?.namaLengkap ? currentMember.namaLengkap.split(' ')[0] : "Anggota";

  const membershipScore = calculateMembershipScore(level, walletBalance, creditScore);
  const rankName = getRankFromScore(membershipScore);
  const { nextRankName, pointsNeeded } = getNextRankRequirement(membershipScore);
  const benefits = getRankBenefits(rankName);
  const currentRankThreshold = rankName === "Perunggu" ? 0 : rankName === "Perak" ? 2500 : rankName === "Emas" ? 5000 : rankName === "Platinum" ? 10000 : 25000;
  const nextRankThreshold = currentRankThreshold + pointsNeeded;
  const progressPercent = nextRankName === "Legenda" && pointsNeeded === 0 ? 100 : Math.min(100, ((membershipScore - currentRankThreshold) / (nextRankThreshold - currentRankThreshold)) * 100);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop View */}
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        {/* Row 1: Greeting & Title Banner */}
        <div className="glass-card animate-slide-up border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Selamat Datang kembali, {memberName}!</h2>
            <p className="text-on-surface-variant text-sm mt-1">Status Keanggotaan Anda sangat baik. Mari capai {nextRankName} bulan ini!</p>
          </div>
          <StreakIndicator streak={streak} />
        </div>

        {/* Row 2: Grid for Savings and Points */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-100">
          {/* Savings Summary Card */}
          <div className="glass-card border border-outline-variant rounded-2xl overflow-hidden flex flex-col justify-between col-span-1 lg:col-span-2">
            <div className="bg-surface-container-highest px-6 py-4 flex justify-between items-center border-b border-outline-variant/30">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-on-surface">TOTAL SIMPANAN KOPERASI</h3>
              <span className="material-symbols-outlined text-primary text-sm">savings</span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
              <div>
                <span className="text-on-surface-variant text-xs font-semibold">Saldo Terkonsolidasi</span>
                <h2 className="text-3xl font-black text-on-surface mt-1">Rp {financials.totalSavings.toLocaleString('id-ID')}</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/30 pt-6">
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Pokok</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp {financials.simpananPokok.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Wajib</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp {financials.simpananWajib.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Sukarela</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp {financials.simpananSukarela.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div>
                <Link href="/savings" className="inline-flex items-center gap-2 border border-outline hover:border-primary px-4 py-2 rounded-xl text-primary text-xs font-bold transition-colors">
                  <span>Kelola Simpanan & Mutasi</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Saldo Poin Progress Card */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between relative group cursor-pointer transition-all hover:border-tertiary/50 hover:z-[100]">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none rounded-2xl"></div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-8 w-48 p-3 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left pointer-events-none">
              <p className="text-xs font-bold mb-1 text-on-surface">Benefit {rankName}:</p>
              <ul className="text-[10px] space-y-1 text-on-surface-variant list-disc pl-3">
                <li>Bobot SHU: {benefits.shuMultiplier}x</li>
                <li>Biaya Layanan: {benefits.serviceFee}%</li>
                <li>Prioritas layanan koperasi</li>
              </ul>
            </div>

            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-tertiary">SALDO POIN</h3>
              <span className="bg-tertiary/10 text-tertiary text-[10px] font-extrabold px-3 py-1 rounded-full border border-tertiary/20">{rankName}</span>
            </div>

            <div className="flex items-center gap-4 my-2 relative z-10">
              <div className="text-tertiary">
                <span className="material-symbols-outlined text-5xl">stars</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-tertiary">{membershipScore.toLocaleString()}</span>
                  <span className="text-sm font-bold text-tertiary">Skor</span>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant">Tingkat Anggota {rankName}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-outline-variant/30 pt-6 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                <span>{pointsNeeded > 0 ? `${pointsNeeded.toLocaleString()} Skor lagi ke ${nextRankName}` : `${rankName} Tercapai!`}</span>
                <span>{membershipScore.toLocaleString()} / {nextRankThreshold.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-tertiary" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Missions, Stats Preview, and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Missions Preview */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-on-surface">Misi Hari Ini</h3>
                <span className="text-[10px] text-tertiary font-bold">{activeQuests.filter((m: any) => m.frequency === 'daily' && !m.isCompleted).length} tersisa</span>
              </div>
              <MissionList initialQuests={activeQuests} memberId={currentMember.id} />
            </div>
            <div className="pt-4 border-t border-outline-variant/30 mt-6">
              <Link href='/quests' className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                <span>Kelola Semua Misi</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="col-span-1">
            <Leaderboard />
          </div>

          {/* Cooperative Today Stats Summary */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-on-surface mb-6">Koperasi Hari Ini</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">swap_horiz</span>
                  <p className="text-xl font-black text-on-surface mt-1">{koperasiStats.transaksi}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Transaksi</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">groups</span>
                  <p className="text-xl font-black text-on-surface mt-1">{koperasiStats.anggotaBaru}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Anggota Baru</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">payments</span>
                  <p className="text-xl font-black text-on-surface mt-1">{(koperasiStats.omzetHarian / 1000000).toFixed(1)}Jt</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Omzet Harian</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">storefront</span>
                  <p className="text-xl font-black text-on-surface mt-1">{koperasiStats.umkmAktif}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">UMKM Aktif</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
                  <p className="text-xl font-black text-on-surface mt-1">{(koperasiStats.asetKas / 1000000).toFixed(1)}Jt</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Total Kas</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">credit_score</span>
                  <p className="text-xl font-black text-on-surface mt-1">{(koperasiStats.asetPinjaman / 1000000).toFixed(1)}Jt</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Pinjaman Aktif</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/30 mt-6">
              <Link href='/governance' className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                <span>Statistik & Governance</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>


      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-16">
        {/* Top Header Section */}
        <div className="bg-[#0F172A] rounded-b-[32px] pt-12 px-6 pb-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <p className="text-white/70 text-sm font-medium">Halo, {memberName}!</p>
              <h1 className={`text-2xl font-black mt-0.5 ${currentMember.statusAnggota === 'active' ? 'text-white' : 'text-rose-500'}`}>
                {currentMember.statusAnggota === 'active' ? 'Anggota Aktif' : 'Anggota Nonaktif'}
              </h1>
              <p className="text-white/60 text-[11px] mt-1">{currentMember.koperasi || 'Koperasi Merah Putih Desa Sukamaju'}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification icon */}
              <NotificationButton />
              {/* Profile icon */}
              <Link href="/profile" className="bg-white/10 hover:bg-white/20 transition-colors p-2.5 rounded-full cursor-pointer">
                <span className="material-symbols-outlined text-white text-[22px]">person</span>
              </Link>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="text-xs">🔥</span>
              <span className="text-white text-[10px] font-bold">{streak} hari Streak</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-5 py-4 space-y-4">
          {/* Warning Card if Non-active */}
          {currentMember.statusAnggota !== 'active' && (
            <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#DC2626] text-2xl">warning</span>
                <div>
                  <h4 className="text-[#991B1B] text-xs font-bold">Keanggotaan Nonaktif</h4>
                  <p className="text-[#7F1D1D] text-[10px] mt-0.5">Harap bayar Simpanan Pokok/Wajib agar status aktif.</p>
                </div>
              </div>
              <Link href="/savings" className="text-[#DC2626] text-xs font-bold hover:underline">BAYAR</Link>
            </div>
          )}

          {/* Total Simpanan Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="bg-[#718096] px-5 py-3">
              <h3 className="text-white text-xs font-bold tracking-wider">TOTAL SIMPANAN</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <h2 className="text-[26px] font-black text-[#0F172A]">Rp {financials.totalSavings.toLocaleString('id-ID')},00</h2>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Pokok</span>
                  <span className="text-xs font-bold text-[#334155]">Rp {(financials.simpananPokok / 1000).toFixed(0)}rb</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Wajib</span>
                  <span className="text-xs font-bold text-[#334155]">Rp {(financials.simpananWajib / 1000).toFixed(0)}rb</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Sukarela</span>
                  <span className="text-xs font-bold text-[#334155]">Rp {(financials.simpananSukarela / 1000).toFixed(0)}rb</span>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/savings" className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg text-slate-500 text-xs font-bold transition-all">
                  <span>Mutasi Saldo</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Saldo Poin Card */}
          <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-[24px] p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[#854D0E] text-sm font-black">SALDO POIN</h3>
              <span className="bg-[#FCD34D] text-[#854D0E] text-[10px] font-bold px-4 py-1 rounded-full">{rankName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FACC15] text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#854D0E]">{membershipScore.toLocaleString()}</span>
                  <span className="text-lg font-bold text-[#854D0E]">Skor</span>
                </div>
                <p className="text-[10px] font-extrabold text-[#854D0E]">Anggota {rankName}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-bold">
                <span className="text-slate-500">{pointsNeeded > 0 ? `${pointsNeeded.toLocaleString()} skor lagi menuju ${nextRankName}` : `${rankName} Tercapai!`}</span>
                <span className="text-slate-800">{membershipScore.toLocaleString()} / {nextRankThreshold.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div className="h-full bg-[#FACC15]" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>



          {/* Misi Hari Ini Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#64748B] text-lg font-bold">Misi Hari Ini</h3>
              <span className="text-[#FBBF24] text-[10px] font-bold font-inter">
                {activeQuests.filter((m: any) => m.frequency === 'daily' && !m.isCompleted).length} tersisa
              </span>
            </div>
            <div className="space-y-4">
              {activeQuests.filter((m: any) => m.frequency === 'daily').length === 0 ? (
                <p className="text-slate-400 text-xs">Belum ada misi harian tersedia.</p>
              ) : (
                <MissionList initialQuests={activeQuests} memberId={currentMember.id} />
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Link href="/quests" className="text-[#FBBF24] text-[11px] font-bold flex items-center gap-1 hover:underline">
                <span>Kelola Misi Selengkapnya</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Koperasi Hari Ini Card */}
          <div className="bg-[#718096] rounded-[24px] p-5 text-white flex flex-col gap-4">
            <h3 className="text-lg font-bold">Koperasi Hari Ini</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/90 rounded-[16px] p-3 text-[#1E293B] flex flex-col justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">swap_horiz</span>
                <span className="text-base font-black mt-1">{koperasiStats.transaksi}</span>
                <span className="text-[9px] font-bold text-slate-400">Transaksi</span>
              </div>
              <div className="bg-white/90 rounded-[16px] p-3 text-[#1E293B] flex flex-col justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">payments</span>
                <span className="text-base font-black mt-1">{koperasiStats.omzetHarian ? `Rp ${(koperasiStats.omzetHarian / 1000000).toFixed(0)}Jt` : '-'}</span>
                <span className="text-[9px] font-bold text-slate-400">Omzet Harian</span>
              </div>
              <div className="bg-white/90 rounded-[16px] p-3 text-[#1E293B] flex flex-col justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">groups</span>
                <span className="text-base font-black mt-1">{koperasiStats.anggotaBaru}</span>
                <span className="text-[9px] font-bold text-slate-400">Anggota Baru</span>
              </div>
              <div className="bg-white/90 rounded-[16px] p-3 text-[#1E293B] flex flex-col justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">storefront</span>
                <span className="text-base font-black mt-1">{koperasiStats.umkmAktif}</span>
                <span className="text-[9px] font-bold text-slate-400">UMKM Aktif</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}
