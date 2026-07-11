 
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar({ memberName }: { memberName?: string }) {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(true);

  const navLinks = [
    { href: "/", icon: "home", label: "Beranda" },
    { href: "/quests", icon: "assignment", label: "Misi" },
    { href: "/arena", icon: "emoji_events", label: "Bertanding" },
    { href: "/marketplace", icon: "storefront", label: "Marketplace" },
    { href: "/governance", icon: "account_balance", label: "Koperasi" },
  ];

  return (
    <aside 
      className={`group hidden md:flex flex-col h-screen sticky top-0 bg-[#0B1120] border-r border-white/5 shadow-2xl z-50 overflow-x-hidden transition-[width] duration-300 ease-in-out ${isPinned ? "w-64" : "w-[68px] hover:w-64"}`}
    >
      <div className="h-24 flex items-center px-5 relative shrink-0">
        <div className={`transition-all duration-300 origin-left flex items-center gap-3 ${!isPinned ? "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100" : "scale-100 opacity-100"}`}>
          <Image src="/logo.png" alt="SIDEPAK Logo" width={40} height={40} className="object-contain" />
          <h1 className="font-headline-lg text-2xl text-tertiary tracking-tighter drop-shadow-[0_0_12px_rgba(250,204,21,0.4)] whitespace-nowrap">
            SIDEPAK
          </h1>
        </div>
        
        {/* SP mini logo when collapsed */}
        <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${!isPinned ? "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-0" : "opacity-0 scale-0"}`}>
          <Image src="/logo.png" alt="SIDEPAK Logo" width={32} height={32} className="object-contain" />
        </div>
        
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
        const isActive = pathname === link.href;
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

      <div className="p-3 border-t border-white/5 mb-4 shrink-0">
        <Link href="/profile" className={`flex items-center p-2 rounded-xl bg-tertiary text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:bg-tertiary/90 hover:scale-[1.02] transition-all duration-300 ${!isPinned ? "justify-center group-hover:justify-start" : "justify-start"}`}>
          <div className="w-10 h-10 shrink-0 rounded-full bg-black/10 flex items-center justify-center border border-black/5">
            <span className="material-symbols-outlined text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 whitespace-nowrap ${!isPinned ? "max-w-0 opacity-0 ml-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-3" : "max-w-[150px] opacity-100 ml-3"}`}>
            <span className="text-sm font-black truncate max-w-[110px]">{memberName || "Profil Saya"}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Lihat Profil</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}