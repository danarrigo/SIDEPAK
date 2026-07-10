import React from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
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
    <div className="flex h-screen w-full bg-surface-container-lowest text-on-surface overflow-hidden">
      <AdminSidebar memberName={memberData.namaLengkap} />
      
      <main className="flex-1 relative h-full flex flex-col bg-[#0B1120]">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
