import { getArenaData, getBattleHistory, getMemberStats } from "@/actions/arena";
import { getCurrentMember } from "@/actions/members";
import { getMemberInventory } from "@/actions/gamification";
import UseItemClient from "@/components/UseItemClient";
import AutoMatchmake from "@/components/AutoMatchmake";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const { activeBattles } = await getArenaData(currentMember.id);
  const { pastBattles } = await getBattleHistory(currentMember.id);
  const battle = activeBattles[0];
  
  const myStats = await getMemberStats(currentMember.id);
  const opStats = battle?.opponent?.id ? await getMemberStats(battle.opponent.id) : { missionsCompleted: 0, totalSavings: 0, savingsPts: 0, activeStreak: 0, eventsJoined: 0, shopPurchases: 0, marketplaceActivity: 0, loansCount: 0, battlesWon: 0 };
  const inventory = await getMemberInventory(currentMember.id);
  
  const p1 = battle ? (battle.challengerId === currentMember.id ? battle.challengerPoints : battle.opponentPoints) : 0;
  const p2 = battle ? (battle.challengerId === currentMember.id ? battle.opponentPoints : battle.challengerPoints) : 0;
  const opponentName = battle?.opponent?.namaLengkap ? battle.opponent.namaLengkap.split(' ')[0] : "Menunggu Lawan";
  const myName = currentMember.namaLengkap.split(' ')[0];
  
  // Normalize to percentage for UI (e.g. max 10000)
  const p1Pct = Math.min(100, Math.floor((p1 / 10000) * 100));
  const p2Pct = Math.min(100, Math.floor((p2 / 10000) * 100));

  const statRows = [
    { label: "Misi Harian", p1: myStats.missionsCompleted, p2: opStats.missionsCompleted },
    { label: "Penyetoran Tabungan", p1: myStats.savingsPts, p2: opStats.savingsPts },
    { label: "Konsistensi Login (Streak)", p1: myStats.activeStreak, p2: opStats.activeStreak },
    { label: "Belanja di Koperasi", p1: myStats.shopPurchases, p2: opStats.shopPurchases },
    { label: "Aktivitas Marketplace", p1: myStats.marketplaceActivity, p2: opStats.marketplaceActivity },
    { label: "Partisipasi Acara", p1: myStats.eventsJoined, p2: opStats.eventsJoined },
    { label: "Peminjaman Dana", p1: myStats.loansCount, p2: opStats.loansCount },
    { label: "Kemenangan Battle", p1: myStats.battlesWon, p2: opStats.battlesWon },
  ].filter(row => row.p1 > 0 || row.p2 > 0);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop View */}
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        <div className="fixed inset-0 pointer-events-none opacity-20"></div>

        <div className="mb-12 text-center relative z-10 animate-slide-up">
          <p className="font-label-caps text-label-caps text-tertiary mb-2 uppercase tracking-widest">Weekly Battle • Arena</p>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Duel Koperasi Pekan Ini</h2>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center mb-16 relative z-10 animate-slide-up delay-100">
          <div className="glass-card rounded-xl p-8 flex flex-col items-center border-l-4 border-l-primary group transition-all duration-300 hover:translate-y-[-4px]">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full border-4 border-primary p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest">
                  <img className="w-full h-full object-cover" alt={myName} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=0D8ABC&color=fff&size=128`}/>
                </div>
              </div>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{myName}</h3>
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-6">Anda</span>
            <UseItemClient currentMemberId={currentMember.id} targetMemberId={battle?.opponent?.id} inventory={inventory} />
            <div className="w-full space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant">Skor Saat Ini</span>
                  <span className="font-points-display text-points-display text-primary">{p1}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p1Pct}%` }} ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center relative shadow-2xl">
              <span className="text-4xl font-black vs-gradient italic">VS</span>
              <div className="absolute -inset-4 border border-tertiary/20 rounded-full animate-pulse"></div>
            </div>
            {!battle && <AutoMatchmake memberId={currentMember.id} />}
          </div>

          <div className="glass-card rounded-xl p-8 flex flex-col items-center border-r-4 border-r-tertiary group transition-all duration-300 hover:translate-y-[-4px]">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full border-4 border-tertiary p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest">
                  <img className="w-full h-full object-cover" alt={opponentName} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(opponentName)}&background=ffd700&color=000&size=128`}/>
                </div>
              </div>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{opponentName}</h3>
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-6">Lawan</span>
            <div className="w-full space-y-6 text-right">
              <div>
                <div className="flex justify-between mb-2 flex-row-reverse">
                  <span className="font-body-md text-body-md text-on-surface-variant">Skor Saat Ini</span>
                  <span className="font-points-display text-points-display text-tertiary">{p2}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex justify-end">
                  <div className="h-full bg-tertiary rounded-full progress-glow" style={{ width: `${p2Pct}%` }} ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 relative z-10 animate-slide-up delay-120">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Detail Pertandingan</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Statistik pertandingan minggu ini.</p>
            </div>
          </div>
          <div className="glass-card rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant w-1/3">Statistik</th>
                  <th className="px-8 py-5 font-label-caps text-label-caps text-primary text-center w-1/3">Anda</th>
                  <th className="px-8 py-5 font-label-caps text-label-caps text-tertiary text-center w-1/3">Lawan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {statRows.length > 0 ? (
                  statRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="px-8 py-4 font-body-lg text-on-surface">{row.label}</td>
                      <td className="px-8 py-4 text-center font-headline-sm text-primary">{row.p1} pts</td>
                      <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{row.p2} pts</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-4 text-center font-body-md text-on-surface-variant italic">Belum ada poin yang dicetak.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16 relative z-10 animate-slide-up delay-135">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Cara Mendapatkan Poin</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Kumpulkan lebih banyak poin dengan aktivitas berikut.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Menabung", desc: "Setor tabungan rutin", icon: "savings" },
              { title: "Belanja", desc: "Beli di koperasi", icon: "shopping_cart" },
              { title: "Acara", desc: "Ikuti kegiatan aktif", icon: "event" },
              { title: "Marketplace", desc: "Jual/beli produk", icon: "storefront" },
              { title: "Misi Harian", desc: "Selesaikan tugas harian", icon: "task_alt" },
              { title: "Konsistensi", desc: "Jaga streak login", icon: "local_fire_department" },
              { title: "Pinjaman", desc: "Gunakan fasilitas pinjaman", icon: "account_balance" },
              { title: "Kemenangan", desc: "Menangkan duel koperasi", icon: "emoji_events" },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{item.title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 relative z-10 animate-slide-up delay-150">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Pertandingan</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Rekam jejak performa dalam arena terakhir.</p>
            </div>
          </div>
          <div className="glass-card rounded-xl overflow-hidden shadow-xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 font-label-caps text-label-caps text-on-surface-variant">
                  <th className="p-4 pl-8">Tanggal</th>
                  <th className="p-4">Lawan</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-8 text-right">Skor Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-md text-on-surface">
                {pastBattles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant italic">Belum ada riwayat pertandingan.</td>
                  </tr>
                ) : (
                  pastBattles.map((b: any) => {
                    const isWinner = b.winnerId === currentMember.id;
                    const opponent = b.opponent;
                    const myScore = b.challengerId === currentMember.id ? b.challengerPoints : b.opponentPoints;
                    const opScore = b.challengerId === currentMember.id ? b.opponentPoints : b.challengerPoints;
                    return (
                      <tr key={b.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="p-4 pl-8">{new Date(b.endDate).toLocaleDateString("id-ID")}</td>
                        <td className="p-4 font-bold">{opponent?.namaLengkap || "Lawan"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            isWinner ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                            {isWinner ? "MENANG" : "KALAH"}
                          </span>
                        </td>
                        <td className="p-4 pr-8 text-right font-points-display font-bold text-primary">{myScore} - {opScore}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-16">
        {/* Top Header Section */}
        <div className="bg-[#121926] pt-12 px-6 pb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-white text-[28px]">bolt</span>
          <div>
            <h1 className="text-white text-2xl font-bold">Arena Bertanding</h1>
            <p className="text-white/60 text-[10px]">Bertanding Mingguan – reset setiap senin 00:00</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 space-y-5">
          {!battle ? (
            /* Empty Battle Card */
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4">
              <span className="material-symbols-outlined text-slate-300 text-[64px]">sports_kabaddi</span>
              <div>
                <h3 className="text-[#334155] text-lg font-bold">Mulai Pertandingan</h3>
                <p className="text-slate-400 text-xs mt-1">Dapatkan poin tambahan dengan memenangkan pertandingan mingguan.</p>
              </div>
              <AutoMatchmake memberId={currentMember.id} />
            </div>
          ) : (
            /* Active Battle Card */
            <div className="bg-[#6D7D91] rounded-[32px] p-5 text-white shadow-md flex flex-col gap-4">
              <h3 className="text-sm font-bold">Battle Minggu Ini</h3>
              <div className="flex justify-between items-center px-2">
                {/* Player Column */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-black text-white">
                    {myName.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-bold text-white/90">{myName}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{p1} XP</span>
                </div>

                <span className="text-amber-400 text-[28px] font-black italic">VS</span>

                {/* Opponent Column */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-black text-white">
                    {opponentName.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-bold text-white/90">{opponentName}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{p2} XP</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center mt-2">
                <UseItemClient currentMemberId={currentMember.id} targetMemberId={battle.opponent?.id} inventory={inventory} />
              </div>

              {/* Stats Comparison Box */}
              <div className="bg-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between text-xs font-bold text-white/90">
                  <span>{p1}</span>
                  <span className="text-white/60">XP Mingguan</span>
                  <span>{p2}</span>
                </div>
                <hr className="border-white/20" />
                <div className="flex justify-between text-xs font-bold text-white/90">
                  <span>{myStats.activeStreak || 1} Hari</span>
                  <span className="text-white/60">Streak Belajar</span>
                  <span>{opStats.activeStreak || 0} Hari</span>
                </div>
              </div>

              <p className="text-center text-white/60 text-[9px] font-bold">
                Berakhir pada: {battle.endDate ? new Date(battle.endDate).toLocaleDateString("id-ID") : "Minggu 23:59"}
              </p>
            </div>
          )}

          {/* Detail Pertandingan (Stats Comparison Table) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Detail Pertandingan</h3>
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
              {statRows.length > 0 ? statRows.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="w-1/3 font-bold text-slate-800 text-left">{item.p1} pts</span>
                  <span className="w-1/3 text-slate-400 text-center font-medium text-[10px]">{item.label}</span>
                  <span className="w-1/3 font-bold text-slate-800 text-right">{item.p2} pts</span>
                </div>
              )) : (
                <div className="text-center text-slate-400 text-xs italic py-2">Belum ada poin yang dicetak.</div>
              )}
            </div>
          </div>

          {/* Cara Mendapatkan Poin Grid */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Cara Mendapatkan Poin</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Menabung", desc: "Setor tabungan", icon: "savings" },
                { title: "Belanja", desc: "Belanja koperasi", icon: "shopping_cart" },
                { title: "Acara", desc: "Ikuti kegiatan", icon: "event" },
                { title: "Marketplace", desc: "Jual/beli produk", icon: "storefront" },
                { title: "Misi Harian", desc: "Selesaikan tugas", icon: "task_alt" },
                { title: "Konsistensi", desc: "Jaga streak login", icon: "local_fire_department" },
                { title: "Pinjaman", desc: "Gunakan pinjaman", icon: "account_balance" },
                { title: "Kemenangan", desc: "Menangkan battle", icon: "emoji_events" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Riwayat Bertanding List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#475569]">Riwayat Bertanding</h3>
            {pastBattles.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 text-center text-slate-400 text-xs font-bold">
                Belum ada riwayat pertandingan.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-[24px] p-4 bg-white shadow-sm space-y-4">
                {pastBattles.map((b: any, index: number) => {
                  const isWin = b.winnerId === currentMember.id;
                  const opponent = b.opponent;
                  const score = b.challengerId === currentMember.id ? b.challengerPoints : b.opponentPoints;
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isWin ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            {isWin ? "MENANG" : "KALAH"}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{opponent?.namaLengkap || "Lawan"}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(b.endDate).toLocaleDateString("id-ID")}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800">+{score} XP</span>
                      </div>
                      {index < pastBattles.length - 1 && <hr className="border-slate-100 mt-4" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}