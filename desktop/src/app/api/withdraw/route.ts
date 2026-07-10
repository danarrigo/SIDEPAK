import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { disbursements, members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Xendit } from 'xendit-node';

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'dummy_key',
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get member details
    const [member] = await db.select().from(members).where(eq(members.userId, user.id));
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const { amount, bankCode, accountNumber, accountName } = await request.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ success: false, error: 'Minimal penarikan adalah Rp 10.000' }, { status: 400 });
    }

    // Generate unique external ID for this transaction
    const externalId = `withdraw-${member.id}-${Date.now()}`;

    // Insert pending disbursement to database
    const [newDisbursement] = await db.insert(disbursements).values({
      memberId: member.id,
      amount,
      bankCode,
      accountNumber,
      accountName,
      status: 'PENDING',
      externalId,
    }).returning();

    // Deduct saldo dompet
    const { memberProgress } = await import('@/db/schema/gamification');
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, member.id));
    if (!progress || progress.walletBalance < amount) {
      return NextResponse.json({ success: false, error: 'Saldo dompet tidak mencukupi' }, { status: 400 });
    }

    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance - amount,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, member.id));

    // In a real scenario with Xendit keys configured, we call Xendit API
    if (process.env.XENDIT_SECRET_KEY) {
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
    } else {
      console.warn('XENDIT_SECRET_KEY is not set. Simulating success request.');
    }

    return NextResponse.json({ success: true, data: newDisbursement });
  } catch (error: any) {
    console.error("Withdraw Route Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Terjadi kesalahan sistem' 
    }, { status: 500 });
  }
}
