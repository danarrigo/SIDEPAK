"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

export default function AdminSidebar({ memberName }: { memberName?: string }) {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(true);

  const navLinks = [
    { href: "/admin", icon: "dashboard", label: "Dashboard" },
    { href: "/admin/members", icon: "groups", label: "Anggota" },
    { href: "/admin/governance", icon: "article", label: "Tata Kelola & Event" },
    { href: "/admin/profile", icon: "settings", label: "Pengaturan" },
  ];

  return (
    <aside 
      className={`group hidden md:flex flex-col h-screen sticky top-0 bg-[#0B1120] border-r border-white/5 shadow-2xl z-50 overflow-x-hidden transition-[width] duration-300 ease-in-out ${isPinned ? "w-64" : "w-[68px] hover:w-64"}`}
    >
      <div className="h-24 flex items-center px-5 relative shrink-0">
        <h1 className={`font-headline-lg text-headline-lg text-tertiary tracking-tighter drop-shadow-[0_0_12px_rgba(250,204,21,0.4)] transition-all duration-300 whitespace-nowrap origin-left ${!isPinned ? "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100" : "scale-100 opacity-100"}`}>
          ADMIN
        </h1>
        
        {/* Admin mini logo when collapsed */}
        <h1 className={`font-headline-lg text-2xl text-tertiary tracking-tighter absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${!isPinned ? "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-0" : "opacity-0 scale-0"}`}>
          AD
        </h1>
        
        {/* Pin button */}
        <button 
          onClick={() => setIsPinned(!isPinned)} 
          className={`absolute text-on-surface-variant hover:text-tertiary transition-all duration-300 focus:outline-none right-5 ${!isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
          title={isPinned ? "Tutup Sidebar" : "Kunci Sidebar"}
        >
          <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${!isPinned ? "-rotate-45 opacity-50 hover:opacity-100 hover:rotate-0" : "rotate-0 opacity-100"}`}>
            push_pin
          </span>
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-2">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link 
            key={link.href} 
            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-[#1E293B] text-tertiary shadow-[0_3px_8px_rgba(250,204,21,0.18)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"} ${!isPinned ? "justify-center group-hover:justify-start" : "justify-start"}`} 
            href={link.href}
            title={!isPinned ? link.label : undefined}
          >
            <span className={`material-symbols-outlined transition-all duration-300 shrink-0 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : ""}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {link.icon}
            </span>
            <span className={`font-inter ${isActive ? "font-black" : "font-semibold"} text-[14px] whitespace-nowrap overflow-hidden transition-all duration-300 ${!isPinned ? "max-w-0 opacity-0 ml-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3" : "max-w-[150px] opacity-100 ml-3"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
      </nav>

      <div className="p-3 border-t border-white/5 mb-4 shrink-0 flex flex-col gap-2">
        <Link href="/admin/profile" className={`flex items-center p-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 ${!isPinned ? "justify-center group-hover:justify-start" : "justify-start"}`}>
          <div className="w-10 h-10 shrink-0 rounded-full bg-black/20 flex items-center justify-center border border-black/10">
            <span className="material-symbols-outlined text-slate-300" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 whitespace-nowrap ${!isPinned ? "max-w-0 opacity-0 ml-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3" : "max-w-[150px] opacity-100 ml-3"}`}>
            <span className="text-sm font-black truncate max-w-[110px]">{memberName || "Pengurus"}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-80 text-tertiary">Admin</span>
          </div>
        </Link>

        <form action={logout} className="w-full">
          <button type="submit" className={`w-full flex items-center p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 ${!isPinned ? "justify-center group-hover:justify-start" : "justify-start"}`}>
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <span className={`font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${!isPinned ? "max-w-0 opacity-0 ml-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3" : "max-w-[150px] opacity-100 ml-3"}`}>
              Keluar
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
