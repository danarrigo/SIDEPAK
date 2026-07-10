"use client";
import { useState } from 'react';
import { joinEvent } from '@/actions/events';

export default function EventCard({ event, currentMemberId }: { event: any, currentMemberId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(event.participants.includes(currentMemberId));
  const [loading, setLoading] = useState(false);
  
  const handleJoin = async () => {
    setLoading(true);
    const res = await joinEvent(currentMemberId, event.id);
    if (res.success) setIsJoined(true);
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="p-4 bg-surface-container-highest rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors relative z-10">
        <h4 className="font-bold text-on-surface">{event.name}</h4>
        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{event.description}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] font-bold text-primary">Berakhir: {new Date(event.endDate).toLocaleDateString("id-ID")}</p>
          <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">{event.participants.length} Terdaftar</span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-black mb-2 pr-6 text-on-surface">{event.name}</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">person</span> Pembuat: {event.creatorName}
            </p>
            <p className="text-sm mb-6 text-on-surface">{event.description}</p>
            
            <div className="bg-surface-container p-4 rounded-xl mb-6">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Total Peserta:</span>
                  <span className="font-bold text-on-surface">{event.participants.length + (isJoined && !event.participants.includes(currentMemberId) ? 1 : 0)} Orang</span>
               </div>
               <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-on-surface-variant">Status Anda:</span>
                  <span className={`font-bold ${isJoined ? 'text-primary' : 'text-on-surface-variant'}`}>{isJoined ? 'Terdaftar' : 'Belum Terdaftar'}</span>
               </div>
            </div>

            <button 
              onClick={handleJoin} 
              disabled={isJoined || loading}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${isJoined ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
            >
              {loading ? 'Memproses...' : isJoined ? 'Sudah Terdaftar' : 'Daftar Event'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
