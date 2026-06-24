import { getArenaData } from "@/actions/arena";

export default async function Page() {
  const { activeBattles } = await getArenaData(1);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
      
<div className="fixed inset-0 pointer-events-none opacity-20">

</div>

<div className="mb-12 text-center relative z-10">
<p className="font-label-caps text-label-caps text-tertiary mb-2 uppercase tracking-widest">Weekly Battle • Arena #42</p>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Duel Koperasi Pekan Ini</h2>
</div>

<section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center mb-16 relative z-10">

<div className="glass-card rounded-xl p-8 flex flex-col items-center border-l-4 border-l-primary group transition-all duration-300 hover:translate-y-[-4px]">
<div className="relative mb-6">
<div className="w-40 h-40 rounded-full border-4 border-primary p-1">
<div className="w-full h-full rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A focused close-up of a competitive male gamer or professional named Agung, showing determination. The style is sharp and high-contrast, with blue rim lighting highlighting his profile. He is set against a dark background with subtle digital data stream motifs, embodying the reliable yet competitive spirit of the village cooperative's digital arena." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdupdYcVK2nG8tWkfkRBAuTCr_nGQ8NSbOeleqMCgWvJmCXZB-pcQ9XqHVWrBZcqsita-uzzoxLZxvD9NwZm_t3t0yKECCmeZ5DuJwrLcdRz_NmeM73V0jgsLLFAzP64I5ReV2KpzsUfuR1TMrb_8vDmTBdzgIzWiHht5jUBcQoKkRlQtQU3KZfZ0gP3tb41QvGHH5Y7idhGk0nSsTVOIrDC3mQnZae_LfggZd3EdPOsEJfF5xTskuTekZO9VvrjrD7XDLL7U51gw"/>
</div>
</div>
<div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full text-[12px] font-bold shadow-lg">Lvl 24</div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-1">Agung</h3>
<span className="font-label-caps text-label-caps text-on-surface-variant mb-6">Sektor Utara • Elite Rank</span>
<div className="w-full space-y-6">
<div>
<div className="flex justify-between mb-2">
<span className="font-body-md text-body-md text-on-surface-variant">Transaksi Mingguan</span>
<span className="font-points-display text-points-display text-primary">82%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" ></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2">
<span className="font-body-md text-body-md text-on-surface-variant">Target Menabung</span>
<span className="font-points-display text-points-display text-primary">Rp 4.2M</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" ></div>
</div>
</div>
</div>
</div>

<div className="flex flex-col items-center">
<div className="w-20 h-20 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center relative shadow-2xl">
<span className="text-4xl font-black vs-gradient italic">VS</span>
<div className="absolute -inset-4 border border-tertiary/20 rounded-full animate-pulse"></div>
</div>
<div className="mt-4 text-center">
<div className="text-tertiary font-bold animate-bounce mt-2">
<span className="material-symbols-outlined">timer</span>
<div className="font-label-caps text-label-caps">2 Hari Lagi</div>
</div>
</div>
</div>

<div className="glass-card rounded-xl p-8 flex flex-col items-center border-r-4 border-r-tertiary group transition-all duration-300 hover:translate-y-[-4px]">
<div className="relative mb-6">
<div className="w-40 h-40 rounded-full border-4 border-tertiary p-1">
<div className="w-full h-full rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A portrait of Budi, a charismatic and energetic male competitor for the digital cooperative platform. He has a friendly yet competitive expression, lit with warm golden hues that suggest success and achievement. The background features subtle golden bokeh circles on a deep navy base, maintaining the gamified corporate aesthetic and premium brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwoTGiazM0ernIl5Zjxy5csHoM7vD5ykvEGTM43gS8Wi6o2-7KFXqFTJe_6NIwM2OnrwkOpi8A52W-WhXaq2pMF-MHCO0dZrGNLyYsrOE533jpyX7taSpE1QiDWbTCnujX2OZYRNqJxb3h7kW8k2iWt62GBWaWbHKI61VgqD2W_6cnZ_ZeueqE5Qox8PeSlJyU1hIkCjpZDdAqwBoYcJPLSbPxVUc_Jtitofk9F1XsG45c_FRv9m0owoyBtcyx3AHo9dLt3PqC9Do"/>
</div>
</div>
<div className="absolute -bottom-2 -left-2 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-[12px] font-bold shadow-lg">Lvl 21</div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-1">Budi</h3>
<span className="font-label-caps text-label-caps text-on-surface-variant mb-6">Sektor Selatan • Gold Rank</span>
<div className="w-full space-y-6 text-right">
<div>
<div className="flex justify-between mb-2 flex-row-reverse">
<span className="font-body-md text-body-md text-on-surface-variant">Transaksi Mingguan</span>
<span className="font-points-display text-points-display text-tertiary">94%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex justify-end">
<div className="h-full bg-tertiary rounded-full progress-glow" ></div>
</div>
</div>
<div>
<div className="flex justify-between mb-2 flex-row-reverse">
<span className="font-body-md text-body-md text-on-surface-variant">Target Menabung</span>
<span className="font-points-display text-points-display text-tertiary">Rp 5.1M</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex justify-end">
<div className="h-full bg-tertiary rounded-full progress-glow" ></div>
</div>
</div>
</div>
</div>
</section>

<section className="relative z-10">
<div className="flex justify-between items-end mb-6">
<div>
<h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Pertandingan</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Rekam jejak performa dalam 5 arena terakhir.</p>
</div>
<button className="px-6 py-2 bg-surface-container-highest border border-outline-variant hover:bg-surface-container transition-colors rounded-lg font-label-caps text-label-caps flex items-center gap-2">
                    Unduh Laporan <span className="material-symbols-outlined text-[18px]">download</span>
</button>
</div>
<div className="glass-card rounded-xl overflow-hidden shadow-xl">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant/30">
<th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant">Minggu</th>
<th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant">Lawan</th>
<th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant text-center">Status</th>
<th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant text-right">Keuntungan Poin</th>
<th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant text-center">Aksi</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">

<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="px-8 py-4">
<span className="font-body-lg text-body-lg text-on-surface">Pekan 41</span>
<p className="text-[12px] text-on-surface-variant">12 - 18 Okt 2023</p>
</td>
<td className="px-8 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-secondary/20">
<img className="w-full h-full object-cover" data-alt="A portrait of a female competitor named Siti, with a confident and skilled demeanor. She is lit with cool blue tones against a dark navy background. Professional studio lighting with high contrast." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpf_opVr4PR2BmUS4NdY9hRWCXdXuQKYVmphuLeoRYqLXP-t6-1NpN4fPj7cuZwbh9mBwCfClVWSv1tMxhT6KhMN7HcUfnh8xnqtKDHmliFJzafDCh41eGvcpam4MO4-HhikMGBqmP7f2mD0AaV329mUgbg-ZO6X2DGC90atr_TiZQOzAchIKEpzQKlc-xTAGm2kjOtc2qFghm94hPk_4FIlSQQMU5Fy7rWQlizy-IhCXdP4hNZPb_XBwZs7rxgrA335XAIX0N914"/>
</div>
<span className="font-body-md text-body-md text-on-surface">Siti Rahma</span>
</div>
</td>
<td className="px-8 py-4 text-center">
<span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-[12px] font-bold border border-green-500/30">MENANG</span>
</td>
<td className="px-8 py-4 text-right">
<span className="font-points-display text-points-display text-tertiary">+1,250 XP</span>
</td>
<td className="px-8 py-4 text-center">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">visibility</span>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="px-8 py-4">
<span className="font-body-lg text-body-lg text-on-surface">Pekan 40</span>
<p className="text-[12px] text-on-surface-variant">05 - 11 Okt 2023</p>
</td>
<td className="px-8 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-secondary/20">
<img className="w-full h-full object-cover" data-alt="A portrait of a male competitor named Deri, looking focused and calm. The lighting is low-key with a focus on details, against a dark, tech-oriented background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjd3x-f2IHHAAHmuZU9liqFYdjc2GPtUI98epxNTLZDSXhIIE-bZvp3vMQbeeGuhsmh9SPLJ1BMcSy5W9mud0QHwEnmgjYc4BlnBtpNDchcK-xyPDQtPiu1PjTr8hhyJIgw6Z4qAv89Sj9qqOORHj-sLoLLArezaoJhJuorfwT_7vaw3GUelF-7xHVC8E378qYU5LHjzCSdzGngZtM7a0EJ3UpfTWle5U9rUC4a3pdyckU2tZIkcHddirKHgoluhGJwMHquwe5A9E"/>
</div>
<span className="font-body-md text-body-md text-on-surface">Deri Wijaya</span>
</div>
</td>
<td className="px-8 py-4 text-center">
<span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-[12px] font-bold border border-red-500/30">KALAH</span>
</td>
<td className="px-8 py-4 text-right">
<span className="font-points-display text-points-display text-on-surface-variant">-450 XP</span>
</td>
<td className="px-8 py-4 text-center">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">visibility</span>
</td>
</tr>

<tr className="hover:bg-surface-container-high/40 transition-colors">
<td className="px-8 py-4">
<span className="font-body-lg text-body-lg text-on-surface">Pekan 39</span>
<p className="text-[12px] text-on-surface-variant">28 Sep - 04 Okt 2023</p>
</td>
<td className="px-8 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-secondary/20">
<img className="w-full h-full object-cover" data-alt="A profile of an older, experienced male competitor named Pak Slamet, radiating wisdom and reliability. Muted grey lighting on a professional dark backdrop." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaK0fSr4UaJAEwAAV5vLjeLZS2fpqegIae-fyDIwYlrB1JRofKyncuTX4mFxHGVeNXpzSoJV2ezcPwwogOOugtaiWcJJGpkHNN5ghjfMl4cka0wXtAa3ATsCjJYCyD_Nrh-FpTZbGBYhshCKnXFJl_aj_UarwRb0NzNtv-jhw9_eFPsSIF_I1dvmiRhuRYDBQ2dXr29vtuxMM3wx4d_XqTGejaE5gL--kKcL3zhkGMYghW2IJnSyjcpOtQZXtn4yX_uDo5mXM61ic"/>
</div>
<span className="font-body-md text-body-md text-on-surface">Pak Slamet</span>
</div>
</td>
<td className="px-8 py-4 text-center">
<span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-[12px] font-bold border border-green-500/30">MENANG</span>
</td>
<td className="px-8 py-4 text-right">
<span className="font-points-display text-points-display text-tertiary">+850 XP</span>
</td>
<td className="px-8 py-4 text-center">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">visibility</span>
</td>
</tr>
</tbody>
</table>
</div>
      </section>
      </div>
    </main>
  );
}