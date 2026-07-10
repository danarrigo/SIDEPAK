import { NextResponse } from 'next/server';
import { castVote, submitProposal } from "@/actions/governance";
import { claimQuestReward } from "@/actions/quests";
import { buyShopItem, listMarketplaceItem, buyMarketplaceItem } from "@/actions/shop";
import { useItem as applyItem } from "@/actions/gamification";
import { createTopUpInvoice, verifyInvoicePayment, verifyAndPaySimpananPokok } from "@/actions/wallet";
import { payDuesFromWallet, depositSavingsFromWallet, addLoan } from "@/actions/financials";
import { joinEvent, createEvent } from "@/actions/events";
import { matchmakeWeeklyBattle } from "@/actions/arena";
import { createSupabaseClient } from '@/utils/supabase/client-api';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { deleteNotification, createTestNotification } from "@/actions/notifications";
import { updateCurrentMemberPhone } from "@/actions/members";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

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
    // SECURITY: never trust body.memberId — always use token-derived memberId
    const memberId = member.id;

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
    } else if (action === 'verify-and-pay-simpanan-pokok') {
      result = await verifyAndPaySimpananPokok(memberId);
    } else if (action === 'pay-dues-wallet') {
      const { type } = body;
      result = await payDuesFromWallet(memberId, type);
    } else if (action === 'deposit-savings-wallet') {
      const { amount, description } = body;
      result = await depositSavingsFromWallet(memberId, amount, description);
    } else if (action === 'list-marketplace-item') {
      const { name, description, priceInPoints, stock, imageUrl } = body;
      result = await listMarketplaceItem({
        sellerId: memberId,
        name: name || '',
        description: description || '',
        priceInPoints: Number(priceInPoints) || 0,
        stock: Number(stock) || 1,
        imageUrl: imageUrl || undefined,
      });
    } else if (action === 'buy-marketplace-item') {
      const { itemId } = body;
      result = await buyMarketplaceItem(memberId, Number(itemId));
    } else if (action === 'join-event') {
      const { eventId } = body;
      result = await joinEvent(memberId, Number(eventId));
    } else if (action === 'create-event') {
      const { name, description, startDate, endDate } = body;
      result = await createEvent(memberId, name || '', description || '', new Date(startDate), new Date(endDate));
    } else if (action === 'matchmake-battle') {
      result = await matchmakeWeeklyBattle(memberId);
    } else if (action === 'withdraw-wallet') {
      let { amount, bankCode, accountNumber, accountName } = body;
      amount = Number(amount);
      bankCode = String(bankCode ?? '').trim();
      accountNumber = String(accountNumber ?? '').trim();
      accountName = String(accountName ?? '').trim();

      if (!Number.isFinite(amount) || amount < 10000) {
        result = { success: false, error: 'Minimal penarikan adalah Rp 10.000' };
      } else if (!bankCode || !accountNumber || !accountName) {
        result = { success: false, error: 'Data rekening/bank tidak lengkap' };
      } else {
        const { memberProgress } = await import('@/db/schema/gamification');
        const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
        if (!progress || progress.walletBalance < amount) {
          result = { success: false, error: 'Saldo dompet tidak mencukupi' };
        } else {
          // Generate unique external ID for this transaction
          const externalId = `withdraw-${memberId}-${Date.now()}`;

          // Insert pending disbursement to database
          const { disbursements } = await import('@/db/schema/wallet');
          const [newDisbursement] = await db.insert(disbursements).values({
            memberId: memberId,
            amount,
            bankCode,
            accountNumber,
            accountName,
            status: 'PENDING',
            externalId,
          }).returning();

          // Deduct saldo dompet
          await db.update(memberProgress)
            .set({
              walletBalance: progress.walletBalance - amount,
              updatedAt: new Date(),
            })
            .where(eq(memberProgress.memberId, memberId));

          // Simulate/execute Xendit payout if secret key is present
          if (process.env.XENDIT_SECRET_KEY) {
            try {
              const { Xendit } = await import('xendit-node');
              const xenditClient = new Xendit({
                secretKey: process.env.XENDIT_SECRET_KEY,
              });
              const payoutResponse = await xenditClient.Payout.createPayout({
                idempotencyKey: externalId,
                data: {
                  referenceId: externalId,
                  amount: amount,
                  channelCode: bankCode,
                  channelProperties: {
                    accountHolderName: accountName,
                    accountNumber: accountNumber,
                  },
                  description: `Penarikan saldo koperasi oleh ${member.namaLengkap}`,
                  currency: 'IDR',
                }
              });
              console.log('Xendit Payout Created:', payoutResponse);
            } catch (e: any) {
              console.error("Xendit Payout Error:", e);
            }
          }

          result = { success: true, data: newDisbursement as any };
        }
      }
    } else if (action === 'delete-notification') {
      const { notificationId } = body;
      result = await deleteNotification(Number(notificationId));
    } else if (action === 'create-test-notification') {
      result = await createTestNotification(memberId);
    } else if (action === 'update-phone') {
      const { newPhone } = body;
      const normalizedPhone = String(newPhone ?? '').trim();
      if (normalizedPhone.length < 9) {
        result = { success: false, error: 'Nomor telepon tidak valid.' };
      } else {
        await db.update(members)
          .set({ nomorHp: normalizedPhone, updatedAt: new Date() })
          .where(eq(members.id, memberId));
        result = { success: true };
      }
    } else if (action === 'apply-loan') {
      const { amount } = body;
      result = await addLoan(memberId, Number(amount));
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
