"use client";

import { useState, useEffect } from "react";
import { claimWeeklyChest } from "@/actions/gamification";

export default function WeeklyChestsClient({ 
  completedMissionsCount, 
  initialClaimedChests,
  memberId,
  isMobile
}: { 
  completedMissionsCount: number,
  initialClaimedChests: number[],
  memberId: number,
  isMobile?: boolean
}) {
  const [claimedChests, setClaimedChests] = useState<number[]>(initialClaimedChests);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'|'info'} | null>(null);

  useEffect(() => {
    setClaimedChests(initialClaimedChests);
  }, [initialClaimedChests]);

  const chestMilestones = [6, 12, 18, 24, 30];
  const maxMissions = 30;
  const chestPercent = Math.min(100, (completedMissionsCount / maxMissions) * 100);

  const handleClaim = async (index: number) => {
    if (loadingIndex !== null) return;
    
    const target = chestMilestones[index];
    if (completedMissionsCount < target) {
      setMessage({ text: 'Selesaikan lebih banyak misi untuk membuka peti ini.', type: 'info' });
      return;
    }
    if (claimedChests.includes(index)) {
      setMessage({ text: 'Peti harta ini sudah diklaim!', type: 'info' });
      return;
    }

    setLoadingIndex(index);
    setMessage(null);
    try {
      const res = await claimWeeklyChest(memberId, index);
      if (res.success) {
        setClaimedChests([...claimedChests, index]);
        setMessage({ text: `Peti Harta Terbuka! +${res.rewardPoints} Poin`, type: 'success' });
      } else {
        setMessage({ text: res.error || 'Gagal klaim peti harta', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Terjadi kesalahan pada server.', type: 'error' });
    } finally {
      setLoadingIndex(null);
    }
  };

  if (message) {
    setTimeout(() => setMessage(null), 3000);
  }

  if (isMobile) {
    return (
      <div className="relative w-full px-2 pb-2 mt-4">
        {message && (
          <div className={`absolute -top-10 left-0 right-0 text-center text-[10px] font-bold p-1 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {message.text}
          </div>
        )}
        <div className="absolute left-4 right-4 top-[14px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000" style={{ width: `${chestPercent}%` }}></div>
        </div>
        <div className="relative flex justify-between">
          {chestMilestones.map((target, index) => {
            const isUnlocked = completedMissionsCount >= target;
            const isClaimed = claimedChests.includes(index);
            const isLoading = loadingIndex === index;
            
            let boxClass = 'bg-white border-slate-200 text-slate-300';
            let icon = 'lock';
            let textClass = 'text-slate-400';
            
            if (isClaimed) {
              boxClass = 'bg-[#F1F5F9] border-[#94A3B8] text-[#94A3B8]';
              icon = 'check';
              textClass = 'text-[#94A3B8]';
            } else if (isUnlocked) {
              boxClass = 'bg-[#FEF3C7] border-[#F59E0B] text-[#F59E0B] cursor-pointer';
              icon = 'redeem';
              textClass = 'text-[#D97706]';
            }
            
            return (
              <div key={target} className="flex flex-col items-center relative z-10" onClick={() => handleClaim(index)}>
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center border-2 transition-all duration-500 ${boxClass}`}>
                  {isLoading ? (
                    <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]" style={isUnlocked && !isClaimed ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {icon}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-bold mt-1.5 ${textClass}`}>{target}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="relative pt-4 pb-2 px-2 z-10">
      {message && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-center text-xs font-bold px-4 py-2 rounded shadow-md z-50 ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}
      <div className="absolute left-6 right-6 top-9 h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${chestPercent}%` }}></div>
      </div>
      <div className="relative flex justify-between">
        {chestMilestones.map((target, index) => {
          const isUnlocked = completedMissionsCount >= target;
          const isClaimed = claimedChests.includes(index);
          const isLoading = loadingIndex === index;
          
          let boxClass = 'bg-surface-container-low border-outline-variant text-outline-variant';
          let icon = 'lock';
          let textClass = 'text-on-surface-variant';
          
          if (isClaimed) {
            boxClass = 'bg-slate-100 border-slate-400 text-slate-400';
            icon = 'check';
            textClass = 'text-slate-400';
          } else if (isUnlocked) {
            boxClass = 'bg-amber-100 border-amber-500 text-amber-500 gold-glow transform scale-110 hover:scale-125';
            icon = 'redeem';
            textClass = 'text-amber-600';
          }

          return (
            <div key={target} className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => handleClaim(index)}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${boxClass}`}>
                {isLoading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[24px]" style={isUnlocked && !isClaimed ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {icon}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-3 ${textClass}`}>{target} Misi</span>
              
              <div className="absolute bottom-full mb-2 w-32 p-2 bg-surface-container-highest border border-outline-variant/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-xs font-bold text-on-surface mb-0.5">Peti Tier {index + 1}</p>
                <p className="text-[9px] text-on-surface-variant">
                  {isClaimed ? 'Telah Diklaim!' : isUnlocked ? 'Klik untuk Klaim!' : `Selesaikan ${target - completedMissionsCount > 0 ? target - completedMissionsCount : 0} misi lagi`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
