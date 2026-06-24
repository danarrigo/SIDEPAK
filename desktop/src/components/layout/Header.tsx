export default function Header() {
  return (
    <header className="w-full sticky top-0 z-40 glass-nav px-6 py-4 flex justify-between items-center border-b border-outline-variant/10">
<div className="flex items-center gap-4">
<button className="md:hidden text-on-surface">
<span className="material-symbols-outlined">menu</span>
</button>
<div className="hidden md:block">
<h2 className="font-headline-md text-headline-md">Dashboard Utama</h2>
<p className="text-[12px] text-on-surface-variant">Selamat pagi, mari bangun ekonomi desa bersama.</p>
</div>
</div>
<div className="flex items-center gap-6">
<div className="hidden lg:flex items-center gap-2 bg-surface-container p-2 rounded-full px-4 border border-outline-variant/20">
<span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "\'FILL\' 1" }}>local_fire_department</span>
<span className="font-points-display text-points-display text-on-surface">7 🔥 Hari Beruntun</span>
</div>
<div className="flex items-center gap-3">
<div className="relative">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
</div>
<div className="w-[1px] h-6 bg-outline-variant/30 mx-2"></div>
<div className="flex items-center gap-2">
<span className="font-label-caps text-label-caps text-tertiary">EMAS • 12,450 XP</span>
</div>
</div>
</div>
</header>
  );
}