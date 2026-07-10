"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavbar({ memberName }: { memberName?: string }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", icon: "dashboard", label: "Dashboard" },
    { href: "/admin/members", icon: "groups", label: "Anggota" },
    { href: "/admin/loans", icon: "credit_score", label: "Pinjaman" },
    { href: "/admin/marketplace", icon: "storefront", label: "Marketplace" },
    { href: "/admin/settings", icon: "settings", label: "Pengaturan" },
  ];

  return (
    <nav className="w-full h-20 bg-[#0B1120] border-b border-white/5 shadow-xl flex items-center justify-between px-6 shrink-0 z-50">
      
      {/* Brand */}
      <div className="flex items-center gap-8">
        <h1 className="font-headline-lg text-2xl text-rose-500 tracking-tighter drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
          ADMIN SIDEPAK
        </h1>

        {/* Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? "bg-rose-500/10 text-rose-500 shadow-[0_3px_8px_rgba(244,63,94,0.18)]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
              >
                <span className="material-symbols-outlined text-[18px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {link.icon}
                </span>
                <span className={`font-inter text-sm ${isActive ? "font-black" : "font-semibold"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-black text-white">{memberName || "Pengurus"}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400">Super Admin</span>
        </div>
        
        <Link href="/" className="flex items-center gap-2 p-2 px-4 rounded-xl bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-all duration-300">
          <span className="material-symbols-outlined text-white/70 text-sm">exit_to_app</span>
          <span className="text-xs font-bold">Kembali ke Member</span>
        </Link>
      </div>
    </nav>
  );
}
