"use server";
import { db } from "@/db";
import { proposals, votes } from "@/db/schema/governance";
import { members } from "@/db/schema/members";
import { eq, count } from "drizzle-orm";

export async function getGovernanceData() {
  try {
    const activeProposals = await db.select().from(proposals).where(eq(proposals.status, 'active'));
    
    const totalMembersRes = await db.select({ value: count() }).from(members);
    const totalMembers = totalMembersRes[0].value;

    return { activeProposals, totalMembers };
  } catch (error) {
    console.error("Governance DB Error:", error);
    return { activeProposals: [], totalMembers: 0 };
  }
}
