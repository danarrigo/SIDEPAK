"use client";
import React, { useState, useEffect, useRef } from "react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div 
        className="relative cursor-pointer hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary">notifications</span>
        <span className="absolute top-0 right-0 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
      </div>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-lg z-50 animate-slide-up origin-top-right overflow-hidden">
          <div className="p-3 border-b border-outline-variant/30 bg-surface flex justify-between items-center">
            <span className="font-bold text-sm">Notifikasi</span>
            <span className="text-[10px] text-primary cursor-pointer hover:underline">Tandai sudah dibaca</span>
          </div>
          <div className="p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_paused</span>
            <p className="text-xs text-on-surface-variant">Belum ada notifikasi baru.</p>
          </div>
        </div>
      )}
    </div>
  );
}
