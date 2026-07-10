"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function StreakIndicator({ streak }: { streak: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const days = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      label: i === 0 ? 'Hari ini' : dayNames[d.getDay()],
      isActive: i < streak
    });
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      <div className="w-full max-w-sm bg-surface-container-high/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative transform transition-all p-6 text-center animate-scale-up">
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-6xl mb-4 mt-2">🔥</div>
        <h3 className="font-headline-md text-2xl font-black text-on-surface mb-2">{streak} Hari Streak Beruntun!</h3>
        <p className="text-sm text-on-surface-variant mb-6">Pertahankan streak Anda dengan login setiap hari untuk mendapatkan reward tambahan dan mempercepat kenaikan level Anda.</p>
        
        <div className="flex justify-between items-center mb-8 px-2">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${day.isActive ? 'bg-tertiary text-on-tertiary shadow-[0_0_12px_rgba(250,204,21,0.5)] scale-110' : 'bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant'}`}>
                {day.isActive ? (
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/40"></span>
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${day.label === 'Hari ini' ? 'text-tertiary' : 'text-on-surface-variant'}`}>{day.label}</span>
            </div>
          ))}
        </div>


        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-3 bg-tertiary text-on-tertiary font-bold rounded-xl transition-colors hover:bg-tertiary/90"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-tertiary/10 hover:bg-tertiary/20 transition-colors px-4 py-2 border border-tertiary/20 rounded-xl text-tertiary cursor-pointer active:scale-95"
      >
        <span className="text-xl">🔥</span>
        <span className="font-extrabold text-sm">{streak} Hari Streak Beruntun!</span>
      </button>

      {mounted && isOpen && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
