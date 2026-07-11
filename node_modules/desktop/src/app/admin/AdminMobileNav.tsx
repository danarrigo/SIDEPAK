"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminMobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", icon: "dashboard", label: "Dashboard" },
    { href: "/admin/members", icon: "groups", label: "Anggota" },
    { href: "/admin/governance", icon: "article", label: "Tata Kelola" },
    { href: "/admin/health", icon: "monitor_heart", label: "Kesehatan" },
    { href: "/admin/profile", icon: "settings", label: "Pengaturan" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B1120] border-t border-white/10 px-4 py-2 z-50 pb-safe">
      <nav className="flex justify-around items-center h-14">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className="flex flex-col items-center justify-center w-16 h-full relative"
            >
              <div className={`
                flex flex-col items-center justify-center w-full h-full transition-all duration-300
                ${isActive ? "text-tertiary" : "text-slate-400 hover:text-slate-300"}
              `}>
                <span 
                  className={`material-symbols-outlined text-2xl transition-all duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : ""}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${isActive ? "font-bold" : ""}`}>
                  {link.label}
                </span>
              </div>
              
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-tertiary rounded-b-full shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
