"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { joinEvent } from '@/actions/events';

export default function MobileEventCard({ event, currentMemberId }: { event: any, currentMemberId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(event.participants.includes(currentMemberId));
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleJoin = async () => {
    setLoading(true);
    const res = await joinEvent(currentMemberId, event.id);
    if (res.success) setIsJoined(true);
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer active:bg-slate-100 transition-colors">
        <h4 className="font-bold text-[#1E293B] text-xs">{event.name}</h4>
        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{event.description}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[9px] font-bold text-[#3B82F6]">Berakhir: {new Date(event.endDate).toLocaleDateString("id-ID")}</p>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{event.participants.length} Peserta</span>
        </div>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <h3 className="text-sm font-bold mb-1 pr-6 text-[#1E293B]">{event.name}</h3>
            <p className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
               <span className="material-symbols-outlined text-[12px]">person</span> {event.creatorName}
            </p>
            <p className="text-xs mb-4 text-slate-600">{event.description}</p>
            
            <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Peserta:</span>
                  <span className="font-bold text-[#1E293B]">{event.participants.length + (isJoined && !event.participants.includes(currentMemberId) ? 1 : 0)} Orang</span>
               </div>
               <div className="flex justify-between items-center text-xs mt-1.5">
                  <span className="text-slate-500">Status Anda:</span>
                  <span className={`font-bold ${isJoined ? 'text-[#3B82F6]' : 'text-slate-500'}`}>{isJoined ? 'Terdaftar' : 'Belum Terdaftar'}</span>
               </div>
            </div>

            <button 
              onClick={handleJoin} 
              disabled={isJoined || loading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${isJoined ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#3B82F6] text-white hover:bg-blue-600'}`}
            >
              {loading ? 'Memproses...' : isJoined ? 'Terdaftar' : 'Daftar Event'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
