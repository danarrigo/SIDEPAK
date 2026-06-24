import { getFinancialsData } from "@/actions/financials";

export default async function Page() {
  const { savings, loans, dues, totalSavings } = await getFinancialsData(1);
  const totalTransaksi = savings.length + loans.length + dues.length;
  const estimasiSHU = Math.floor(totalSavings * 0.12);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      
<div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 pb-32">

<section>
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-headline-md text-on-surface">Dampak Personal</h3>
<p className="font-body-md text-body-md text-tertiary cursor-pointer hover:underline">Lihat Laporan Tahunan</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<div className="bg-surface-container rounded-3xl p-6 border border-outline-variant glow-card transition-all">
<div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-4 text-primary">
<span className="material-symbols-outlined">swap_horiz</span>
</div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Total Transaksi</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">{totalTransaksi}</h4>
<p className="font-body-md text-body-md text-primary mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-sm">trending_up</span> Aktif bertransaksi
                            </p>
</div>

<div className="bg-surface-container rounded-3xl p-6 border border-outline-variant glow-card transition-all">
<div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center mb-4 text-tertiary">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "\'FILL\' 1" }}>savings</span>
</div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Estimasi SHU</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">Rp {(estimasiSHU || 4200000).toLocaleString('id-ID')}</h4>
<p className="font-body-md text-body-md text-tertiary mt-2">Tahun Buku 2024</p>
</div>

<div className="bg-surface-container rounded-3xl p-6 border border-outline-variant glow-card transition-all">
<div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center mb-4 text-secondary">
<span className="material-symbols-outlined">storefront</span>
</div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">UMKM Didukung</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">14 Unit</h4>
<p className="font-body-md text-body-md text-secondary mt-2">Wilayah Desa Sukajaya</p>
</div>

<div className="bg-surface-container rounded-3xl p-6 border border-outline-variant glow-card transition-all">
<div className="w-12 h-12 bg-error-container rounded-2xl flex items-center justify-center mb-4 text-error">
<span className="material-symbols-outlined">rocket_launch</span>
</div>
<p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Win Rate</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">78.5%</h4>
<p className="font-body-md text-body-md text-error mt-2">Dari 200+ Kompetisi</p>
</div>
</div>
</section>
<div className="max-w-4xl mx-auto w-full space-y-6 mt-8">
<h3 className="font-headline-md text-headline-md text-on-surface">Pengaturan Akun</h3>
<div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant divide-y divide-outline-variant/50">

<div className="p-6 hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between group">
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

<div className="p-6 hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between group">
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

<div className="p-6 hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between group">
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

<div className="p-6 hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between group">
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

<div className="mt-8">
<button className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-error/30 text-error hover:bg-error/5 transition-colors w-full md:w-auto">
<span className="material-symbols-outlined">logout</span>
<span className="font-body-lg text-body-lg font-bold">Keluar dari Aplikasi</span>
</button>
</div>
</div>
</div>
    </main>
  );
}