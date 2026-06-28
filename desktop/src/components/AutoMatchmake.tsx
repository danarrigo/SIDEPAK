"use client";
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { matchmakeWeeklyBattle } from '@/actions/arena';

export default function AutoMatchmake({ memberId }: { memberId: number }) {
  const router = useRouter();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    
    let mounted = true;
    const matchmake = async () => {
      try {
        const res = await matchmakeWeeklyBattle(memberId);
        if (mounted && res.success) {
          router.refresh();
        }
      } catch (err) {
        console.error("Automatchmake error", err);
      }
    };
    
    matchmake();
    
    return () => { mounted = false; };
  }, [memberId, router]);

  return (
    <div className="mt-4 text-center">
      <div className="w-6 h-6 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin mx-auto mb-2"></div>
      <span className="text-sm text-tertiary font-bold animate-pulse">Mencari Lawan...</span>
    </div>
  );
}
