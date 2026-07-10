"use client";
import React, { useEffect, useState } from 'react';
import { clearActiveEffect } from '@/actions/gamification';

export default function PrankEffect({ memberId, effect }: { memberId: number, effect: string | null }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (effect && effect.toLowerCase().includes("jantung")) {
       
      setActive(true);
      setTimeout(() => {
         
        setActive(false);
        clearActiveEffect(memberId);
      }, 4000);
    }
  }, [effect, memberId]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-error/30" style={{ animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite' }}>
      <div className="text-center p-8 bg-surface rounded-3xl shadow-2xl border-4 border-error" style={{ animation: 'scaleUp 0.3s ease-out forwards' }}>
        <h1 className="text-5xl font-black text-error mb-4">💥 KENA PRANK! 💥</h1>
        <p className="text-xl text-on-surface">Seseorang baru saja mengirimkan efek &ldquo;Sakit Jantung&rdquo; ke kamu!</p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-5px, 0, 0); }
          20%, 80% { transform: translate3d(5px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-10px, 0, 0); }
          40%, 60% { transform: translate3d(10px, 0, 0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
