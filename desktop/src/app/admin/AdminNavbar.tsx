"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

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
    <nav className="w-full h-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 shrink-0 z-50">
      
      {/* Brand */}
      <div className="flex items-center gap-8">
        <h1 className="font-headline-lg text-2xl text-slate-900 tracking-tighter">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
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
          <span className="text-sm font-black text-slate-900">{memberName || "Pengurus"}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Super Admin</span>
        </div>
        
        <form action={logout}>
          <button type="submit" className="flex items-center gap-2 p-2 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300 border border-slate-200">
            <span className="material-symbols-outlined text-slate-500 text-sm">logout</span>
            <span className="text-xs font-bold">Keluar</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
