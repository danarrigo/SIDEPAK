import React from "react";
import { getCurrentMember } from "@/actions/members";
import { getInAppItems, getMarketplaceItems } from "@/actions/shop";
import MarketplaceClient from "./MarketplaceClient";
import { getMemberProgress } from "@/actions/gamification";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const progress = await getMemberProgress(currentMember.id);
  const inAppItems = await getInAppItems();
  const physicalItems = await getMarketplaceItems(currentMember.cooperativeId || undefined);

  const points = progress?.pointsBalance || 0;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop view header container */}
      <div className="hidden md:block px-6 pt-10 w-full">
        <div className="glass-card animate-slide-up border border-outline-variant rounded-2xl p-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-on-surface">
                Marketplace & Pasar Poin
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Gunakan poin Anda untuk membeli item Pasar Poin atau belanja barang dari anggota lain.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-tertiary/10 px-4 py-2 border border-tertiary/20 rounded-xl text-tertiary">
              <span className="material-symbols-outlined">stars</span>
              <span className="font-extrabold text-sm">
                {points.toLocaleString()} Poin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop padding wrapper */}
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-6 md:py-10 space-y-8 pb-32 w-full">
        <MarketplaceClient
          memberId={currentMember.id}
          points={points}
          inAppItems={inAppItems}
          physicalItems={physicalItems}
        />
      </div>

      {/* Mobile view container (edge-to-edge) */}
      <div className="md:hidden flex-1 overflow-y-auto w-full">
        <MarketplaceClient
          memberId={currentMember.id}
          points={points}
          inAppItems={inAppItems}
          physicalItems={physicalItems}
        />
      </div>
    </main>
  );
}
