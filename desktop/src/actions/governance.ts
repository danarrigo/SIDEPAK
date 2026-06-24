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

import { savings, loans } from "@/db/schema/financials";

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
