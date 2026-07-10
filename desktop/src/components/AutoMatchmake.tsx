"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchmakeGuildWarBattle } from '@/actions/arena';

export default function AutoMatchmake({ memberId }: { memberId: number }) {
  const router = useRouter();
  const attempted = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    
    let mounted = true;
    const matchmake = async () => {
      try {
        const res = await matchmakeGuildWarBattle(memberId);
        if (mounted) {
          if (res.success) {
            router.refresh();
          } else {
            setErrorMsg(res.error || "Gagal mencari lawan.");
          }
        }
      } catch (err) {
        if (mounted) setErrorMsg("Terjadi kesalahan sistem saat mencari lawan.");
      }
    };
    
    matchmake();
    
    return () => { mounted = false; };
  }, [memberId, router]);

  if (errorMsg) {
    return (
      <div className="mt-4 text-center p-3 bg-surface-container rounded-xl border border-outline-variant/30 max-w-xs mx-auto">
        <span className="material-symbols-outlined text-tertiary mb-1">group_off</span>
        <p className="text-sm text-on-surface-variant font-medium">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 text-center">
      <div className="w-6 h-6 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin mx-auto mb-2"></div>
      <span className="text-sm text-tertiary font-bold animate-pulse">Mencari Lawan...</span>
    </div>
  );
}
