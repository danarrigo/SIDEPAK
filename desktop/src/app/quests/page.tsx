import { getDashboardData } from "@/actions/dashboard";
import { getActiveQuests } from "@/actions/quests";

export default async function Page() {
  const dbData = await getDashboardData(1);
  const activeQuests = await getActiveQuests(1);

  const xp = dbData?.progress?.xp || 0;
  const level = dbData?.progress?.level || 1;
  const nextLevelXp = level * 1000;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <aside className="col-span-12 lg:col-span-4 space-y-6">
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

        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md">Misi Harian</h3>
            <span className="font-label-caps text-label-caps text-primary">
              Reset dalam 4j 12m
            </span>
          </div>
          <div className="space-y-4">
            {activeQuests.slice(0, 3).map((quest) => {
              const isCompleted = quest.progress?.isCompleted === true;
              return (
                <div
                  key={quest.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${isCompleted ? "bg-surface-container-highest/30 opacity-70" : "bg-surface-container-low hover:border-primary/40 cursor-pointer group"} border border-outline-variant/10 transition-all`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? "bg-primary" : "border-2 border-outline group-hover:border-primary"}`}
                  >
                    <span
                      className={`material-symbols-outlined ${isCompleted ? "text-on-primary" : "text-outline group-hover:text-primary"}`}
                    >
                      {isCompleted ? "check" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-body-lg text-body-lg ${isCompleted ? "line-through" : ""}`}
                    >
                      {quest.title}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {quest.description}
                    </p>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <p className="font-points-display text-points-display text-outline">
                        CLAIMED
                      </p>
                    ) : (
                      <p className="font-points-display text-points-display text-tertiary">
                        +{quest.rewardPoints} XP
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-6 py-3 rounded-lg border border-primary text-primary font-label-caps text-label-caps hover:bg-primary/10 transition-colors uppercase tracking-widest">
            Lihat Misi Mingguan
          </button>
        </section>
      </aside>

      <div className="col-span-12 lg:col-span-8 space-y-8">
        <section className="glass-card rounded-xl p-8 overflow-hidden relative">
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
              <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-gradient-to-r from-primary to-tertiary -translate-y-1/2 z-0"></div>

              <div className="flex flex-col items-center gap-3 relative z-10 opacity-60">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-outline">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <span className="font-label-caps text-[10px]">BRONZE</span>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary shadow-[0_0_15px_rgba(193,198,219,0.3)]">
                  <span className="material-symbols-outlined text-primary">
                    military_tech
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-primary">
                  SILVER
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 relative z-10 -mt-4">
                <div className="w-20 h-20 rounded-full bg-tertiary/20 flex items-center justify-center border-4 border-tertiary gold-glow transform scale-110">
                  <span
                    className="material-symbols-outlined text-tertiary text-4xl"
                    style={{ fontVariationSettings: "\'FILL\' 1" }}
                  >
                    crown
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-tertiary">
                  GOLD
                </span>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 opacity-40">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-outline-variant">
                  <span className="material-symbols-outlined">diamond</span>
                </div>
                <span className="font-label-caps text-[10px]">PLATINUM</span>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 opacity-20 grayscale">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-outline-variant">
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                </div>
                <span className="font-label-caps text-[10px]">LEGEND</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline-lg text-headline-lg">Toko Item</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tukarkan poin prestasi Anda dengan item langka
              </p>
            </div>
            <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-lg border border-tertiary/30">
              <span
                className="material-symbols-outlined text-tertiary"
                style={{ fontVariationSettings: "\'FILL\' 1" }}
              >
                monetization_on
              </span>
              <span className="font-points-display text-lg text-tertiary">
                12,850 Poin
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-5 group hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="w-full aspect-square rounded-lg bg-surface-container-highest flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <span className="material-symbols-outlined text-5xl text-primary group-hover:scale-110 transition-transform">
                  ac_unit
                </span>
              </div>
              <h4 className="font-body-lg text-body-lg mb-1">Freeze Streak</h4>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4 line-clamp-2">
                Jaga streak Anda tetap aktif meskipun tidak masuk selama 24 jam.
              </p>
              <button className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors rounded-lg flex items-center justify-center gap-2">
                <span className="font-points-display">500</span>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "\'FILL\' 1" }}
                >
                  monetization_on
                </span>
              </button>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="w-full aspect-square rounded-lg bg-surface-container-highest flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent"></div>
                <span className="material-symbols-outlined text-5xl text-tertiary group-hover:scale-110 transition-transform">
                  bomb
                </span>
              </div>
              <h4 className="font-body-lg text-body-lg mb-1">Point Bomb</h4>
              <h4 className="font-body-lg text-body-lg mb-1">Point Bomb</h4>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4 line-clamp-2">
                Gandakan perolehan poin dari semua misi selama 1 jam kedepan.
              </p>
              <button className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors rounded-lg flex items-center justify-center gap-2">
                <span className="font-points-display">1,200</span>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "\'FILL\' 1" }}
                >
                  monetization_on
                </span>
              </button>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="w-full aspect-square rounded-lg bg-surface-container-highest flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent"></div>
                <span className="material-symbols-outlined text-5xl text-secondary group-hover:scale-110 transition-transform">
                  shield
                </span>
              </div>
              <h4 className="font-body-lg text-body-lg mb-1">Loan Shield</h4>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4 line-clamp-2">
                Perlindungan denda keterlambatan untuk pinjaman aktif selama 3
                hari.
              </p>
              <button className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors rounded-lg flex items-center justify-center gap-2">
                <span className="font-points-display">2,500</span>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "\'FILL\' 1" }}
                >
                  monetization_on
                </span>
              </button>
            </div>

            <div className="glass-card rounded-xl p-5 group hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="w-full aspect-square rounded-lg bg-surface-container-highest flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-error/10 to-transparent"></div>
                <span className="material-symbols-outlined text-5xl text-error group-hover:scale-110 transition-transform">
                  mystery
                </span>
              </div>
              <h4 className="font-body-lg text-body-lg mb-1">Mystery Box</h4>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4 line-clamp-2">
                Kesempatan mendapatkan kupon belanja hingga Rp 100.000!
              </p>
              <button className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors rounded-lg flex items-center justify-center gap-2">
                <span className="font-points-display">800</span>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "\'FILL\' 1" }}
                >
                  monetization_on
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
