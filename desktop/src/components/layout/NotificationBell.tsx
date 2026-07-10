"use client";
import React, { useState, useEffect, useRef } from "react";
import { getMemberNotifications, deleteNotification, createTestNotification } from "@/actions/notifications";
import { useRouter } from "next/navigation";

export default function NotificationBell({ memberId }: { memberId?: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (memberId) {
      loadNotifications();
    }
  }, [memberId, open]);

  async function loadNotifications() {
    if (!memberId) return;
    const data = await getMemberNotifications(memberId);
    setNotifications(data);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(id: number) {
    // Delete the notification on click (mark as read / delete)
    await deleteNotification(id);
    await loadNotifications();
    router.refresh(); // Refresh in case it affects other global state
  }

  async function handleTestNotification() {
    if (!memberId) return;
    await createTestNotification(memberId);
    await loadNotifications();
  }

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <div 
        className="relative cursor-pointer hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
        )}
      </div>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-lg z-50 animate-slide-up origin-top-right overflow-hidden">
          <div className="p-3 border-b border-outline-variant/30 bg-surface flex justify-between items-center">
            <span className="font-bold text-sm">Notifikasi {unreadCount > 0 && `(${unreadCount})`}</span>
            <button 
              onClick={handleTestNotification}
              className="text-[10px] text-primary cursor-pointer hover:underline border border-primary/30 px-2 py-0.5 rounded"
            >
              Tes Notif
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_paused</span>
                <p className="text-xs text-on-surface-variant">Belum ada notifikasi baru.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-4 border-b border-outline-variant/10 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-on-surface">{notif.title}</h4>
                      <span className="text-[10px] text-tertiary">BACA</span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{notif.message}</p>
                    <p className="text-[9px] text-on-surface-variant/60 mt-2">
                      {new Date(notif.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
