import { NextResponse } from 'next/server';
import { castVote, submitProposal } from "@/actions/governance";
import { claimQuestReward } from "@/actions/quests";
import { buyShopItem } from "@/actions/shop";
import { useItem as applyItem } from "@/actions/gamification";
import { createTopUpInvoice, verifyInvoicePayment } from "@/actions/wallet";
import { payDuesFromWallet, depositSavingsFromWallet } from "@/actions/financials";
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

    let result: { success: boolean; error?: string; updatedPoints?: number } & Record<string, unknown> = { success: false, error: "Invalid action" };

    if (action === 'vote') {
      const { proposalId, voteType } = body;
      // Map voteType from mobile app ('Setuju' -> 'agree', 'Tolak' -> 'reject', 'Abstain' -> 'abstain')
      const mappedVoteType = voteType === 'Setuju' ? 'agree' : voteType === 'Tolak' ? 'reject' : 'abstain';
      result = await castVote(memberId, proposalId || 1, mappedVoteType);
    } else if (action === 'toggle-quest') {
      const { questId } = body;
      result = await claimQuestReward(memberId, questId);
    } else if (action === 'buy-item') {
      const { itemId } = body;
      result = await buyShopItem(memberId, itemId);
    } else if (action === 'use-item') {
      const { itemId, targetMemberId } = body;
      result = await applyItem(memberId, itemId, targetMemberId);
    } else if (action === 'submit-proposal') {
      const { title, description } = body;
      result = await submitProposal(memberId, title, description);
    } else if (action === 'create-topup') {
      const { amount } = body;
      result = await createTopUpInvoice(memberId, amount);
    } else if (action === 'verify-topup') {
      const { invoiceId } = body;
      result = await verifyInvoicePayment(memberId, invoiceId);
    } else if (action === 'pay-dues-wallet') {
      const { type } = body;
      result = await payDuesFromWallet(memberId, type);
    } else if (action === 'deposit-savings-wallet') {
      const { amount, description } = body;
      result = await depositSavingsFromWallet(memberId, amount, description);
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
