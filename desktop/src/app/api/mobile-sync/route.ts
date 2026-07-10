 
import { NextResponse } from 'next/server';
import { getDashboardData } from "@/actions/dashboard";
import { getFinancialsData } from "@/actions/financials";
import { getActiveQuests } from "@/actions/quests";
import { getGovernanceData, getKoperasiStats } from "@/actions/governance";
import { getArenaData, getBattleHistory, getMemberStats } from "@/actions/arena";
import { getMemberBadges, getWinRate, getStoreItems, getLeaderboard, getLeaderboardProvincial, getLeaderboardNational, getMemberInventory, getClaimedChests } from "@/actions/gamification";
import { getMarketplaceItems } from "@/actions/shop";

import { getActiveMembers } from "@/actions/members";
import { getActiveLoan, getPendingLoans } from "@/actions/financials";
import { updateStreakOnActivity } from "@/actions/dashboard";
import { getMemberNotifications } from "@/actions/notifications";
import { getPendingProposals } from "@/actions/governance";
import { getPendingEvents } from "@/actions/events";
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { users, members, loans, savings, dues } from '@/db/schema';
import { votes } from '@/db/schema/governance';
import { eq, sql, and, ne, and as dbAnd } from 'drizzle-orm';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let memberId = -1;
    let cooperativeId = -1;
    let currentProvinsi: string | null = null;
    let userRole = 'member';

    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required: missing Bearer token' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    const token = authHeader.substring(7);
    const supabase = createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session token' },
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    
    const [userRecord] = await db.select().from(users).where(eq(users.id, user.id));
    if (userRecord) userRole = userRecord.role || 'member';

    const [member] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'No member profile linked to this account' },
        { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    memberId = member.id;
    if (member.cooperativeId) cooperativeId = member.cooperativeId;
    currentProvinsi = member.provinsi || null;

    // Record today's activity for the streak. Idempotent — safe to call on
    // every mobile-sync request; only writes when lastActivityDate is older
    // than today. The streak is derived from the previous date:
    //   yesterday -> streak += 1
    //   older/null -> streak = 1
    await updateStreakOnActivity(memberId);

    // Fetch Admin Stats if user is an admin
    let adminStats: any = null;
    if (userRole === 'admin' && cooperativeId !== -1) {
      const coopId = cooperativeId;
      const [coopStats] = await db.select({
        totalMembers: sql<number>`count(${members.id})`,
        activeMembers: sql<number>`sum(case when ${members.statusAnggota} = 'active' then 1 else 0 end)`,
      }).from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(
          and(
            eq(members.cooperativeId, coopId),
            ne(users.role, 'admin')
          )
        );

      const [loanStats] = await db.select({
        totalActiveLoans: sql<number>`sum(case when ${loans.status} = 'approved' then ${loans.amount} else 0 end)`
      })
      .from(loans)
      .innerJoin(members, eq(loans.memberId, members.id))
      .where(eq(members.cooperativeId, coopId));

      const [savingStats] = await db.select({
        totalDeposits: sql<number>`sum(case when ${savings.type} = 'deposit' then ${savings.amount} else 0 end)`,
        totalWithdrawals: sql<number>`sum(case when ${savings.type} = 'withdrawal' then ${savings.amount} else 0 end)`
      })
      .from(savings)
      .innerJoin(members, eq(savings.memberId, members.id))
      .where(eq(members.cooperativeId, coopId));

      const [dueStats] = await db.select({
        totalDues: sql<number>`sum(case when ${dues.status} = 'paid' then ${dues.amount} else 0 end)`
      })
      .from(dues)
      .innerJoin(members, eq(dues.memberId, members.id))
      .where(eq(members.cooperativeId, coopId));

      const loansByStatus = await db.select({
        status: loans.status,
        count: sql<number>`count(${loans.id})`,
        totalAmount: sql<number>`sum(${loans.amount})`,
      })
      .from(loans)
      .innerJoin(members, eq(loans.memberId, members.id))
      .where(eq(members.cooperativeId, coopId))
      .groupBy(loans.status);

      const activeLoansAmount = Number(loanStats?.totalActiveLoans) || 0;
      const netSavings = (Number(savingStats?.totalDeposits) || 0) - (Number(savingStats?.totalWithdrawals) || 0);
      const totalDuesPaid = Number(dueStats?.totalDues) || 0;
      const totalAssetsAmount = netSavings + totalDuesPaid;

      const pendingProposals = await getPendingProposals(coopId).catch(() => []);
      const pendingEvents = await getPendingEvents(coopId).catch(() => []);
      const pendingLoans = await getPendingLoans(coopId).catch(() => []);

      adminStats = {
        totalMembers: coopStats?.totalMembers || 0,
        activeMembers: coopStats?.activeMembers || 0,
        totalActiveLoans: activeLoansAmount,
        totalAssets: totalAssetsAmount,
        loansByStatus: loansByStatus,
        pendingProposals,
        pendingEvents,
        pendingLoans,
      };
    }

    // Fetch data sequentially to prevent connection pool exhaustion (max 15 connections)
    const dashboardData = await getDashboardData(memberId);
    const financialsData = await getFinancialsData(memberId);
    const questsData = await getActiveQuests(memberId);
    const governanceData = await getGovernanceData(cooperativeId);
    const activeProposal = governanceData?.activeProposals?.[0];
    let userVote: string | null = null;
    if (activeProposal && memberId !== -1) {
      const userVoteRes = await db.select().from(votes).where(
        dbAnd(
          eq(votes.memberId, memberId),
          eq(votes.proposalId, activeProposal.id)
        )
      ).catch(() => []);
      if (userVoteRes.length > 0) {
        userVote = userVoteRes[0].voteType;
      }
    }
    const arenaData = await getArenaData(memberId);
    const opponentId = arenaData?.activeBattles?.[0]?.opponent?.id;
    const myStats = await getMemberStats(memberId).catch(() => null);
    const opStats = opponentId ? await getMemberStats(opponentId).catch(() => null) : null;
    const koperasiStats = await getKoperasiStats(cooperativeId);
    const battleHistoryData = await getBattleHistory(memberId);
    const badgesData = await getMemberBadges(memberId);
    const winRateData = await getWinRate(memberId);
    const storeItemsData = await getStoreItems();
    const leaderboardData = await getLeaderboard(cooperativeId);
    const inventoryData = await getMemberInventory(memberId);
    const marketplaceData = await getMarketplaceItems(cooperativeId !== -1 ? cooperativeId : undefined);

    const leaderboardByProvinsi = currentProvinsi ? await getLeaderboardProvincial(currentProvinsi).catch(() => []) : [];
    const leaderboardByNasional = await getLeaderboardNational().catch(() => []);
    const activeMembersData = cooperativeId ? await getActiveMembers(cooperativeId).catch(() => []) : [];
    const activeLoanData = await getActiveLoan(memberId).catch(() => null);
    const notificationsData = await getMemberNotifications(memberId);
    const claimedChestsData = await getClaimedChests(memberId);

    return NextResponse.json({
      success: true,
      data: {
        dashboard: {
          ...dashboardData,
          level: dashboardData?.progress?.level ?? 1,
        },
        financials: financialsData,
        quests: questsData,
        claimedChests: claimedChestsData,
        governance: {
          ...governanceData,
          userVote,
        },
        arena: {
          ...arenaData,
          pastBattles: battleHistoryData?.pastBattles || [],
          myStats,
          opStats,
        },
        koperasiStats: koperasiStats,
        badges: badgesData,
        winRate: winRateData,
        storeItems: storeItemsData,
        leaderboard: leaderboardData,
        inventory: inventoryData,
        marketplaceItems: marketplaceData,
        adminStats,

        leaderboardByProvinsi,
        leaderboardByNasional: leaderboardByNasional,
        activeMembers: activeMembersData,
        activeLoan: activeLoanData,
        activeEffect: dashboardData?.progress?.activeEffect ?? null,
        notifications: notificationsData,
        profile: {
          id: member.id,
          email: user.email,
          namaLengkap: member.namaLengkap,
          nomorHp: member.nomorHp,
          provinsi: member.provinsi,
          kabupaten: member.kabupaten,
          kecamatan: member.kecamatan,
          desa: member.desa,
          pekerjaan: member.pekerjaan,
          cooperativeId: member.cooperativeId,
          role: userRole,
        },
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
