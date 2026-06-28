import React from "react";
import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentMember } from "@/actions/members";
import { getFinancialsData } from "@/actions/financials";
import { getActiveQuests } from "@/actions/quests";
import { getKoperasiStats } from "@/actions/governance";
import { getEventsByCooperative, getMemberEventParticipations } from "@/actions/events";
import { redirect } from "next/navigation";
import MissionList from "@/components/MissionList";
import Leaderboard from "@/components/Leaderboard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { createClient } from "@/utils/supabase/server";

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

  const dbData = await getDashboardData(currentMember.id);
  const financials = await getFinancialsData(currentMember.id);
  const activeQuests = await getActiveQuests(currentMember.id);
  const koperasiStats = await getKoperasiStats(currentMember.cooperativeId as number);
  
  const { events: coopEvents } = await getEventsByCooperative(currentMember.cooperativeId as number);
  const { participations } = await getMemberEventParticipations(currentMember.id);
  const joinedEventIds = participations?.map(p => p.event.id) || [];
  
  const points = dbData?.progress?.pointsBalance || 0;
  const streak = Math.max(1, dbData?.progress?.currentStreak ?? 1);
  const level = dbData?.progress?.level || 1;
  const memberName = currentMember?.namaLengkap ? currentMember.namaLengkap.split(' ')[0] : "Anggota";

  const nextLevelPoints = level * 1000;
  let rankName = "Bronze";
  if (level >= 10 && level < 20) rankName = "Silver";
  else if (level >= 20 && level < 30) rankName = "Gold";
  else if (level >= 30) rankName = "Platinum";
  
  let nextRankName = "Silver";
  if (level >= 10 && level < 20) nextRankName = "Gold";
  else if (level >= 20 && level < 30) nextRankName = "Platinum";
  else if (level >= 30) nextRankName = "Legend";  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        
        {/* Row 1: Greeting & Title Banner */}
        <div className="glass-card animate-slide-up border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Selamat Datang kembali, {memberName}!</h2>
            <p className="text-on-surface-variant text-sm mt-1">Status Keanggotaan Anda sangat baik. Mari capai {nextRankName} bulan ini!</p>
          </div>
          <div className="flex items-center gap-3 bg-tertiary/10 px-4 py-2 border border-tertiary/20 rounded-xl text-tertiary">
            <span className="text-xl">🔥</span>
            <span className="font-extrabold text-sm">{streak} Hari Streak Beruntun!</span>
          </div>
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
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between relative group cursor-pointer transition-all hover:border-tertiary/50">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none rounded-2xl"></div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-8 w-48 p-3 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left pointer-events-none">
              <p className="text-xs font-bold mb-1 text-on-surface">Benefit {rankName}:</p>
              <ul className="text-[10px] space-y-1 text-on-surface-variant list-disc pl-3">
                <li>Bunga pinjaman khusus</li>
                <li>Prioritas layanan</li>
                <li>Cashback belanja {level >= 30 ? '15%' : level >= 20 ? '10%' : level >= 10 ? '5%' : '0%'}</li>
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
                  <span className="text-4xl font-black text-tertiary">{points.toLocaleString()}</span>
                  <span className="text-sm font-bold text-tertiary">Poin</span>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant">Tingkat Anggota {rankName}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-outline-variant/30 pt-6 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                <span>{nextLevelPoints - points > 0 ? `${nextLevelPoints - points} Poin lagi ke ${nextRankName}` : `${nextRankName} Tercapai!`}</span>
                <span>{points} / {nextLevelPoints.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-tertiary" style={{ width: `${Math.min(100, (points / nextLevelPoints) * 100)}%` }}></div>
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
                <span className="text-[10px] text-tertiary font-bold">Poin Tersedia</span>
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

        {/* Row 4: Weekly Calendar */}
        <div className="grid grid-cols-1 gap-6">
          <WeeklyCalendar 
            events={coopEvents || []} 
            joinedEventIds={joinedEventIds} 
            memberId={currentMember.id} 
          />
        </div>

      </div>
    </main>
  );
}
