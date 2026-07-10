import { getDashboardData } from "@/actions/dashboard";
import { getActiveQuests } from "@/actions/quests";
import { getCurrentMember } from "@/actions/members";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { items } from "@/db/schema/gamification";
import { quests } from "@/db/schema/achievements";
import MissionList from "@/components/MissionList";
import { calculateMembershipScore, getRankBenefits } from "@/actions/rank";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const dbData = await getDashboardData(currentMember.id);
  const activeQuests = await getActiveQuests(currentMember.id);
  
  const xp = dbData?.progress?.xp || 0;
  const points = dbData?.progress?.pointsBalance || 0;
  const level = dbData?.progress?.level || 1;
  const creditScore = dbData?.progress?.creditScore || 700;
  const walletBalance = dbData?.progress?.walletBalance || 0;
  const nextLevelXp = level * 1000;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);

  const membershipScore = calculateMembershipScore(level, walletBalance, creditScore);
  
  let currentRankIndex = 0;
  if (membershipScore >= 2500 && membershipScore < 5000) currentRankIndex = 1;
  else if (membershipScore >= 5000 && membershipScore < 10000) currentRankIndex = 2;
  else if (membershipScore >= 10000 && membershipScore < 25000) currentRankIndex = 3;
  else if (membershipScore >= 25000) currentRankIndex = 4;

  const ranks = [
    { name: "Perunggu", icon: "eco", color: "text-amber-700", bg: "bg-amber-700/20", border: "border-amber-700", glow: "shadow-[0_0_15px_rgba(180,83,9,0.3)]", scoreThreshold: 0, nextThreshold: 2500 },
    { name: "Perak", icon: "military_tech", color: "text-slate-400", bg: "bg-slate-400/20", border: "border-slate-400", glow: "shadow-[0_0_15px_rgba(148,163,184,0.3)]", scoreThreshold: 2500, nextThreshold: 5000 },
    { name: "Emas", icon: "crown", color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400", glow: "shadow-[0_0_15px_rgba(250,204,21,0.4)]", scoreThreshold: 5000, nextThreshold: 10000 },
    { name: "Platinum", icon: "diamond", color: "text-cyan-400", bg: "bg-cyan-400/20", border: "border-cyan-400", glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]", scoreThreshold: 10000, nextThreshold: 25000 },
    { name: "Legenda", icon: "auto_awesome", color: "text-purple-500", bg: "bg-purple-500/20", border: "border-purple-500", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]", scoreThreshold: 25000, nextThreshold: 25000 }
  ];
  
  // Base width per rank is 25% (4 gaps between 5 ranks). Add a bit of progress based on score.
  let extraProgress = 0;
  if (currentRankIndex < 4) {
    const curThresh = ranks[currentRankIndex].scoreThreshold;
    const nextThresh = ranks[currentRankIndex].nextThreshold;
    extraProgress = (membershipScore - curThresh) / (nextThresh - curThresh);
  }
  const progressPercent = Math.min(100, (currentRankIndex * 25) + (extraProgress * 25));

  // Daily Reset countdown text
  const now = new Date();
  const dailyHours = 23 - now.getHours();
  const dailyMinutes = 59 - now.getMinutes();
  const dailyResetText = `Reset ${dailyHours}j ${dailyMinutes}m`;

  // Weekly Reset countdown text (count down to Monday 00:00)
  const daysUntilMonday = (8 - now.getDay()) % 7;
  const weeklyDays = daysUntilMonday === 0 ? 7 : daysUntilMonday;
  const weeklyHours = 23 - now.getHours();
  const weeklyMinutes = 59 - now.getMinutes();
  const weeklyResetText = `Reset ${weeklyDays - 1}h ${weeklyHours}j ${weeklyMinutes}m`;

  const lastActivityDateStr = dbData?.progress?.lastActivityDate;
  const lastActivity = lastActivityDateStr ? new Date(lastActivityDateStr) : new Date();
  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeklyStreakDays: Record<string, boolean> = {
    'Sen': false, 'Sel': false, 'Rab': false, 'Kam': false, 'Jum': false, 'Sab': false, 'Min': false
  };
  const effectiveStreak = Math.min(7, Math.max(1, dbData?.progress?.currentStreak ?? 1));
  for (let i = 0; i < effectiveStreak; i++) {
    const day = new Date(lastActivity);
    day.setDate(lastActivity.getDate() - i);
    const idx = (day.getDay() + 6) % 7;
    if (idx >= 0 && idx < 7) {
      weeklyStreakDays[dayLabels[idx]] = true;
    }
  }

  // Today's label for highlighting streak day
  const todayLabel = dayLabels[(now.getDay() + 6) % 7];

  // Chest Milestones (5 chests, 6 missions each)
  const completedMissionsCount = activeQuests.filter((q: any) => q.isCompleted).length;
  const chestMilestones = [6, 12, 18, 24, 30];
  const maxMissions = 30;
  const chestPercent = Math.min(100, (completedMissionsCount / maxMissions) * 100);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-10 w-full">
        <aside className="col-span-12 xl:col-span-4 space-y-6 animate-slide-up">
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-headline-md">Streak Mingguan</h3>
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                <span>{effectiveStreak} Hari</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">Pertahankan streak login Anda untuk mendapatkan bonus hadiah di akhir minggu!</p>
            <div className="flex justify-between items-center gap-2">
              {dayLabels.map((day) => {
                const done = weeklyStreakDays[day];
                const isToday = day === todayLabel;
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                      isToday ? 'bg-primary border-primary text-on-primary' : done ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant'
                    }`}>
                      {isToday ? (
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      ) : done ? (
                        <span className="material-symbols-outlined text-xl font-bold">check</span>
                      ) : null}
                    </div>
                    <span className={`text-[10px] font-bold ${done || isToday ? 'text-on-surface' : 'text-on-surface-variant'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Missions */}
          <section className="glass-card rounded-xl p-6 flex flex-col h-fit animate-slide-up delay-150">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md">Misi Harian</h3>
              <div className="bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-500/30">
                <span className="material-symbols-outlined text-amber-500 text-[14px]">refresh</span>
                <span className="text-amber-500 text-xs font-bold">{dailyResetText}</span>
              </div>
            </div>
            <div className="space-y-4">
              <MissionList initialQuests={activeQuests} memberId={currentMember.id} />
            </div>
          </section>
        </aside>

        <div className="col-span-12 xl:col-span-8 space-y-6 animate-slide-up delay-200">
          <section className="glass-card rounded-xl p-6 relative">
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]">
                  account_balance
                </span>
              </div>
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
                  const benefits = getRankBenefits(r.name);
                  
                  let containerClass = "w-12 h-12 bg-surface-container-highest border-outline";
                  if (isActive) containerClass = `w-20 h-20 border-4 ${r.border} ${r.bg} ${r.glow} transform scale-110`;
                  else if (isPast) containerClass = `w-14 h-14 ${r.bg} ${r.border} ${r.glow}`;

                  let textClass = "text-on-surface-variant";
                  if (isActive) textClass = `${r.color} text-label-caps font-black`;
                  else if (isPast) textClass = `${r.color} font-bold`;
                  
                  return (
                    <div key={r.name} className={`group flex flex-col items-center gap-3 relative z-10 hover:z-[100] transition-all duration-500 cursor-pointer ${isFuture ? 'opacity-40 grayscale' : ''} ${isActive ? '-mt-4' : ''}`}>
                      <div className={`rounded-full flex items-center justify-center border-2 transition-all duration-500 ${containerClass}`}>
                        <span className={`material-symbols-outlined transition-all duration-500 ${isActive || isPast ? r.color : ''} ${isActive ? 'text-4xl' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {r.icon}
                        </span>
                      </div>
                      <span className={`font-label-caps text-[10px] tracking-widest ${textClass}`}>{r.name.toUpperCase()}</span>
                      
                      {/* Tooltip */}
                      <div className={`absolute top-full mt-2 w-48 p-3 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left ${
                        idx === 0 ? 'left-0' : idx === ranks.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      }`}>
                        <p className="text-xs font-bold mb-1 text-on-surface">Benefit {r.name}:</p>
                        <ul className="text-[10px] space-y-1 text-on-surface-variant list-disc pl-3">
                          <li>Bobot SHU {benefits.shuMultiplier}x</li>
                          <li>Biaya layanan {benefits.serviceFee}%</li>
                          <li>Prioritas layanan {r.name}</li>
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Weekly Missions */}
          <section className="glass-card rounded-xl p-6 flex flex-col h-fit animate-slide-up delay-400">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md">Misi Mingguan</h3>
              <div className="bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-500/30">
                <span className="material-symbols-outlined text-amber-500 text-[14px]">event</span>
                <span className="text-amber-500 text-xs font-bold">{weeklyResetText}</span>
              </div>
            </div>
            <div className="space-y-4">
              <MissionList initialQuests={activeQuests} memberId={currentMember.id} frequency="weekly" />
            </div>
          </section>

          {/* Reward Chest Milestones */}
          <section className="glass-card rounded-xl p-6 relative overflow-hidden animate-slide-up delay-500 mt-auto">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 mb-8">
              <h3 className="font-headline-sm text-headline-sm mb-1">Peti Harta Mingguan</h3>
              <p className="text-on-surface-variant text-sm">
                Selesaikan misi untuk membuka hingga 5 peti harta! ({completedMissionsCount} misi selesai)
              </p>
            </div>
            
            <div className="relative pt-4 pb-2 px-2 z-10">
              {/* Progress Bar Background */}
              <div className="absolute left-6 right-6 top-9 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${chestPercent}%` }}></div>
              </div>
              
              {/* 5 Chests */}
              <div className="relative flex justify-between">
                {chestMilestones.map((target, index) => {
                  const isUnlocked = completedMissionsCount >= target;
                  return (
                    <div key={target} className="flex flex-col items-center relative z-10 group cursor-pointer">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isUnlocked ? 'bg-amber-100 border-amber-500 text-amber-500 gold-glow transform scale-110' : 'bg-surface-container-low border-outline-variant text-outline-variant'}`}>
                        <span className="material-symbols-outlined text-[24px]" style={isUnlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {isUnlocked ? 'redeem' : 'lock'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold mt-3 ${isUnlocked ? 'text-amber-600' : 'text-on-surface-variant'}`}>{target} Misi</span>
                      
                      {/* Tooltip */}
                      <div className={`absolute bottom-full mb-2 w-32 p-2 bg-surface-container-highest border border-outline-variant/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center left-1/2 -translate-x-1/2`}>
                        <p className="text-xs font-bold text-on-surface mb-0.5">Peti Tier {index + 1}</p>
                        <p className="text-[9px] text-on-surface-variant">{isUnlocked ? 'Telah Terbuka!' : `Selesaikan ${target - completedMissionsCount > 0 ? target - completedMissionsCount : 0} misi lagi`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-16">
        {/* Top Header Section */}
        <div className="bg-[#131926] pt-12 px-6 pb-10 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="text-left flex-1">
              <span className="bg-[#FCD34D] text-[#78350F] text-xs font-bold px-4 py-1.5 rounded-full inline-block mb-3">
                Rank: {ranks[currentRankIndex].name}
              </span>
              <p className="text-[#94A3B8] text-[10px] font-medium">
                {xp} / {nextLevelXp} XP menuju {currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1].name : 'Legend'}
              </p>
              <div className="w-44 h-1.5 bg-[#334155] rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#FCD34D]" style={{ width: `${Math.min(100, (xp / nextLevelXp) * 100)}%` }}></div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-white/60 text-[8px] font-bold block uppercase tracking-wider">LEVEL</span>
              <span className="text-white text-3xl font-black">{level}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 space-y-4">
          {/* Weekly Streak Card */}
          <div className="-mt-8 bg-[#1E293B] rounded-[24px] p-5 text-white flex flex-col gap-4">
            <h3 className="text-sm font-bold">Streak Mingguan</h3>
            <div className="flex justify-between items-center gap-2">
              {dayLabels.map((day) => {
                const done = weeklyStreakDays[day];
                const isToday = day === todayLabel;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${
                      isToday ? 'bg-[#84CC16] border-[#84CC16]' : done ? 'bg-[#4D7C0F]/50 border-[#84CC16]' : 'bg-transparent border-[#475569]'
                    }`}>
                      {isToday ? (
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      ) : done ? (
                        <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                      ) : null}
                    </div>
                    <span className={`text-[9px] font-bold ${done || isToday ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[#94A3B8] text-[10px]">Pertahankan Streak! Bonus +50 poin di akhir minggu</p>
          </div>

          {/* Daily Missions */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-[#334155]">Misi Harian</h3>
              <div className="bg-[#FACC15]/15 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[#B45309] text-[10px]">refresh</span>
                <span className="text-[#B45309] text-[9px] font-bold">{dailyResetText}</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
              <MissionList initialQuests={activeQuests} memberId={currentMember.id} />
            </div>
          </div>

          {/* Weekly Missions */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-[#334155]">Misi Mingguan</h3>
              <div className="bg-[#FACC15]/15 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[#B45309] text-[10px]">refresh</span>
                <span className="text-[#B45309] text-[9px] font-bold">{weeklyResetText}</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
              <MissionList initialQuests={activeQuests} memberId={currentMember.id} frequency="weekly" />
            </div>
          </div>

          {/* Reward Chest Milestones (Mobile) */}
          <div className="space-y-2.5 pb-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-[#334155]">Peti Harta Mingguan</h3>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex flex-col items-center">
              <p className="text-[11px] text-slate-500 mb-6 text-center font-medium">
                Selesaikan misi untuk membuka hingga 5 peti harta! ({completedMissionsCount} misi selesai)
              </p>
              
              <div className="relative w-full px-2 pb-2">
                {/* Progress Bar Background */}
                <div className="absolute left-4 right-4 top-[14px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000" style={{ width: `${chestPercent}%` }}></div>
                </div>
                
                {/* 5 Chests */}
                <div className="relative flex justify-between">
                  {chestMilestones.map((target, index) => {
                    const isUnlocked = completedMissionsCount >= target;
                    return (
                      <div key={target} className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center border-2 transition-all duration-500 ${isUnlocked ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#F59E0B]' : 'bg-white border-slate-200 text-slate-300'}`}>
                          <span className="material-symbols-outlined text-[16px]" style={isUnlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {isUnlocked ? 'redeem' : 'lock'}
                          </span>
                        </div>
                        <span className={`text-[8px] font-bold mt-1.5 ${isUnlocked ? 'text-[#D97706]' : 'text-slate-400'}`}>{target}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
