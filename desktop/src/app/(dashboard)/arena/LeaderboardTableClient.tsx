"use client";
import React, { useState } from "react";

export default function LeaderboardTableClient({ 
  leaderboard, 
  myCooperativeId 
}: { 
  leaderboard: any[];
  myCooperativeId: number | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // MOCK DATA: Menambahkan data buatan agar fitur "Lihat Semua" (expand/collapse) bisa terlihat meskipun di database baru ada 1 Koperasi.
  const displayLeaderboard = leaderboard.length <= 3 ? [
    ...leaderboard,
    ...Array.from({ length: 15 }).map((_, i) => ({
      id: 9990 + i,
      koperasiId: 9990 + i,
      koperasiName: `Koperasi Makmur Desa ${i + 1}`,
      totalWins: Math.floor(Math.random() * 10),
      totalDraws: Math.floor(Math.random() * 3),
      totalLosses: Math.floor(Math.random() * 5),
      totalPoints: Math.floor(Math.random() * 500) + 100,
    })).sort((a, b) => b.totalWins - a.totalWins || b.totalPoints - a.totalPoints)
  ] : leaderboard;

  const displayData = isExpanded ? displayLeaderboard : displayLeaderboard.slice(0, 5);
  const hasMore = displayLeaderboard.length > 5;

  return (
    <section className="glass-card rounded-xl overflow-hidden animate-slide-up delay-100 mt-12">
      <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center cursor-pointer hover:bg-surface-container-low/80 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Papan Peringkat Liga Nasional</h3>
        {hasMore && (
          <button className="text-sm font-bold text-primary flex items-center gap-1">
            {isExpanded ? (
              <>Tutup <span className="material-symbols-outlined text-sm">expand_less</span></>
            ) : (
              <>Lihat Semua <span className="material-symbols-outlined text-sm">expand_more</span></>
            )}
          </button>
        )}
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-on-surface-variant text-sm uppercase tracking-wider">
                <th className="p-4 font-medium border-b border-outline-variant text-center w-16">Rank</th>
                <th className="p-4 font-medium border-b border-outline-variant">Nama Koperasi</th>
                <th className="p-4 font-medium border-b border-outline-variant text-center">Menang</th>
                <th className="p-4 font-medium border-b border-outline-variant text-center">Seri</th>
                <th className="p-4 font-medium border-b border-outline-variant text-center">Kalah</th>
                <th className="p-4 font-medium border-b border-outline-variant text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">
                    Belum ada data skor di musim ini.
                  </td>
                </tr>
              ) : (
                displayData.map((item, idx) => {
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
                        {item.totalPoints.toLocaleString()} Poin
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!isExpanded && hasMore && (
        <div 
          className="w-full text-center p-3 bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer transition-colors border-t border-outline-variant"
          onClick={() => setIsExpanded(true)}
        >
          <span className="text-sm font-bold text-primary">Tampilkan {displayLeaderboard.length - 5} Koperasi Lainnya...</span>
        </div>
      )}
    </section>
  );
}
