import { NextResponse } from 'next/server';
import { getDashboardData } from "@/actions/dashboard";
import { getFinancialsData } from "@/actions/financials";
import { getActiveQuests } from "@/actions/quests";
import { getGovernanceData, getKoperasiStats } from "@/actions/governance";
import { getArenaData } from "@/actions/arena";
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET() {
  try {
    let memberId = 1; // Fallback default

    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const [member] = await db.select().from(members).where(eq(members.userId, user.id));
        if (member) {
          memberId = member.id;
        }
      }
    }
    
    // Fetch all data concurrently
    const [dashboardData, financialsData, questsData, governanceData, arenaData, koperasiStats] = await Promise.all([
      getDashboardData(memberId),
      getFinancialsData(memberId),
      getActiveQuests(memberId),
      getGovernanceData(),
      getArenaData(memberId),
      getKoperasiStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dashboard: dashboardData,
        financials: financialsData,
        quests: questsData,
        governance: governanceData,
        arena: arenaData,
        koperasiStats: koperasiStats,
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
