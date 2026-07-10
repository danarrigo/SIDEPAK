"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchmakeGuildWarBattle } from '@/actions/arena';

export default function MatchmakeButton({ memberId }: { memberId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMatchmake = async () => {
    setLoading(true);
    try {
      const res = await matchmakeGuildWarBattle(memberId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Gagal mencari lawan.");
      }
    } catch(err) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMatchmake}
      disabled={loading}
      className="mt-4 px-6 py-2 bg-gradient-to-r from-tertiary to-tertiary/80 text-on-tertiary font-bold rounded-full shadow-lg hover:shadow-tertiary/30 hover:scale-105 transition-all disabled:opacity-50 active:scale-95"
    >
      {loading ? "Mencari..." : "Cari Lawan"}
    </button>
  );
}
