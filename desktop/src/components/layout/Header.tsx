import { getCurrentMember } from "@/actions/members";
import { getMemberProgress } from "@/actions/gamification";

import NotificationBell from "./NotificationBell";

export default async function Header() {
  const member = await getCurrentMember();
  let progress = null;
  if (member) {
    progress = await getMemberProgress(member.id);
  }

  const streak = progress?.currentStreak ?? 0;
  const xp = progress?.xp ?? 0;
  const level = progress?.level ?? 1;

  const rank = level >= 10 ? "EMAS" : level >= 5 ? "PERAK" : "PERUNGGU";

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
<span className="font-points-display text-points-display text-on-surface">{streak} 🔥 Hari Beruntun</span>
</div>
<div className="flex items-center gap-3">
        <NotificationBell />
<div className="w-[1px] h-6 bg-outline-variant/30 mx-2"></div>
<div className="flex items-center gap-2">
<span className="font-label-caps text-label-caps text-tertiary">{rank} • {xp.toLocaleString()} XP</span>
</div>
</div>
</div>
</header>
  );
}