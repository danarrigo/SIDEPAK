import { getFinancialsData, getActiveLoan } from "@/actions/financials";
import { getCurrentMember } from "@/actions/members";
import { redirect } from "next/navigation";
import { getWinRate, getMemberInventory, getRecentPointTransactions, getMemberProgress } from "@/actions/gamification";
import { logout } from "@/actions/auth";
import TopUpModal from "@/components/TopUpModal";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const { savings, loans, dues, totalSavings } = await getFinancialsData(currentMember.id);
  const totalTransaksi = savings.length + loans.length + dues.length;
  const estimasiSHU = totalSavings > 0 ? Math.floor(totalSavings * 0.12) : 0;
  
  const { winRate, totalBattles } = await getWinRate(currentMember.id);

  const activeLoan = await getActiveLoan(currentMember.id);
  const inventory = await getMemberInventory(currentMember.id);
  const activityLog = await getRecentPointTransactions(currentMember.id);
  const progress = await getMemberProgress(currentMember.id);

  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  
  let rankName = "BRONZE";
  let rankColor = "from-amber-700 to-amber-900";
  let badgeIcon = "eco";
  
  if (level >= 10 && level < 20) { rankName = "SILVER"; rankColor = "from-slate-400 to-slate-600"; badgeIcon = "military_tech"; }
  else if (level >= 20 && level < 30) { rankName = "GOLD"; rankColor = "from-yellow-400 to-amber-600"; badgeIcon = "crown"; }
  else if (level >= 30 && level < 40) { rankName = "PLATINUM"; rankColor = "from-cyan-400 to-blue-600"; badgeIcon = "diamond"; }
  else if (level >= 40) { rankName = "LEGEND"; rankColor = "from-purple-500 to-fuchsia-700"; badgeIcon = "auto_awesome"; }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      
<div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 pb-32">

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
<p className="font-body-md text-body-md text-tertiary cursor-pointer hover:underline">Lihat Laporan Tahunan</p>
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
  <h4 className="font-headline-lg text-headline-lg text-on-surface">Rp {estimasiSHU.toLocaleString('id-ID')}</h4>
</div>
<p className="font-body-md text-body-md text-tertiary mt-2">Tahun Buku 2024</p>
</div>

<div className="glass-card rounded-3xl p-6 border border-outline-variant transition-all flex flex-col justify-between">
<div>
  <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-4 text-primary">
    <span className="material-symbols-outlined">payments</span>
  </div>
  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Saldo Dompet</p>
  <h4 className="font-headline-lg text-headline-lg text-on-surface">Rp {progress?.walletBalance?.toLocaleString('id-ID') || 0}</h4>
</div>
<div className="mt-4">
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
<div className="glass-card rounded-3xl overflow-hidden border border-outline-variant divide-y divide-outline-variant/50">

<div className="p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between group">
<div className="flex items-center gap-5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">security</span>
</div>
<div>
<p className="font-body-lg text-body-lg text-on-surface">Keamanan &amp; Password</p>
<p className="font-body-md text-body-md text-on-surface-variant">Update password, 2FA, dan biometrik</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>

<div className="p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between group">
<div className="flex items-center gap-5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">notifications_active</span>
</div>
<div>
<p className="font-body-lg text-body-lg text-on-surface">Notifikasi</p>
<p className="font-body-md text-body-md text-on-surface-variant">Atur pengingat iuran dan info SHU</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>

<div className="p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between group">
<div className="flex items-center gap-5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">payments</span>
</div>
<div>
<p className="font-body-lg text-body-lg text-on-surface">Metode Pembayaran</p>
<p className="font-body-md text-body-md text-on-surface-variant">Kelola bank, e-wallet, dan kartu debit</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>

<div className="p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between group">
<div className="flex items-center gap-5">
<div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">diversity_3</span>
</div>
<div>
<p className="font-body-lg text-body-lg text-on-surface">Hubungan Keluarga</p>
<p className="font-body-md text-body-md text-on-surface-variant">Tautkan akun keluarga untuk benefit grup</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
</div>

<div className="mt-8 px-2 pb-8">
<form action={logout}>
<button type="submit" className="glass-card flex items-center gap-3 px-6 py-4 rounded-2xl border border-error/30 text-error hover:bg-error/10 hover:border-error/50 transition-colors w-full md:w-auto">
<span className="material-symbols-outlined">logout</span>
<span className="font-body-lg text-body-lg font-bold">Keluar dari Aplikasi</span>
</button>
</form>
</div>
</div>
</div>
    </main>
  );
}