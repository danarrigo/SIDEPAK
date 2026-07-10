"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300">
      {/* Backdrop close area */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
      
      {/* Bottom Sheet */}
      <div className="relative bg-white w-full rounded-t-[24px] p-6 pb-8 flex flex-col gap-6 shadow-2xl z-[10000] max-w-md animate-[slideUp_0.2s_ease-out]">
        {/* Handle bar for bottom sheet visual */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-2"></div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[#0F172A]">Notifikasi</span>
          <button 
            onClick={() => {
              setHasUnread(false);
              setIsOpen(false);
            }}
            className="text-[10px] text-[#FACC15] font-bold border-0 bg-transparent focus:outline-none"
          >
            Tandai sudah dibaca
          </button>
        </div>
        
        {/* Center Content */}
        <div className="flex flex-col items-center gap-3 py-6">
          <span className="material-symbols-outlined text-[#CBD5E1] text-[56px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_paused</span>
          <p className="text-slate-400 text-xs font-semibold">Belum ada notifikasi baru.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative bg-white/10 hover:bg-white/20 transition-colors p-2.5 rounded-full cursor-pointer flex items-center justify-center border-0 focus:outline-none"
      >
        <span className="material-symbols-outlined text-white text-[22px]">notifications</span>
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
