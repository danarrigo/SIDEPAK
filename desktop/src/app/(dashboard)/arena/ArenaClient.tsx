import { getBattleHistory, getMemberStats } from "@/actions/arena";
import { getMemberInventory } from "@/actions/gamification";
import UseItemClient from "@/components/UseItemClient";
import AutoMatchmake from "@/components/AutoMatchmake";

export default async function ArenaClient({ memberId, initialBattles, myName = "Anda", myKoperasiName, rivalKoperasiName }: { memberId: number, initialBattles: any[], myName?: string, myKoperasiName?: string, rivalKoperasiName?: string }) {
  const { pastBattles } = await getBattleHistory(memberId);
  const battle = initialBattles[0];
  
  const myStats = await getMemberStats(memberId);
  const opStats = battle?.opponent?.id ? await getMemberStats(battle.opponent.id) : { missionsCompleted: 0, totalSavings: 0, savingsPts: 0, activeStreak: 0, eventsJoined: 0, shopPurchases: 0, marketplaceActivity: 0, loansCount: 0, battlesWon: 0 };
  const inventory = await getMemberInventory(memberId);
  
  const p1 = battle ? (battle.challengerId === memberId ? battle.challengerPoints : battle.opponentPoints) : 0;
  const p2 = battle ? (battle.challengerId === memberId ? battle.opponentPoints : battle.challengerPoints) : 0;
  
  const opponent = battle?.opponent;
  const opponentName = opponent?.namaLengkap ? opponent.namaLengkap.split(' ')[0] : "Menunggu Lawan";
  
  const displayMyName = myName.split(' ')[0];
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
    <>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center mb-16 relative z-10 animate-slide-up delay-100 mt-8">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center border-l-4 border-l-primary group transition-all duration-300 hover:translate-y-[-4px]">
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-primary p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center text-4xl font-bold text-primary">
                {displayMyName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{displayMyName}</h3>
          {myKoperasiName && <span className="font-label-caps text-label-caps text-primary mb-1 block text-[10px]">{myKoperasiName}</span>}
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-6">Anda</span>
          <UseItemClient currentMemberId={memberId} targetMemberId={battle?.opponent?.id} inventory={inventory} />
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
          {!battle && <AutoMatchmake memberId={memberId} />}
        </div>

        <div className="glass-card rounded-xl p-8 flex flex-col items-center border-r-4 border-r-tertiary group transition-all duration-300 hover:translate-y-[-4px]">
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-tertiary p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center text-4xl font-bold text-tertiary">
                {opponentName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{opponentName}</h3>
          {rivalKoperasiName && <span className="font-label-caps text-label-caps text-tertiary mb-1 block text-[10px]">{rivalKoperasiName}</span>}
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
            <h3 className="font-headline-md text-headline-md text-on-surface">Detail Pertandingan 1v1</h3>
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
      
      <section className="mb-16 relative z-10 animate-slide-up delay-150">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Pertandingan 1v1</h3>
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
                  const isWinner = b.winnerId === memberId;
                  const op = b.opponent;
                  const myScore = b.challengerId === memberId ? b.challengerPoints : b.opponentPoints;
                  const opScore = b.challengerId === memberId ? b.opponentPoints : b.challengerPoints;
                  return (
                    <tr key={b.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="p-4 pl-8">{new Date(b.endDate).toLocaleDateString("id-ID")}</td>
                      <td className="p-4 font-bold">{op?.namaLengkap || "Lawan"}</td>
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

      {/* Points Guide */}
      <section className="mb-10 animate-fade-in animation-delay-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">help</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-on-surface">Cara Mendapatkan Poin</h2>
            <p className="text-sm text-on-surface-variant">Kumpulkan poin sebanyak-banyaknya untuk memenangkan arena dan tukarkan di Toko Poin!</p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Membayar Iuran</h3>
                <p className="text-sm text-on-surface-variant">Dapatkan poin setiap kali Anda membayar iuran wajib atau pokok tepat waktu.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Menabung</h3>
                <p className="text-sm text-on-surface-variant">Setor simpanan sukarela untuk mendapatkan bonus poin secara berkala.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Transaksi Toko</h3>
                <p className="text-sm text-on-surface-variant">Beli atau jual barang di Toko / Marketplace Koperasi.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Misi Koperasi</h3>
                <p className="text-sm text-on-surface-variant">Selesaikan misi dan dapatkan reward poin melimpah!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
