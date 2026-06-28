import { getDashboardData } from "@/actions/dashboard";
import { getActiveQuests } from "@/actions/quests";
import { getCurrentMember } from "@/actions/members";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { items } from "@/db/schema/gamification";
import { quests } from "@/db/schema/achievements";
import MissionList from "@/components/MissionList";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const dbData = await getDashboardData(currentMember.id);
  const activeQuests = await getActiveQuests(currentMember.id);
  
  // Seed initial items and quests if empty (check via DB)
  const existingQuests = await db.select().from(quests).limit(1);
  if (existingQuests.length === 0) {
    try {
      await db.insert(items).values([
        { name: "Sakit Jantung", description: "Beri efek jantungan (jumpscare) pada teman koperasimu!", priceInPoints: 50, effectType: "prank", effectValue: "sakit_jantung" },
        { name: "Freeze Streak", description: "Pertahankan streakmu meskipun kamu lupa login sehari.", priceInPoints: 100, effectType: "freeze_streak", effectValue: "1" },
        { name: "Poin Bomb", description: "Raih 2x XP dari semua aktivitas besok.", priceInPoints: 300, effectType: "point_bomb", effectValue: "2x" }
      ]);
      await db.insert(quests).values([
        { title: "Nabung Yuk!", description: "Lakukan 1x transaksi menabung hari ini.", rewardPoints: 200, frequency: "daily", targetCount: 1 },
        { title: "Bayar Iuran", description: "Selesaikan iuran wajib bulan ini.", rewardPoints: 500, frequency: "monthly", targetCount: 1 },
        { title: "Duel Master", description: "Menangkan 3 battle di Arena Koperasi.", rewardPoints: 1000, frequency: "weekly", targetCount: 3 }
      ]);
    } catch(e) {
      console.log(e);
    }
  }

  const xp = dbData?.progress?.xp || 0;
  const points = dbData?.progress?.pointsBalance || 0;
  const level = dbData?.progress?.level || 1;
  const nextLevelXp = level * 1000;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);

  let currentRankIndex = 0;
  if (level >= 10 && level < 20) currentRankIndex = 1;
  else if (level >= 20 && level < 30) currentRankIndex = 2;
  else if (level >= 30 && level < 40) currentRankIndex = 3;
  else if (level >= 40) currentRankIndex = 4;

  const ranks = [
    { name: "BRONZE", icon: "eco", color: "text-amber-700", bg: "bg-amber-700/20", border: "border-amber-700", glow: "shadow-[0_0_15px_rgba(180,83,9,0.3)]" },
    { name: "SILVER", icon: "military_tech", color: "text-slate-400", bg: "bg-slate-400/20", border: "border-slate-400", glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]" },
    { name: "GOLD", icon: "crown", color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400", glow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
    { name: "PLATINUM", icon: "diamond", color: "text-cyan-400", bg: "bg-cyan-400/20", border: "border-cyan-400", glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
    { name: "LEGEND", icon: "auto_awesome", color: "text-purple-500", bg: "bg-purple-500/20", border: "border-purple-500", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]" }
  ];
  
  // Base width per rank is 25% (4 gaps between 5 ranks). Add a bit of progress based on level.
  const progressPercent = Math.min(100, (currentRankIndex * 25) + ((level % 10) / 10) * 25);

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const resetTimeStr = `Reset dalam ${diffHrs}j ${diffMins}m`;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <aside className="col-span-12 lg:col-span-4 space-y-6 animate-slide-up">
        <section className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  PERINGKAT SAAT INI
                </p>
                <h2 className="font-headline-lg text-headline-lg text-tertiary">
                  Level {level} Member
                </h2>
              </div>
              <div className="w-14 h-14 rounded-full bg-tertiary/20 flex items-center justify-center gold-glow border-2 border-tertiary">
                <span
                  className="material-symbols-outlined text-tertiary text-3xl"
                  style={{ fontVariationSettings: "\'FILL\' 1" }}
                >
                  crown
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between font-label-caps text-label-caps">
                <span className="text-on-surface-variant">
                  {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                </span>
                <span className="text-tertiary">Level {level}</span>
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tertiary to-primary rounded-full shadow-[0_0_10px_rgba(233,196,0,0.4)]"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
              <p className="text-[12px] text-on-surface-variant italic">
                {nextLevelXp - xp} XP lagi untuk mencapai level berikutnya
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-xl p-6 animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md">Misi Harian</h3>
            <span className="font-label-caps text-label-caps text-primary">
              {resetTimeStr}
            </span>
          </div>
          <div className="space-y-4">
            <MissionList initialQuests={activeQuests} memberId={currentMember.id} />
          </div>
        </section>

        <section className="glass-card rounded-xl p-6 animate-slide-up delay-150">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md">Misi Mingguan</h3>
          </div>
          <div className="space-y-4">
            <MissionList initialQuests={activeQuests} memberId={currentMember.id} frequency="weekly" />
          </div>
        </section>
      </aside>

      <div className="col-span-12 lg:col-span-8 space-y-6 animate-slide-up delay-200">
        <section className="glass-card rounded-xl p-6 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">
              account_balance
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-headline-md mb-8">
              Peta Perjalanan Anggota
            </h3>
            <div className="flex items-center justify-between gap-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-highest -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-tertiary -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>

              {ranks.map((r, idx) => {
                const isActive = idx === currentRankIndex;
                const isPast = idx < currentRankIndex;
                const isFuture = idx > currentRankIndex;
                
                let containerClass = "w-12 h-12 bg-surface-container-highest border-outline";
                if (isActive) containerClass = `w-20 h-20 border-4 ${r.border} ${r.bg} ${r.glow} transform scale-110`;
                else if (isPast) containerClass = `w-14 h-14 ${r.bg} ${r.border} ${r.glow}`;

                let textClass = "text-on-surface-variant";
                if (isActive) textClass = `${r.color} text-label-caps font-black`;
                else if (isPast) textClass = `${r.color} font-bold`;
                
                return (
                  <div key={r.name} className={`group flex flex-col items-center gap-3 relative z-10 transition-all duration-500 cursor-pointer ${isFuture ? 'opacity-40 grayscale' : ''} ${isActive ? '-mt-4' : ''}`}>
                    <div className={`rounded-full flex items-center justify-center border-2 transition-all duration-500 ${containerClass}`}>
                      <span className={`material-symbols-outlined transition-all duration-500 ${isActive || isPast ? r.color : ''} ${isActive ? 'text-4xl' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {r.icon}
                      </span>
                    </div>
                    <span className={`font-label-caps text-[10px] tracking-widest ${textClass}`}>{r.name}</span>
                    
                    <div className="absolute top-full mt-2 w-48 p-3 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 left-1/2 -translate-x-1/2 text-left">
                      <p className="text-xs font-bold mb-1 text-on-surface">Benefit {r.name}:</p>
                      <ul className="text-[10px] space-y-1 text-on-surface-variant list-disc pl-3">
                        <li>Bunga pinjaman -{idx}%</li>
                        <li>Prioritas layanan {r.name}</li>
                        <li>Cashback belanja {idx * 5}%</li>
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
