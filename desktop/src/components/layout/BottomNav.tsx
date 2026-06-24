"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", icon: "home", label: "Beranda" },
    { href: "/quests", icon: "assignment", label: "Misi" },
    { href: "/arena", icon: "emoji_events", label: "Lomba" },
    { href: "/governance", icon: "account_balance", label: "Koperasi" },
    { href: "/profile", icon: "person", label: "Profil" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full glass-nav z-50 flex justify-around items-center h-16 border-t border-outline-variant/10">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            className={`flex flex-col items-center justify-center ${isActive ? "text-tertiary" : "text-on-surface-variant"}`} 
            href={link.href}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "\'FILL\' 1" } : undefined}>
              {link.icon}
            </span>
            <span className="text-[10px] font-bold uppercase mt-1">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}