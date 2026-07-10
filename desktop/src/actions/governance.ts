"use server";
import { db } from "@/db";
import { proposals, votes } from "@/db/schema/governance";
import { members } from "@/db/schema/members";
import { eq, and, desc, count, sum, ne, sql } from "drizzle-orm";
import { savings, loans, dues } from "@/db/schema/financials";
import { memberProgress } from "@/db/schema/gamification";
import { events } from "@/db/schema/activities";

export async function getGovernanceData(cooperativeId: number) {
  try {
    const activeProposals = await db.select().from(proposals)
      .where(and(eq(proposals.status, 'active'), eq(proposals.cooperativeId, cooperativeId)));
    const pastProposals = await db.select().from(proposals)
      .where(and(ne(proposals.status, 'active'), eq(proposals.cooperativeId, cooperativeId)))
      .orderBy(desc(proposals.endDate)).limit(5);

    const activeEvents = await db.select().from(events)
      .where(and(eq(events.status, 'active'), eq(events.cooperativeId, cooperativeId)));
      
    const pastEvents = await db.select().from(events)
      .where(and(ne(events.status, 'active'), eq(events.cooperativeId, cooperativeId)))
      .orderBy(desc(events.endDate)).limit(5);
    
    const totalMembersRes = await db.select({ value: count() }).from(members)
      .where(and(eq(members.cooperativeId, cooperativeId), eq(members.statusAnggota, 'active')));
    const totalMembers = totalMembersRes[0].value;

    const [savingStats] = await db.select({
      totalDeposits: sql<number>`sum(case when ${savings.type} = 'deposit' then ${savings.amount} else 0 end)`,
      totalWithdrawals: sql<number>`sum(case when ${savings.type} = 'withdrawal' then ${savings.amount} else 0 end)`
    })
    .from(savings)
    .innerJoin(members, eq(savings.memberId, members.id))
    .where(eq(members.cooperativeId, cooperativeId));

    const [dueStats] = await db.select({
      totalDues: sql<number>`sum(case when ${dues.status} = 'paid' then ${dues.amount} else 0 end)`
    })
    .from(dues)
    .innerJoin(members, eq(dues.memberId, members.id))
    .where(eq(members.cooperativeId, cooperativeId));

    const netSavings = (Number(savingStats?.totalDeposits) || 0) - (Number(savingStats?.totalWithdrawals) || 0);
    const totalDuesPaid = Number(dueStats?.totalDues) || 0;
    const totalAsetDesa = netSavings + totalDuesPaid;

    const totalLoansRes = await db.select({ value: sum(loans.amount) })
      .from(loans)
      .innerJoin(members, eq(loans.memberId, members.id))
      .where(eq(members.cooperativeId, cooperativeId));
    const asetPinjaman = Number(totalLoansRes[0].value || 0);
    
    // Sisa dari aset desa setelah dipinjamkan
    const sisaAset = Math.max(0, totalAsetDesa - asetPinjaman);
    const asetKas = Math.floor(sisaAset * 0.6); // 60% dari sisa
    const asetInvestasi = sisaAset - asetKas;   // 40% dari sisa

    return { 
      activeProposals, 
      pastProposals, 
      activeEvents,
      pastEvents,
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
      activeEvents: [],
      pastEvents: [],
      totalMembers: 0, 
      totalAsetDesa: 0,
      asetPinjaman: 0,
      asetKas: 0,
      asetInvestasi: 0
    };
  }
}


