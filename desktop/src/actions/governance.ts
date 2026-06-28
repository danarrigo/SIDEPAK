"use server";
import { db } from "@/db";
import { proposals, votes } from "@/db/schema/governance";
import { members } from "@/db/schema/members";
import { eq, count, and, sum } from "drizzle-orm";
import { savings, loans } from "@/db/schema/financials";

export async function getGovernanceData() {
  try {
    const activeProposals = await db.select().from(proposals).where(eq(proposals.status, 'active'));
    
    const totalMembersRes = await db.select({ value: count() }).from(members);
    const totalMembers = totalMembersRes[0].value;

    const totalSavingsRes = await db.select({ value: sum(savings.amount) }).from(savings);
    const totalAsetDesa = Number(totalSavingsRes[0].value || 0);

    return { activeProposals, totalMembers, totalAsetDesa };
  } catch (error) {
    console.error("Governance DB Error:", error);
    return { activeProposals: [], totalMembers: 0, totalAsetDesa: 0 };
  }
}


export async function getKoperasiStats() {
  try {
    const totalMembersRes = await db.select({ value: count() }).from(members);
    const anggotaBaru = totalMembersRes[0].value;
    
    const totalSavingsRes = await db.select({ value: count() }).from(savings);
    const totalLoansRes = await db.select({ value: count() }).from(loans);
    const transaksi = totalSavingsRes[0].value + totalLoansRes[0].value;

    return {
      transaksi,
      anggotaBaru,
      omzetHarian: 0,
      umkmAktif: 0
    };
  } catch (error) {
    console.error("Koperasi Stats Error:", error);
    return { transaksi: 0, anggotaBaru: 0, omzetHarian: 0, umkmAktif: 0 };
  }
}

export async function castVote(memberId: number, proposalId: number, voteType: string) {
  try {
    // Check if the user has already voted on this proposal
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.memberId, memberId),
        eq(votes.proposalId, proposalId)
      )
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(votes).set({ voteType }).where(eq(votes.id, existingVote[0].id));
    } else {
      // Insert new vote
      await db.insert(votes).values({
        memberId,
        proposalId,
        voteType
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Cast Vote DB Error:", error);
    return { success: false, error: "Failed to record vote" };
  }
}
