import { NextResponse } from 'next/server';
import { castVote } from "@/actions/governance";
import { toggleQuest } from "@/actions/quests";
import { buyShopItem } from "@/actions/shop";
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    let memberId = body.memberId || 1;

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

    let result: any = { success: false, error: "Invalid action" };

    if (action === 'vote') {
      const { proposalId, voteType } = body;
      // Map voteType from mobile app ('Setuju' -> 'agree', 'Tolak' -> 'reject', 'Abstain' -> 'abstain')
      const mappedVoteType = voteType === 'Setuju' ? 'agree' : voteType === 'Tolak' ? 'reject' : 'abstain';
      result = await castVote(memberId, proposalId || 1, mappedVoteType);
    } else if (action === 'toggle-quest') {
      const { questId } = body;
      result = await toggleQuest(memberId, questId);
    } else if (action === 'buy-item') {
      const { itemId, cost } = body;
      result = await buyShopItem(memberId, itemId, cost);
    }

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("API Action Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { 
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
