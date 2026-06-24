import { getGovernanceData } from "@/actions/governance";

export default async function Page() {
  const { activeProposals, totalMembers } = await getGovernanceData();
  
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
      
<div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-8 bento-card flex items-center px-10">

<div className="relative z-10">
<h1 className="font-headline-lg text-headline-lg mb-2">Governance Dashboard</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                    Partisipasi aktif Anda membangun fondasi desa digital yang berkelanjutan. Tentukan masa depan bersama melalui keputusan demokratis yang transparan.
                </p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div className="bento-card p-6 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">group</span>
<span className="font-label-caps text-label-caps text-on-surface-variant">+12%</span>
</div>
<div>
<div className="font-headline-md text-headline-md">{totalMembers.toLocaleString()}</div>
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Anggota Aktif</div>
</div>
</div>
<div className="bento-card p-6 rounded-xl flex flex-col justify-between border-l-4 border-tertiary">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg" style={{ fontVariationSettings: "\'FILL\' 1" }}>account_balance_wallet</span>
<span className="font-label-caps text-label-caps text-tertiary">SURPLUS</span>
</div>
<div>
<div className="font-headline-md text-headline-md">Rp 4.2M</div>
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Aset Desa</div>
</div>
</div>
<div className="bento-card p-6 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">how_to_vote</span>
<span className="font-label-caps text-label-caps text-on-surface-variant">88% Quorum</span>
</div>
<div>
<div className="font-headline-md text-headline-md">12</div>
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Resolusi Selesai</div>
</div>
</div>
<div className="bento-card p-6 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">speed</span>
<span className="font-label-caps text-label-caps text-error">URGENT</span>
</div>
<div>
<div className="font-headline-md text-headline-md">3 Hari</div>
<div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sisa Waktu Voting</div>
</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

<div className="lg:col-span-4 space-y-8">

<section className="bento-card rounded-xl p-6">
<div className="flex items-center justify-between mb-6">
<h2 className="font-headline-md text-headline-md">Tingkat Kepercayaan</h2>
<span className="material-symbols-outlined text-on-surface-variant">info</span>
</div>
<div className="space-y-6">
<div>
<div className="flex justify-between mb-2">
<span className="font-body-md text-body-md">Transparansi Dana</span>
<span className="font-points-display text-points-display text-tertiary">94%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-tertiary to-secondary" ></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2">
<span className="font-body-md text-body-md">Keadilan Distribusi</span>
<span className="font-points-display text-points-display text-tertiary">82%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-tertiary to-secondary" ></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2">
<span className="font-body-md text-body-md">Kecepatan Resolusi</span>
<span className="font-points-display text-points-display text-tertiary">71%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-tertiary to-secondary" ></div>
</div>
</div>
</div>
<div className="mt-8 p-4 bg-primary-container rounded-lg border border-primary/20">
<div className="flex gap-3">
<span className="material-symbols-outlined text-primary">verified_user</span>
<div>
<p className="font-label-caps text-label-caps text-primary uppercase">Status Koperasi</p>
<p className="font-body-md text-body-md mt-1">Sangat Terpercaya (Tier Gold)</p>
</div>
</div>
</div>
</section>

<section className="bento-card rounded-xl p-6">
<h2 className="font-headline-md text-headline-md mb-6">Linimasa Keputusan</h2>
<div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
<div className="relative pl-10">
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-primary"></div>
</div>
<span className="font-label-caps text-label-caps text-on-surface-variant">24 Okt 2023</span>
<h3 className="font-body-lg text-body-lg mt-1">Persetujuan Alokasi Surplus</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">80% Dialokasikan untuk pengembangan infrastruktur digital RT 04.</p>
</div>
<div className="relative pl-10 opacity-70">
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-outline flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-outline"></div>
</div>
<span className="font-label-caps text-label-caps text-on-surface-variant">15 Okt 2023</span>
<h3 className="font-body-lg text-body-lg mt-1">Audit Keuangan Kuartal III</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Hasil audit menunjukkan kepatuhan 100% terhadap regulasi koperasi.</p>
</div>
<div className="relative pl-10 opacity-70">
<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-outline flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-outline"></div>
</div>
<span className="font-label-caps text-label-caps text-on-surface-variant">02 Okt 2023</span>
<h3 className="font-body-lg text-body-lg mt-1">Pemilihan Ketua Komite Baru</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Bapak Sugeng terpilih sebagai ketua komite pengawas transaksi.</p>
</div>
</div>
<button className="w-full mt-6 py-3 border border-outline-variant/30 rounded-lg font-label-caps text-label-caps hover:bg-surface-container-high transition-colors">LIHAT SEMUA RIWAYAT</button>
</section>
</div>

<div className="lg:col-span-8 space-y-8">

<section className="bento-card rounded-xl p-6">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
<div>
<div className="flex items-center gap-3">
<span className="px-2 py-0.5 bg-error/20 text-error rounded font-label-caps text-[10px] uppercase tracking-wider">Sedang Berlangsung</span>
<h2 className="font-headline-md text-headline-md">Voting Digital #42</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Pengajuan Kredit Kolektif Pengadaan Solar Panel Desa.</p>
</div>
<div className="flex gap-2">
<div className="text-right">
<p className="font-label-caps text-label-caps text-on-surface-variant">WAKTU TERSISA</p>
<p className="font-points-display text-headline-md text-primary">02h : 14m : 55s</p>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
<div className="relative rounded-xl overflow-hidden aspect-video border border-outline-variant/20">
<img className="w-full h-full object-cover" data-alt="A clean, cinematic photograph of a modern rural sustainable energy project with rows of sleek solar panels integrated into a green Indonesian village landscape, soft sunset lighting, ultra-high definition, professional architectural photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_3kWARcd9K0hNLgAXvLH4vxU0Jq0InBMosG4RCCELPxRs6KEn4m-Ig8UAMF9sygV5jYHcgZI1__1vsTz36-XfKS4L2k8sDA4O1d8VvHoQ4Sbo5WSw1mFuUpPqhNnKIYJmMPqbjENWn5zEBsMP8Gc9nPLBWrk4L7u0wegGez_Xnq85-R6XlL51m1uOmjq1DltNoFA5XV2geUVw-ibQGK-3A1lQFCM5sYSgpg66oXFHDOkvU4lQnuKkg_LFyZojbRRoLYu3I0z0yjo"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
<span className="font-label-caps text-label-caps text-white/70">PROPOSAL VISUAL</span>
<h4 className="text-white font-body-lg">Integrasi Solar Panel RT 01-05</h4>
</div>
</div>
<div className="space-y-4">
<div className="p-4 bg-surface-container rounded-lg">
<h4 className="font-body-lg text-body-lg mb-2">Detail Proposal</h4>
<ul className="space-y-2">
<li className="flex items-center gap-2 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-sm">check_circle</span>
                                        Estimasi Penghematan: 40% Listrik/bln
                                    </li>
<li className="flex items-center gap-2 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-sm">check_circle</span>
                                        Total Investasi: Rp 450,000,000
                                    </li>
<li className="flex items-center gap-2 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-sm">check_circle</span>
                                        Tenor Pengembalian: 24 Bulan
                                    </li>
</ul>
</div>
<div className="flex items-center justify-between px-2">
<span className="font-label-caps text-label-caps text-on-surface-variant">QUORUM TERCAPAI (65%)</span>
<span className="font-label-caps text-label-caps text-primary">BUTUH 10% LAGI</span>
</div>
<div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary" ></div>
</div>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
<button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95">
<span className="material-symbols-outlined text-4xl mb-2 text-primary group-hover:scale-110 transition-transform">thumb_up</span>
<span className="font-label-caps text-label-caps">SETUJU</span>
</button>
<button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-error/50 hover:bg-error/5 transition-all active:scale-95">
<span className="material-symbols-outlined text-4xl mb-2 text-error group-hover:scale-110 transition-transform">thumb_down</span>
<span className="font-label-caps text-label-caps">TOLAK</span>
</button><button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95">
<span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-hover:scale-110 transition-transform">remove_circle</span>
<span className="font-label-caps text-label-caps">ABSTAIN</span>
</button>
</div>
</section>

</div>
</div>
      </div>
    </main>
  );
}