export async function getKoperasiStats(cooperativeId: number) {
  try {
    const totalMembersRes = await db.select({ value: count() }).from(members)
      .where(eq(members.cooperativeId, cooperativeId));
    const anggotaBaru = totalMembersRes[0].value;
    
    // For transactions, we can join savings/loans with members, or just use a mock derived from members for now
    const totalSavingsRes = await db.select({ value: sum(savings.amount) })
      .from(savings)
      .innerJoin(members, eq(savings.memberId, members.id))
      .where(eq(members.cooperativeId, cooperativeId));
      
    const totalLoansRes = await db.select({ value: sum(loans.amount) })
      .from(loans)
      .innerJoin(members, eq(loans.memberId, members.id))
      .where(eq(members.cooperativeId, cooperativeId));
      
    const savingsCount = await db.select({ value: count() }).from(savings).innerJoin(members, eq(savings.memberId, members.id)).where(eq(members.cooperativeId, cooperativeId));
    const loansCount = await db.select({ value: count() }).from(loans).innerJoin(members, eq(loans.memberId, members.id)).where(eq(members.cooperativeId, cooperativeId));

    const transaksi = savingsCount[0].value + loansCount[0].value;
    
    const asetKas = Number(totalSavingsRes[0].value || 0) * 0.6;
    const asetPinjaman = Number(totalLoansRes[0].value || 0);

    return {
      transaksi,
      anggotaBaru,
      omzetHarian: transaksi > 0 ? transaksi * 500000 : 0, // Mock dynamic value based on transactions
      umkmAktif: Math.max(1, Math.floor(anggotaBaru / 3)), // Mock dynamic value based on members
      asetKas,
      asetPinjaman
    };
  } catch (error) {
    console.error("Koperasi Stats Error:", error);
    return { transaksi: 0, anggotaBaru: 0, omzetHarian: 0, umkmAktif: 0, asetKas: 0, asetPinjaman: 0 };
  }
}

export async function submitProposal(memberId: number, title: string, description: string) {
  try {
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member || !member.cooperativeId) {
      return { success: false, error: "Anggota tidak terikat ke koperasi." };
    }

    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress || progress.level < 20) {
      return { success: false, error: "Level tidak mencukupi. Anda harus minimal Level 20 untuk membuat proposal." };
    }

    const [proposal] = await db.insert(proposals).values({
      title,
      description,
      status: 'pending_approval',
      creatorId: memberId,
      targetQuorumPercentage: 50,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      cooperativeId: member.cooperativeId,
    }).returning();

    const { createNotification } = await import("./notifications");
    await createNotification(
      memberId,
      "Proposal Berhasil Diajukan",
      `Proposal "${title}" telah diajukan dan sedang menunggu persetujuan admin.`
    );

    return { success: true, proposal };
  } catch (error) {
    console.error("Submit Proposal Error:", error);
    return { success: false, error: "Gagal membuat proposal." };
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

export async function getPendingProposals(cooperativeId: number) {
  try {
    return await db.select().from(proposals).where(and(eq(proposals.status, 'pending_approval'), eq(proposals.cooperativeId, cooperativeId)));
  } catch (error) {
    console.error("Get Pending Proposals Error:", error);
    return [];
  }
}

export async function approveProposal(proposalId: number) {
  try {
    await db.update(proposals).set({ status: 'active', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }).where(eq(proposals.id, proposalId));
    return { success: true };
  } catch (error) {
    console.error("Approve Proposal Error:", error);
    return { success: false, error: "Failed to approve proposal" };
  }
}

export async function rejectProposal(proposalId: number) {
  try {
    await db.update(proposals).set({ status: 'rejected' }).where(eq(proposals.id, proposalId));
    return { success: true };
  } catch (error) {
    console.error("Reject Proposal Error:", error);
    return { success: false, error: "Failed to reject proposal" };
  }
}

export async function createProposalByAdmin(cooperativeId: number, title: string, description: string) {
  try {
    await db.insert(proposals).values({
      title,
      description,
      status: 'active',
      targetQuorumPercentage: 50,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      cooperativeId,
    });
    return { success: true };
  } catch (error) {
    console.error("Admin Create Proposal Error:", error);
    return { success: false, error: "Gagal membuat proposal." };
  }
}

export async function editProposal(proposalId: number, title: string, description: string) {
  try {
    await db.update(proposals).set({ title, description }).where(eq(proposals.id, proposalId));
    return { success: true };
  } catch (error) {
    console.error("Edit Proposal Error:", error);
    return { success: false, error: "Gagal mengedit proposal." };
  }
}
