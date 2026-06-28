import React from 'react';
import { getLeaderboard } from '@/actions/gamification';
import { getCurrentMember } from '@/actions/members';

export default async function Leaderboard() {
  const currentMember = await getCurrentMember();
  if (!currentMember || !currentMember.koperasi) return null;

  const topMembers = await getLeaderboard(currentMember.koperasi);

  return (
    <div className="glass-card border border-outline-variant rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm uppercase font-extrabold tracking-widest text-on-surface">Peringkat Koperasi</h3>
        <span className="material-symbols-outlined text-tertiary">leaderboard</span>
      </div>
      <div className="space-y-4">
        {topMembers.map((m, idx) => (
          <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border ${m.id === currentMember.id ? 'border-tertiary bg-tertiary/10' : 'border-outline-variant/30 bg-surface-container'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-error text-on-error' : idx === 1 ? 'bg-primary text-on-primary' : idx === 2 ? 'bg-tertiary text-on-tertiary' : 'bg-surface-variant text-on-surface-variant'}`}>
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{m.namaLengkap.split(' ')[0]}</p>
                <p className="text-[10px] text-on-surface-variant">Level {m.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-tertiary">{m.xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
