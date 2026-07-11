"use client";
import React, { useState } from 'react';

type MemberData = {
  id: number;
  namaLengkap: string;
  level: number;
  xp: number;
  pointsBalance: number;
};

interface LeaderboardClientProps {
  memberId: number;
  koperasiData: MemberData[];
  provinsiData: MemberData[];
  nasionalData: MemberData[];
}

export default function LeaderboardClient({ memberId, koperasiData, provinsiData, nasionalData }: LeaderboardClientProps) {
  const [scope, setScope] = useState<'koperasi' | 'provinsi' | 'nasional'>('koperasi');
  const [showModal, setShowModal] = useState(false);

  const data = scope === 'koperasi' ? koperasiData : scope === 'provinsi' ? provinsiData : nasionalData;
  const title = scope === 'koperasi' ? 'Peringkat Koperasi' : scope === 'provinsi' ? 'Peringkat Provinsi' : 'Peringkat Nasional';

  const renderItem = (m: MemberData, idx: number) => (
    <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border ${m.id === memberId ? 'border-tertiary bg-tertiary/10' : 'border-outline-variant/30 bg-surface-container'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-error text-on-error' : idx === 1 ? 'bg-primary text-on-primary' : idx === 2 ? 'bg-tertiary text-on-tertiary' : 'bg-surface-variant text-on-surface-variant'}`}>
          {idx + 1}
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">
            {m.namaLengkap.split(' ')[0]}
            {m.id === memberId && <span className="ml-2 text-[10px] font-bold text-tertiary bg-tertiary/20 px-2 py-0.5 rounded">ANDA</span>}
          </p>
          <p className="text-[10px] text-on-surface-variant">Level {m.level}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-tertiary">{m.xp} XP</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col h-full cursor-pointer hover:border-tertiary/50 transition-colors" onClick={() => setShowModal(true)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm uppercase font-extrabold tracking-widest text-on-surface">{title}</h3>
          <div className="flex items-center gap-1 text-tertiary">
            <span className="text-xs font-bold">Lihat Semua</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </div>
        </div>

        <div className="flex bg-surface-container-low rounded-xl p-1 mb-6 border border-outline-variant/30 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setScope('koperasi')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${scope === 'koperasi' ? 'bg-surface shadow-sm text-tertiary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Koperasi
          </button>
          <button
            onClick={() => setScope('provinsi')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${scope === 'provinsi' ? 'bg-surface shadow-sm text-tertiary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Provinsi
          </button>
          <button
            onClick={() => setScope('nasional')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${scope === 'nasional' ? 'bg-surface shadow-sm text-tertiary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Nasional
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {data.length === 0 ? (
            <p className="text-center text-xs text-on-surface-variant py-4">Belum ada data peringkat.</p>
          ) : (
            data.slice(0, 3).map((m, idx) => renderItem(m, idx))
          )}
        </div>
      </div>

      {/* Modal View */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low rounded-t-2xl">
              <h3 className="text-lg font-black text-on-surface">{title}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant text-on-surface hover:bg-error hover:text-on-error transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {data.map((m, idx) => renderItem(m, idx))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
