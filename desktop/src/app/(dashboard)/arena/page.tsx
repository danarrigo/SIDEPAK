import { getCurrentMember } from "@/actions/members";
import { getCurrentSeason, getLeagueLeaderboard } from "@/actions/league";
import { getArenaData } from "@/actions/arena";
import { redirect } from "next/navigation";
import ArenaClient from "./ArenaClient";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const activeSeason = await getCurrentSeason();
  const leaderboard = activeSeason ? await getLeagueLeaderboard(activeSeason.id) : [];
  
  const { activeBattles, currentMatch, rivalCooperative } = await getArenaData(currentMember.id);

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
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Guild Wars (Koperasi vs Koperasi)</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Bantu Koperasi Anda memenangkan pertempuran mingguan dengan mengalahkan anggota koperasi rival di pertandingan 1v1!
          </p>
        </div>

        {activeSeason && currentMatch && rivalCooperative ? (
          <section className="glass-card rounded-xl p-8 mb-8 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-tertiary/10 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 uppercase tracking-widest text-center w-full">
              Minggu Ini: Pertempuran Koperasi
            </h3>
            
            <div className="flex items-center justify-center w-full max-w-3xl gap-8">
              {/* Koperasi Sendiri */}
              <div className="flex-1 text-center bg-surface-container rounded-2xl p-6 border-b-4 border-primary">
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Koperasi Anda</p>
                <h4 className="font-headline-sm text-on-surface line-clamp-1">{myKoperasiScore?.koperasiName}</h4>
                <div className="text-6xl font-black text-primary mt-4">
                  {currentMatch.isCoopA ? currentMatch.scoreA : currentMatch.scoreB}
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Kemenangan 1v1</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-outline-variant italic">VS</span>
              </div>

              {/* Koperasi Lawan */}
              <div className="flex-1 text-center bg-surface-container rounded-2xl p-6 border-b-4 border-error">
                <p className="text-xs text-error font-bold uppercase tracking-wider mb-2">Koperasi Rival</p>
                <h4 className="font-headline-sm text-on-surface line-clamp-1">{rivalCooperative.name}</h4>
                <div className="text-6xl font-black text-error mt-4">
                  {!currentMatch.isCoopA ? currentMatch.scoreA : currentMatch.scoreB}
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Kemenangan 1v1</p>
              </div>
            </div>
            
            <p className="text-sm text-on-surface-variant mt-8 bg-surface-container-low px-4 py-2 rounded-full">
              Tenggat Waktu: {new Date(currentMatch.endDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        ) : activeSeason && !currentMatch ? (
          <section className="glass-card rounded-xl p-8 mb-8 text-center bg-surface-container border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Belum Ada Jadwal</h3>
            <p className="text-on-surface-variant">Koperasi Anda belum mendapatkan jadwal Guild War untuk minggu ini.</p>
          </section>
        ) : null}

        {/* 1v1 Arena Client for Battles */}
        <ArenaClient memberId={currentMember.id} initialBattles={activeBattles} />

        <section className="glass-card rounded-xl overflow-hidden animate-slide-up delay-100 mt-12">
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Papan Peringkat Liga Nasional</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest text-on-surface-variant text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b border-outline-variant text-center w-16">Rank</th>
                  <th className="p-4 font-medium border-b border-outline-variant">Nama Koperasi</th>
                  <th className="p-4 font-medium border-b border-outline-variant text-center">Menang</th>
                  <th className="p-4 font-medium border-b border-outline-variant text-center">Seri</th>
                  <th className="p-4 font-medium border-b border-outline-variant text-center">Kalah</th>
                  <th className="p-4 font-medium border-b border-outline-variant text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">
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
                          {isMine && <span className="ml-2 text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Koperasi Anda</span>}
                        </td>
                        <td className="p-4 text-center font-bold text-primary">{item.totalWins}</td>
                        <td className="p-4 text-center font-bold text-on-surface-variant">{item.totalDraws}</td>
                        <td className="p-4 text-center font-bold text-error">{item.totalLosses}</td>
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

      {/* Mobile View */}
      <div className="md:hidden flex-1 overflow-y-auto pb-32 w-full p-4 space-y-6">
        <div className="text-center mt-4">
          <p className="text-xs text-tertiary uppercase font-bold tracking-wider mb-1">
            {activeSeason ? activeSeason.name : "Tidak ada musim aktif"}
          </p>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Guild Wars</h2>
        </div>
        
        {activeSeason && currentMatch && rivalCooperative && (
          <div className="bg-gradient-to-br from-primary/10 to-tertiary/10 border border-primary/20 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
            <p className="text-center text-xs font-bold text-on-surface uppercase tracking-widest">Minggu Ini vs Rival</p>
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-[10px] text-primary uppercase font-bold mb-1">Anda</p>
                <p className="font-black text-3xl text-primary">{currentMatch.isCoopA ? currentMatch.scoreA : currentMatch.scoreB}</p>
              </div>
              <div className="text-outline-variant font-black italic">VS</div>
              <div className="text-center flex-1">
                <p className="text-[10px] text-error uppercase font-bold mb-1">Rival</p>
                <p className="font-black text-3xl text-error">{!currentMatch.isCoopA ? currentMatch.scoreA : currentMatch.scoreB}</p>
              </div>
            </div>
            <p className="text-center text-xs text-on-surface-variant font-medium mt-1">{rivalCooperative.name}</p>
          </div>
        )}

        {/* 1v1 Arena Client for Battles */}
        <ArenaClient memberId={currentMember.id} initialBattles={activeBattles} />

        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-outline-variant mt-8">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-bold text-sm text-on-surface">Klasemen Liga (Top 50)</h3>
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
                    <div className="w-6 text-center font-bold text-on-surface-variant text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 ml-3">
                      <p className={`font-bold text-sm ${isMine ? 'text-primary' : 'text-on-surface'} line-clamp-1`}>
                        {item.koperasiName}
                      </p>
                      <div className="flex gap-2 text-[10px] mt-1">
                        <span className="text-primary font-bold">{item.totalWins} W</span>
                        <span className="text-on-surface-variant font-bold">{item.totalDraws} D</span>
                        <span className="text-error font-bold">{item.totalLosses} L</span>
                      </div>
                    </div>
                    <div className="text-right font-black text-tertiary text-xs">
                      {item.totalXp.toLocaleString()} XP
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