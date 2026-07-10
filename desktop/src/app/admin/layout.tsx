import React from "react";
import { redirect } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import { getCurrentMember } from "@/actions/members";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberData = await getCurrentMember();

  if (!memberData) {
    redirect("/login");
  }

  if (memberData.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
      <AdminNavbar memberName={memberData.namaLengkap} />
      
      <main className="flex-1 relative w-full h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
