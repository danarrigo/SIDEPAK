import NotificationBell from "./NotificationBell";

export default async function Header({ memberId }: { memberId?: number }) {
  return (
    <header className="hidden md:flex w-full sticky top-0 z-40 glass-nav px-6 py-4 justify-between items-center border-b border-outline-variant/10">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md">Dashboard Utama</h2>
          <p className="text-[12px] text-on-surface-variant">Selamat pagi, mari bangun ekonomi desa bersama.</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <NotificationBell memberId={memberId} />
          <a href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 hover:bg-white/10 transition-colors ml-2">
            <span className="material-symbols-outlined text-on-surface">person</span>
          </a>
        </div>
      </div>
    </header>
  );
}