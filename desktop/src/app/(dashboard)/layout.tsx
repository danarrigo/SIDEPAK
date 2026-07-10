import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import PrankEffect from "@/components/PrankEffect";
import OnboardingPaywall from "@/components/OnboardingPaywall";
import { getCurrentMember } from "@/actions/members";
import { getMemberProgress } from "@/actions/gamification";
import { getFinancialsData } from "@/actions/financials";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentMember = await getCurrentMember();
  let activeEffect = null;
  let isPokokPaid = true;
  if (currentMember) {
    const progress = await getMemberProgress(currentMember.id);
    activeEffect = progress?.activeEffect || null;
    const financials = await getFinancialsData(currentMember.id);
    isPokokPaid = financials?.isPokokPaid ?? true;
  }

  return (
    <>
      {currentMember && <OnboardingPaywall isActive={isPokokPaid} memberId={currentMember.id} />}
      <Sidebar memberName={currentMember?.namaLengkap || "Pengguna"} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header memberId={currentMember?.id} />
        {currentMember && <PrankEffect memberId={currentMember.id} effect={activeEffect} />}
        <main className="flex-1 overflow-y-auto w-full relative z-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
}
