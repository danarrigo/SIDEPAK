"use server";

import { db } from "@/db";
import { members, dues, loans, users, proposals, votes, memberProgress, cooperatives } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

export interface DimensionScore {
  key: string;
  label: string;
  weight: number;
  score: number; // 0-1
  weightedScore: number; // score * weight
  description: string;
  detail: string;
  icon: string;
  color: string;
}

export interface CoopHealthScore {
  cooperativeId: number;
  cooperativeName: string;
  healthScore: number; // 0-100
  healthLabel: "Sehat" | "Waspada" | "Kritis";
  dimensions: DimensionScore[];
  computedAt: string;
}

function getLabel(score: number): "Sehat" | "Waspada" | "Kritis" {
  if (score >= 60) return "Sehat";
  if (score >= 35) return "Waspada";
  return "Kritis";
}

export async function getCoopHealthScore(cooperativeId: number): Promise<CoopHealthScore | null> {
  try {
    // Fetch cooperative name
    const [coop] = await db
      .select({ name: cooperatives.name })
      .from(cooperatives)
      .where(eq(cooperatives.id, cooperativeId));

    if (!coop) return null;

    // ── D1: Kepatuhan Iuran (35%) ────────────────────────────────
    // Ratio of PAID dues to total dues for this cooperative's members
    const [duesData] = await db
      .select({
        totalDues: sql<number>`count(${dues.id})`,
        paidDues: sql<number>`sum(case when ${dues.status} = 'paid' then 1 else 0 end)`,
      })
      .from(dues)
      .innerJoin(members, eq(dues.memberId, members.id))
      .where(and(eq(members.cooperativeId, cooperativeId)));

    const totalDues = Number(duesData?.totalDues) || 0;
    const paidDues = Number(duesData?.paidDues) || 0;
    const d1 = totalDues > 0 ? paidDues / totalDues : 0;

    // ── D2: Penetrasi Digital Anggota (25%) ──────────────────────
    // Ratio of members who have a linked user account
    const [memberData] = await db
      .select({
        totalMembers: sql<number>`count(${members.id})`,
        withAccount: sql<number>`sum(case when ${members.userId} is not null then 1 else 0 end)`,
      })
      .from(members)
      .where(eq(members.cooperativeId, cooperativeId));

    const totalMembers = Number(memberData?.totalMembers) || 0;
    const withAccount = Number(memberData?.withAccount) || 0;
    const d2 = totalMembers > 0 ? withAccount / totalMembers : 0;

    // ── D3: Partisipasi Governance (20%) ─────────────────────────
    // Ratio of members who have voted in the last 90 days
    const [govData] = await db
      .select({
        uniqueVoters: sql<number>`count(distinct ${votes.memberId})`,
      })
      .from(votes)
      .innerJoin(proposals, eq(votes.proposalId, proposals.id))
      .where(
        and(
          eq(proposals.cooperativeId, cooperativeId),
          sql`${proposals.createdAt} > now() - interval '90 days'`
        )
      );

    const uniqueVoters = Number(govData?.uniqueVoters) || 0;
    // D3 is capped at 1.0: if even 1 member participates, a base score is given
    // Full score when >= 30% of members have voted
    const d3 = totalMembers > 0 ? Math.min(1, (uniqueVoters / totalMembers) / 0.3) : 0;

    // ── D4: Kesehatan Kredit (10%) ───────────────────────────────
    // Loan repayment rate: ratio of paid loans to all non-pending loans
    const [loanData] = await db
      .select({
        paidLoans: sql<number>`sum(case when ${loans.status} = 'paid' then 1 else 0 end)`,
        totalDecidedLoans: sql<number>`sum(case when ${loans.status} != 'pending' then 1 else 0 end)`,
      })
      .from(loans)
      .innerJoin(members, eq(loans.memberId, members.id))
      .where(eq(members.cooperativeId, cooperativeId));

    const paidLoans = Number(loanData?.paidLoans) || 0;
    const totalDecidedLoans = Number(loanData?.totalDecidedLoans) || 0;
    // If no loans exist, neutral score of 0.5 (data absence should not penalize)
    const d4 = totalDecidedLoans > 0 ? paidLoans / totalDecidedLoans : 0.5;

    // ── D5: Engagement Gamifikasi (10%) ──────────────────────────
    // Median XP (60%) + Median streak (40%) across the cooperative's members, log-normalized
    const progressData = await db
      .select({
        xp: memberProgress.xp,
        streak: memberProgress.currentStreak,
      })
      .from(memberProgress)
      .innerJoin(members, eq(memberProgress.memberId, members.id))
      .where(eq(members.cooperativeId, cooperativeId));

    let d5 = 0;
    if (progressData.length > 0) {
      const xpValues = progressData.map((p) => p.xp).sort((a, b) => a - b);
      const streakValues = progressData.map((p) => p.streak).sort((a, b) => a - b);
      const medianXp = xpValues[Math.floor(xpValues.length / 2)] || 0;
      const medianStreak = streakValues[Math.floor(streakValues.length / 2)] || 0;
      // Log normalize: assume 10000 XP and 30 days streak are "fully engaged"
      const xpNorm = Math.min(1, Math.log1p(medianXp) / Math.log1p(10000));
      const streakNorm = Math.min(1, Math.log1p(medianStreak) / Math.log1p(30));
      d5 = xpNorm * 0.6 + streakNorm * 0.4;
    }

    // ── Composite Score ──────────────────────────────────────────
    const healthScore = Math.round((d1 * 0.35 + d2 * 0.25 + d3 * 0.20 + d4 * 0.10 + d5 * 0.10) * 100);
    const healthLabel = getLabel(healthScore);

    const dimensions: DimensionScore[] = [
      {
        key: "d1",
        label: "Kepatuhan Iuran",
        weight: 35,
        score: d1,
        weightedScore: d1 * 0.35,
        description: `${paidDues} dari ${totalDues} iuran lunas`,
        detail:
          "Mengukur proporsi anggota yang memenuhi kewajiban iuran periodik. Indikator arus kas internal paling langsung.",
        icon: "payments",
        color: "#22c55e",
      },
      {
        key: "d2",
        label: "Penetrasi Digital",
        weight: 25,
        score: d2,
        weightedScore: d2 * 0.25,
        description: `${withAccount} dari ${totalMembers} anggota punya akun`,
        detail:
          "Proporsi anggota yang memiliki akun digital aktif di SIDEPAK. Mencerminkan keterlibatan digital basis keanggotaan.",
        icon: "devices",
        color: "#3b82f6",
      },
      {
        key: "d3",
        label: "Partisipasi Governance",
        weight: 20,
        score: Math.min(1, d3),
        weightedScore: Math.min(1, d3) * 0.20,
        description: `${uniqueVoters} anggota aktif voting (90 hari terakhir)`,
        detail:
          "Tingkat partisipasi anggota dalam keputusan kolektif melalui proposals dan voting. Proksi kematangan tata kelola.",
        icon: "how_to_vote",
        color: "#a855f7",
      },
      {
        key: "d4",
        label: "Kesehatan Kredit",
        weight: 10,
        score: d4,
        weightedScore: d4 * 0.10,
        description:
          totalDecidedLoans > 0
            ? `${paidLoans} dari ${totalDecidedLoans} pinjaman dilunasi`
            : "Belum ada data pinjaman",
        detail:
          "Tingkat pengembalian pinjaman. Koperasi dengan kredit macet menunjukkan masalah kapasitas manajemen fundamental.",
        icon: "account_balance",
        color: "#f59e0b",
      },
      {
        key: "d5",
        label: "Engagement Gamifikasi",
        weight: 10,
        score: d5,
        weightedScore: d5 * 0.10,
        description:
          progressData.length > 0
            ? `${progressData.length} anggota aktif di platform`
            : "Belum ada data aktivitas",
        detail:
          "Proksi momentum operasional melalui median XP dan streak anggota. Bobot rendah karena kesetaraan konstruk paling lemah.",
        icon: "local_fire_department",
        color: "#ef4444",
      },
    ];

    return {
      cooperativeId,
      cooperativeName: coop.name,
      healthScore,
      healthLabel,
      dimensions,
      computedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error computing coop health score:", error);
    return null;
  }
}
