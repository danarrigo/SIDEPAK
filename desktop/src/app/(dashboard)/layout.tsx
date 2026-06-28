import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import PrankEffect from "@/components/PrankEffect";
import { getCurrentMember } from "@/actions/members";
import { getMemberProgress } from "@/actions/gamification";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentMember = await getCurrentMember();
  let activeEffect = null;
  if (currentMember) {
    const progress = await getMemberProgress(currentMember.id);
    activeEffect = progress?.activeEffect || null;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative">
        <Header />
        {currentMember && <PrankEffect memberId={currentMember.id} effect={activeEffect} />}
        {children}
        <BottomNav />
      </div>
    </>
  );
}
