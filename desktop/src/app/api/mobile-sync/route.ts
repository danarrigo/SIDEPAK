/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDashboardData } from "@/actions/dashboard";
import { getFinancialsData } from "@/actions/financials";
import { getActiveQuests } from "@/actions/quests";
import { getGovernanceData, getKoperasiStats } from "@/actions/governance";
import { getArenaData, getBattleHistory } from "@/actions/arena";
import { getMemberBadges, getWinRate, getStoreItems, getLeaderboard, getLeaderboardProvincial, getLeaderboardNational, getMemberInventory } from "@/actions/gamification";
import { getMarketplaceItems } from "@/actions/shop";
import { getEventsByCooperative, getMemberEventParticipations } from "@/actions/events";
import { getActiveMembers } from "@/actions/members";
import { getActiveLoan } from "@/actions/financials";
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let memberId = -1;
    let cooperativeId = -1;
    let currentProvinsi: string | null = null;

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
    
    // Fetch all data concurrently
    const [dashboardData, financialsData, questsData, governanceData, arenaData, koperasiStats, battleHistoryData, badgesData, winRateData, storeItemsData, leaderboardData, inventoryData, marketplaceData, eventsData, eventParticipationsData, leaderboardByProvinsi, leaderboardByNasional, activeMembersData, activeLoanData] = await Promise.all([
      getDashboardData(memberId),
      getFinancialsData(memberId),
      getActiveQuests(memberId),
      getGovernanceData(cooperativeId),
      getArenaData(memberId),
      getKoperasiStats(cooperativeId),
      getBattleHistory(memberId),
      getMemberBadges(memberId),
      getWinRate(memberId),
      getStoreItems(),
      getLeaderboard(cooperativeId),
      getMemberInventory(memberId),
      getMarketplaceItems(),
      getEventsByCooperative(cooperativeId),
      getMemberEventParticipations(memberId),
      currentProvinsi ? getLeaderboardProvincial(currentProvinsi).catch(() => []) : Promise.resolve([]),
      getLeaderboardNational().catch(() => []),
      cooperativeId ? getActiveMembers(cooperativeId).catch(() => []) : Promise.resolve([]),
      getActiveLoan(memberId).catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dashboard: {
          ...dashboardData,
          level: dashboardData?.progress?.level ?? 1,
        },
        financials: financialsData,
        quests: questsData,
        governance: governanceData,
        arena: {
          ...arenaData,
          pastBattles: battleHistoryData?.pastBattles || []
        },
        koperasiStats: koperasiStats,
        badges: badgesData,
        winRate: winRateData,
        storeItems: storeItemsData,
        leaderboard: leaderboardData,
        inventory: inventoryData,
        marketplaceItems: marketplaceData,
        events: (eventsData as any)?.events || [],
        joinedEventIds: ((eventParticipationsData as any)?.participations || []).map((p: any) => p?.event?.id).filter((id: any) => id != null),
        leaderboardByProvinsi,
        leaderboardByNasional: leaderboardByNasional,
        activeMembers: activeMembersData,
        activeLoan: activeLoanData,
        activeEffect: dashboardData?.progress?.activeEffect ?? null,
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
