"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", icon: "home", label: "Beranda" },
    { href: "/quests", icon: "assignment", label: "Misi" },
    { href: "/arena", icon: "bolt", label: "Arena" },
    { href: "/marketplace", icon: "storefront", label: "Pasar" },
    { href: "/governance", icon: "account_balance", label: "Koperasi" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0B1120] z-[9999] flex justify-around items-center pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5 px-1 border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.45)] pointer-events-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            className="flex-1 flex flex-col justify-center outline-none h-full touch-manipulation cursor-pointer"
            href={link.href}
          >
            <div className={`flex flex-col items-center justify-center mx-1 py-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-[#1E293B] shadow-[0_3px_8px_rgba(250,204,21,0.18)]" : "bg-transparent"}`}>
              <span className={`material-symbols-outlined transition-all duration-300 ${isActive ? "text-tertiary scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-slate-500 scale-100"}`} style={isActive ? { fontVariationSettings: "\'FILL\' 1" } : undefined}>
                {link.icon}
              </span>
              <span className={`mt-0.5 transition-all duration-300 font-inter ${isActive ? "text-[9px] font-black text-tertiary" : "text-[8px] font-semibold text-slate-500"}`}>{link.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}