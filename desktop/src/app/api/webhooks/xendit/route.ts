import { NextResponse } from 'next/server';
import { db } from '@/db';
import { disbursements, savings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // 1. Verify Webhook Token
    const webhookToken = request.headers.get('x-callback-token');
    
    // Note: In development/sandbox you might comment this out if testing with Postman
    if (process.env.XENDIT_WEBHOOK_TOKEN && webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    // 2. Parse payload
    const payload = await request.json();
    console.log('Received Xendit Webhook:', payload);

    const externalId = payload.external_id;
    const status = payload.status; // 'COMPLETED' or 'FAILED'

    if (!externalId) {
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 });
    }

    // 3. Find the disbursement record
    const [disbursement] = await db.select().from(disbursements).where(eq(disbursements.externalId, externalId));
    if (!disbursement) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Avoid double processing
    if (disbursement.status === 'COMPLETED' || disbursement.status === 'FAILED') {
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    if (status === 'COMPLETED') {
      // Update disbursement status
      await db.update(disbursements)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(eq(disbursements.id, disbursement.id));

      // Update description di savings
      await db.update(savings)
        .set({ description: `Penarikan ke ${disbursement.bankCode} (${disbursement.accountNumber}) - BERHASIL` })
        .where(eq(savings.memberId, disbursement.memberId)); // In a real app we'd map this better with a transaction ID

      console.log(`Disbursement ${externalId} COMPLETED.`);
    } else if (status === 'FAILED') {
      // Update status to failed
      await db.update(disbursements)
        .set({ status: 'FAILED', updatedAt: new Date() })
        .where(eq(disbursements.id, disbursement.id));
        
      // OPSI A: Kembalikan saldo karena gagal
      await db.insert(savings).values({
        memberId: disbursement.memberId,
        amount: Math.abs(disbursement.amount), // Kembalikan saldo (positif)
        type: 'deposit',
        description: `Pengembalian dana (Gagal penarikan) ke ${disbursement.bankCode}`,
      });

      console.log(`Disbursement ${externalId} FAILED. Saldo dikembalikan.`);
    }

    // 4. Return 200 OK so Xendit knows we received it
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
