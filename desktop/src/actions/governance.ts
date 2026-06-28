"use server";
import { db } from "@/db";
import { proposals } from "@/db/schema/governance";
import { members } from "@/db/schema/members";
import { eq, count, sum, ne, desc } from "drizzle-orm";
import { savings, loans } from "@/db/schema/financials";

export async function getGovernanceData() {
  try {
    const activeProposals = await db.select().from(proposals).where(eq(proposals.status, 'active'));
    const pastProposals = await db.select().from(proposals).where(ne(proposals.status, 'active')).orderBy(desc(proposals.endDate)).limit(5);
    
    const totalMembersRes = await db.select({ value: count() }).from(members);
    const totalMembers = totalMembersRes[0].value;

    const totalSavingsRes = await db.select({ value: sum(savings.amount) }).from(savings);
    const totalAsetDesa = Number(totalSavingsRes[0].value || 0);

    const totalLoansRes = await db.select({ value: sum(loans.amount) }).from(loans);
    const asetPinjaman = Number(totalLoansRes[0].value || 0);
    
    // Sisa dari aset desa setelah dipinjamkan
    const sisaAset = Math.max(0, totalAsetDesa - asetPinjaman);
    const asetKas = Math.floor(sisaAset * 0.6); // 60% dari sisa
    const asetInvestasi = sisaAset - asetKas;   // 40% dari sisa

    return { 
      activeProposals, 
      pastProposals, 
      totalMembers, 
      totalAsetDesa,
      asetPinjaman,
      asetKas,
      asetInvestasi
    };
  } catch (error) {
    console.error("Governance DB Error:", error);
    return { 
      activeProposals: [], 
      pastProposals: [], 
      totalMembers: 0, 
      totalAsetDesa: 0,
      asetPinjaman: 0,
      asetKas: 0,
      asetInvestasi: 0
    };
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

export async function submitProposal(memberId: number, title: string, description: string) {
  try {
    const [proposal] = await db.insert(proposals).values({
      title,
      description,
      status: 'active',
      targetQuorumPercentage: 50,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }).returning();
    return { success: true, proposal };
  } catch (error) {
    console.error("Submit Proposal Error:", error);
    return { success: false, error: "Gagal membuat proposal." };
  }
}
