import { getCurrentMember } from "@/actions/members";
import { getCurrentSeason, getLeagueLeaderboard } from "@/actions/league";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const activeSeason = await getCurrentSeason();
  const leaderboard = activeSeason ? await getLeagueLeaderboard(activeSeason.id) : [];

  const myCooperativeId = currentMember.cooperativeId;
  const myKoperasiScore = leaderboard.find(l => l.koperasiId === myCooperativeId);
  const myRank = leaderboard.findIndex(l => l.koperasiId === myCooperativeId) + 1;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        <div className="mb-12 text-center animate-slide-up">
          <p className="font-label-caps text-label-caps text-tertiary mb-2 uppercase tracking-widest">
            {activeSeason ? activeSeason.name : "Tidak ada musim aktif"}
          </p>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Liga Koperasi Nasional</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Kumpulkan XP bersama anggota Koperasi Anda untuk menduduki peringkat teratas dan memenangkan hadiah akhir musim!
          </p>
        </div>

        {activeSeason && (
          <section className="glass-card rounded-xl p-8 mb-12 flex justify-between items-center bg-primary/10 border-primary/20">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-1">Status Koperasi Anda</h3>
              <p className="text-on-surface-variant text-sm">
                Koperasi {myKoperasiScore?.koperasiName || "Anda"} • Peringkat {myRank > 0 ? `#${myRank}` : "Belum Masuk"}
              </p>
            </div>
            <div className="text-right">
              <span className="font-points-display text-points-display text-primary block">
                {myKoperasiScore?.totalXp || 0} XP
              </span>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total XP Musim Ini</span>
            </div>
          </section>
        )}

        <section className="glass-card rounded-xl overflow-hidden animate-slide-up delay-100">
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Papan Peringkat (Top 50)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest text-on-surface-variant text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b border-outline-variant text-center w-16">Rank</th>
                  <th className="p-4 font-medium border-b border-outline-variant">Nama Koperasi</th>
                  <th className="p-4 font-medium border-b border-outline-variant text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-on-surface-variant italic">
                      Belum ada data skor di musim ini.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item, idx) => {
                    const isMine = item.koperasiId === myCooperativeId;
                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors hover:bg-surface-container-highest/50 ${isMine ? 'bg-primary/5' : ''}`}
                      >
                        <td className="p-4 text-center font-bold text-on-surface-variant">
                          {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : idx + 1}
                        </td>
                        <td className={`p-4 font-medium ${isMine ? 'text-primary' : 'text-on-surface'}`}>
                          {item.koperasiName}
                          {isMine && <span className="ml-2 text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full">Koperasi Anda</span>}
                        </td>
                        <td className="p-4 text-right font-bold text-tertiary">
                          {item.totalXp.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Mobile View Placeholder */}
      <div className="md:hidden flex-1 overflow-y-auto pb-32 w-full p-4 space-y-6">
        <div className="text-center mt-4">
          <p className="text-xs text-tertiary uppercase font-bold tracking-wider mb-1">
            {activeSeason ? activeSeason.name : "Tidak ada musim aktif"}
          </p>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Liga Koperasi</h2>
        </div>
        
        {activeSeason && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-primary font-bold text-sm">Status Koperasi Anda</p>
              <p className="text-on-surface-variant text-xs">Peringkat {myRank > 0 ? `#${myRank}` : "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-primary font-black text-xl">{myKoperasiScore?.totalXp || 0}</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">Total XP</p>
            </div>
          </div>
        )}

        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-outline-variant">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-bold text-sm text-on-surface">Top 50 Koperasi Nasional</h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-sm italic">
                Belum ada data skor di musim ini.
              </div>
            ) : (
              leaderboard.map((item, idx) => {
                const isMine = item.koperasiId === myCooperativeId;
                return (
                  <div key={item.id} className={`flex items-center p-4 ${isMine ? 'bg-primary/10' : ''}`}>
                    <div className="w-8 text-center font-bold text-on-surface-variant text-sm">
                      {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : idx + 1}
                    </div>
                    <div className="flex-1 ml-3">
                      <p className={`font-bold text-sm ${isMine ? 'text-primary' : 'text-on-surface'}`}>
                        {item.koperasiName}
                      </p>
                      {isMine && <p className="text-[10px] text-primary">Koperasi Anda</p>}
                    </div>
                    <div className="text-right font-black text-tertiary text-sm">
                      {item.totalXp.toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}