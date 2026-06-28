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
<div className="p-4 mt-auto">
<div className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant/10">
<div className="flex items-center gap-3 mb-3">
<div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container">
<img className="w-full h-full object-cover" data-alt="A professional high-resolution headshot of a smiling community member, styled with warm studio lighting and a clean dark corporate background to match the koperasi app aesthetic. The person looks friendly and trustworthy, reflecting the village cooperative's focus on social empowerment and financial growth." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoG8RcWMNWQkxjfRNOgyHUQdZVpWhij5Eg3VIuOfOI7Be0akVwsrwDj0Ipzv40EsomW4UuifRfT4ICzann51nnr2IJ5JNfLRu_EIXe17UIJNjX1zMF5Akv3lKD5ki03zN4zSBiqx5TOYo9Wm3zvSd-4YYgxQMzAP0-r9Oyo6d5DO3niZC3PsJsTOpj4nSGL3v5nQWA6jPwNK5s2UGv6oOn7OcDWQIGf0e2CmwjM6waeBke7PsaKjwISOX1L_ExNH2LjnlK1s5ECFg"/>
</div>
<div>
<p className="font-body-md text-body-md text-on-surface">{member ? member.namaLengkap : "Memuat..."}</p>
<p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">{member ? member.koperasi : "..."}</p>
</div>
</div>
<Link href="/profile" className="w-full py-2 bg-primary-container text-primary rounded-lg font-label-caps text-[10px] hover:bg-primary hover:text-on-primary transition-all block text-center">PENGATURAN</Link>
</div>
</div>
</aside>
  );
}