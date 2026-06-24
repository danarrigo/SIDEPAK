import React from "react";
import Link from "next/link";
import { getDashboardData } from "@/actions/dashboard";
import { getMemberData } from "@/actions/members";
import MissionList from "./MissionList"; // We will extract the mission list to a Client Component

export default async function DesktopDashboard() {
  const dbData = await getDashboardData(1);
  const member = await getMemberData(1);
  
  const points = dbData?.progress?.pointsBalance || 0;
  const streak = dbData?.progress?.currentStreak || 0;
  const memberName = member?.namaLengkap ? member.namaLengkap.split(' ')[0] : "Anggota";

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        
        {/* Row 1: Greeting & Title Banner */}
        <div className="glass-card border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Selamat Datang kembali, {memberName}!</h2>
            <p className="text-on-surface-variant text-sm mt-1">Status Keanggotaan Anda sangat baik. Mari capai Platinum bulan ini!</p>
          </div>
          <div className="flex items-center gap-3 bg-tertiary/10 px-4 py-2 border border-tertiary/20 rounded-xl text-tertiary">
            <span className="text-xl">🔥</span>
            <span className="font-extrabold text-sm">{streak} Hari Streak Beruntun!</span>
          </div>
        </div>

        {/* Row 2: Grid for Savings and Points */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Savings Summary Card */}
          <div className="glass-card border border-outline-variant rounded-2xl overflow-hidden flex flex-col justify-between col-span-1 lg:col-span-2">
            <div className="bg-surface-container-highest px-6 py-4 flex justify-between items-center border-b border-outline-variant/30">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-on-surface">TOTAL SIMPANAN KOPERASI</h3>
              <span className="material-symbols-outlined text-primary text-sm">savings</span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
              <div>
                <span className="text-on-surface-variant text-xs font-semibold">Saldo Terkonsolidasi</span>
                <h2 className="text-3xl font-black text-on-surface mt-1">Rp 8.754.000,00</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/30 pt-6">
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Pokok</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp 750.000</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Wajib</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp 750.000</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Simpanan Sukarela</p>
                  <p className="text-xs font-bold text-on-surface mt-1">Rp 7.254.000</p>
                </div>
              </div>

              <div>
                <button className="flex items-center gap-2 border border-outline hover:border-primary px-4 py-2 rounded-xl text-primary text-xs font-bold transition-colors">
                  <span>Lihat Riwayat Mutasi</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Saldo Poin Progress Card */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-tertiary">SALDO POIN</h3>
              <span className="bg-tertiary/10 text-tertiary text-[10px] font-extrabold px-3 py-1 rounded-full border border-tertiary/20">Emas</span>
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
                <p className="text-[10px] font-bold text-on-surface-variant">Tingkat Anggota Emas</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-outline-variant/30 pt-6 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                <span>{1500 - points > 0 ? `${1500 - points} Poin lagi ke Platinum` : "Platinum Tercapai!"}</span>
                <span>{points} / 1.500</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-tertiary" style={{ width: `${Math.min(100, (points / 1500) * 100)}%` }}></div>
              </div>
            </div>
          </div>

        </div>

        {/* Row 3: Missions, Stats Preview, and Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Missions Preview */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-on-surface">Misi Hari Ini</h3>
                <span className="text-[10px] text-tertiary font-bold">+100 Poin Tersedia</span>
              </div>
              <MissionList />
            </div>
            <div className="pt-4 border-t border-outline-variant/30 mt-6">
              <Link href='/quests' className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                <span>Kelola Semua Misi</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Cooperative Today Stats Summary */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-on-surface mb-6">Koperasi Hari Ini</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">swap_horiz</span>
                  <p className="text-xl font-black text-on-surface mt-1">37</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Transaksi</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">attach_money</span>
                  <p className="text-sm font-black text-on-surface mt-1 truncate">Rp 14,53 Jt</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Omzet Harian</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">groups</span>
                  <p className="text-xl font-black text-on-surface mt-1">8</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">Anggota Baru</p>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-base">storefront</span>
                  <p className="text-xl font-black text-on-surface mt-1">12</p>
                  <p className="text-[9px] font-bold text-on-surface-variant">UMKM Aktif</p>
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

          {/* Announcement Widget */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-on-surface mb-4">Pengumuman</h3>
              <div className="space-y-3">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  <h4 className="font-bold text-xs text-on-surface leading-tight">RAT Buku 2025 - Hadiri & Dukung Koperasi</h4>
                  <p className="text-[9px] text-on-surface-variant font-medium mt-1">Pelaksanaan: 15 Juli 2026</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  <h4 className="font-bold text-xs text-on-surface leading-tight">Pembagian SHU Tahun Buku 2024 Bagi Seluruh Anggota...</h4>
                  <p className="text-[9px] text-on-surface-variant font-medium mt-1">Pelaksanaan: 1 Juli 2026</p>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-on-surface-variant text-center font-medium pt-3 mt-4 border-t border-outline-variant/30">
              Sistem Pembaruan Otomatis
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
