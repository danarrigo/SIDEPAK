import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { proposals } from "@/db/schema/governance";
import { events } from "@/db/schema/activities";
import { eq, desc } from "drizzle-orm";
import GovernanceManager from "./GovernanceManager";

export const metadata = {
  title: "Admin - Tata Kelola & Event",
};

export default async function AdminGovernancePage() {
  const adminData = await getCurrentMember();
  
  if (!adminData || !adminData.cooperativeId) {
    return <div>Error loading admin data</div>;
  }

  const coopId = adminData.cooperativeId;

  const allProposals = await db.select().from(proposals).where(eq(proposals.cooperativeId, coopId)).orderBy(desc(proposals.createdAt));
  const allEvents = await db.select().from(events).where(eq(events.cooperativeId, coopId)).orderBy(desc(events.createdAt));

  const serializedProposals = JSON.parse(JSON.stringify(allProposals));
  const serializedEvents = JSON.parse(JSON.stringify(allEvents));

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in text-slate-900">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg font-black text-slate-900 mb-1">
          Tata Kelola & Event
        </h1>
        <p className="font-body-lg text-slate-500">
          Kelola proposal voting dan daftar event untuk Koperasi {adminData.koperasi}
        </p>
      </div>

      <GovernanceManager 
        proposals={serializedProposals}
        events={serializedEvents}
        coopId={coopId}
      />
    </div>
  );
}
