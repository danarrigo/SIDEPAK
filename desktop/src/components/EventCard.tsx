"use client";

import { useState, useTransition } from "react";
import { joinEvent } from "@/actions/events";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: {
    id: number;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
  };
  isJoined: boolean;
  memberId: number;
}

export default function EventCard({ event, isJoined, memberId }: EventCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = () => {
    startTransition(async () => {
      setError(null);
      const result = await joinEvent(memberId, event.id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Gagal bergabung dengan event");
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="glass-card rounded-xl p-6 group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="material-symbols-outlined text-8xl">
          event_available
        </span>
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary font-label-caps text-[10px] rounded-full mb-3 uppercase tracking-widest border border-primary/30">
            Koperasi Event
          </span>
          <h3 className="font-headline-md text-headline-md mb-2">{event.name}</h3>
          <p className="text-on-surface-variant font-body-md text-body-md line-clamp-3">
            {event.description}
          </p>
        </div>
        
        <div className="mt-auto pt-4 border-t border-surface-container-highest space-y-4">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {isJoined ? (
            <button
              disabled
              className="w-full py-3 bg-surface-container-highest text-on-surface-variant rounded-lg font-label-caps uppercase tracking-widest flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Terdaftar
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-caps uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-[0_0_15px_rgba(var(--primary),0.4)]"
            >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">person_add</span>
              )}
              {isPending ? "Mendaftar..." : "Ikut Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
