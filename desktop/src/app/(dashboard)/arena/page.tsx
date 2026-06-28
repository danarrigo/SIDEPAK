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
  const opStats = battle?.opponent?.id ? await getMemberStats(battle.opponent.id) : { missionsCompleted: 0, totalSavings: 0, activeStreak: 0, eventsJoined: 0, shopPurchases: 0, marketplaceActivity: 0, loansCount: 0, battlesWon: 0 };
  const inventory = await getMemberInventory(currentMember.id);
  
  const p1 = battle ? (battle.challengerId === currentMember.id ? battle.challengerPoints : battle.opponentPoints) : 0;
  const p2 = battle ? (battle.challengerId === currentMember.id ? battle.opponentPoints : battle.challengerPoints) : 0;
  const opponentName = battle?.opponent?.namaLengkap ? battle.opponent.namaLengkap.split(' ')[0] : "Menunggu Lawan";
  const myName = currentMember.namaLengkap.split(' ')[0];
  
  // Normalize to percentage for UI (e.g. max 10000)
  const p1Pct = Math.min(100, Math.floor((p1 / 10000) * 100));
  const p2Pct = Math.min(100, Math.floor((p2 / 10000) * 100));

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
      
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

        <section className="mb-16 relative z-10 animate-slide-up delay-150">
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
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Misi Diselesaikan</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.missionsCompleted}</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.missionsCompleted}</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Total Tabungan (Rp)</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.totalSavings.toLocaleString('id-ID')}</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.totalSavings.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Streak Login Aktif</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.activeStreak} Hari</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.activeStreak} Hari</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Belanja di Koperasi</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.shopPurchases}x</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.shopPurchases}x</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Aktivitas Marketplace</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.marketplaceActivity}x</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.marketplaceActivity}x</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Partisipasi Acara</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.eventsJoined}x</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.eventsJoined}x</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Peminjaman Dana</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.loansCount}x</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.loansCount}x</td>
                </tr>
                <tr className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-8 py-4 font-body-lg text-on-surface">Kemenangan Battle</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-primary">{myStats.battlesWon}x</td>
                  <td className="px-8 py-4 text-center font-headline-sm text-tertiary">{opStats.battlesWon}x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16 relative z-10 animate-slide-up delay-[175ms]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Cara Mendapatkan Poin</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Tingkatkan skor Anda dengan melakukan aktivitas berikut.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Menabung", desc: "Melakukan penyetoran tabungan koperasi", icon: "savings" },
              { title: "Belanja Koperasi", desc: "Melakukan pembelian barang di koperasi", icon: "shopping_cart" },
              { title: "Partisipasi Acara", desc: "Mengikuti acara atau kegiatan koperasi", icon: "event" },
              { title: "Marketplace", desc: "Berjualan atau membeli dari sesama anggota", icon: "storefront" },
              { title: "Misi Harian", desc: "Menyelesaikan tugas dan misi harian", icon: "task_alt" },
              { title: "Konsistensi", desc: "Mempertahankan rentetan kehadiran (streak)", icon: "local_fire_department" },
              { title: "Pinjaman", desc: "Mengajukan peminjaman dana produktif", icon: "account_balance" },
              { title: "Kemenangan", desc: "Memenangkan pertandingan mingguan di Arena", icon: "emoji_events" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 rounded-xl flex items-start gap-4 hover:bg-surface-container-high/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant capitalize-first">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 animate-slide-up delay-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Riwayat Pertandingan</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Rekam jejak performa dalam arena terakhir.</p>
            </div>
          </div>
          <div className="glass-card rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant">Tanggal</th>
                  <th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant">Lawan</th>
                  <th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant text-center">Status</th>
                  <th className="px-8 py-5 font-label-caps text-label-caps text-on-surface-variant text-right">Skor Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {pastBattles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-8 text-center text-on-surface-variant">Belum ada riwayat pertandingan.</td>
                  </tr>
                )}
                {pastBattles.map(pastBattle => {
                  const isWinner = pastBattle.winnerId === currentMember.id;
                  const opName = pastBattle?.opponent?.namaLengkap || "Unknown";
                  const myScore = pastBattle.challengerId === currentMember.id ? pastBattle.challengerPoints : pastBattle.opponentPoints;
                  const opScore = pastBattle.challengerId === currentMember.id ? pastBattle.opponentPoints : pastBattle.challengerPoints;
                  const score = `${myScore} - ${opScore}`;
                  
                  return (
                    <tr key={pastBattle.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="px-8 py-4">
                        <span className="font-body-lg text-body-lg text-on-surface">{new Date(pastBattle.endDate).toLocaleDateString('id-ID')}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-secondary/20">
                            <img className="w-full h-full object-cover" alt={opName} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(opName)}&background=888&color=fff&size=64`}/>
                          </div>
                          <span className="font-body-md text-body-md text-on-surface">{opName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${isWinner ? "bg-green-900/30 text-green-400 border-green-500/30" : "bg-red-900/30 text-red-400 border-red-500/30"}`}>
                          {isWinner ? "MENANG" : "KALAH"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="font-points-display text-points-display text-tertiary">{score}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}