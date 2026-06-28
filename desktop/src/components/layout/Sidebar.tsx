"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentMember } from "@/actions/members";

export default function Sidebar() {
  const pathname = usePathname();
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    getCurrentMember().then((res) => {
      if (res) setMember(res);
    });
  }, []);

  const navLinks = [
    { href: "/", icon: "home", label: "Beranda" },
    { href: "/quests", icon: "assignment", label: "Misi" },
    { href: "/arena", icon: "emoji_events", label: "Bertanding" },
    { href: "/governance", icon: "account_balance", label: "Koperasi" },
    { href: "/marketplace", icon: "storefront", label: "Marketplace" },
    { href: "/profile", icon: "person", label: "Profil" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface-container-low border-r border-outline-variant/20 z-50">
<div className="p-6">
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tighter">Koperasi<br/>Digital</h1>
</div>
<nav className="flex-1 px-4 space-y-2 mt-4">
{navLinks.map((link) => {
  const isActive = pathname === link.href;
  return (
    <Link 
      key={link.href} 
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? "active-nav-pill text-tertiary" : "text-on-surface-variant hover:text-primary"}`} 
      href={link.href}
    >
      <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "\'FILL\' 1" } : undefined}>
        {link.icon}
      </span>
      <span className="font-label-caps text-label-caps">{link.label}</span>
    </Link>
  );
})}
</nav>

</aside>
  );
}