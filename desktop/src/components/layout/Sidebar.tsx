/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", icon: "home", label: "Beranda" },
    { href: "/quests", icon: "assignment", label: "Misi" },
    { href: "/arena", icon: "emoji_events", label: "Bertanding" },
    { href: "/governance", icon: "account_balance", label: "Koperasi" },
    { href: "/marketplace", icon: "storefront", label: "Marketplace" },
    { href: "/profile", icon: "person", label: "Profil" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#0B1120] border-r border-white/5 shadow-2xl z-50">
      <div className="p-6">
        <h1 className="font-headline-lg text-headline-lg text-tertiary tracking-tighter drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">SIDEPAK</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-[#1E293B] text-tertiary shadow-[0_3px_8px_rgba(250,204,21,0.18)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`} 
            href={link.href}
          >
            <span className={`material-symbols-outlined transition-all duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : ""}`} style={isActive ? { fontVariationSettings: "\'FILL\' 1" } : undefined}>
              {link.icon}
            </span>
            <span className={`font-inter ${isActive ? "font-black" : "font-semibold"} text-[14px]`}>{link.label}</span>
          </Link>
        );
      })}
      </nav>
    </aside>
  );
}