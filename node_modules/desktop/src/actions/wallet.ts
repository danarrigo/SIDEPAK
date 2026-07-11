"use server";
import { db } from "@/db";
import { walletTransactions } from "@/db/schema/wallet";
import { memberProgress } from "@/db/schema/gamification";
import { eq, desc, and } from "drizzle-orm";

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || "";

function getAuthHeader() {
  const token = Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64");
  return `Basic ${token}`;
}

export async function createTopUpInvoice(memberId: number, amount: number) {
  try {
    if (!XENDIT_SECRET_KEY) {
      return { success: false, error: "Xendit API Key not configured" };
    }

    const externalId = `topup-member-${memberId}-${Date.now()}`;
    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount,
        description: "Top Up Dompet KopDes",
        currency: "IDR",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Xendit Invoice Creation Failed:", errorText);
      return { success: false, error: "Gagal membuat invoice ke Xendit" };
    }

    const data = await response.json();
    
    // Save transaction as pending
    await db.insert(walletTransactions).values({
      memberId,
      invoiceId: data.id,
      amount,
      status: "pending",
    });

    return {
      success: true,
      invoiceId: data.id,
      invoiceUrl: data.invoice_url,
    };
  } catch (error) {
    console.error("createTopUpInvoice Error:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat membuat invoice" };
  }
}

export async function verifyInvoicePayment(memberId: number, invoiceId: string) {
  try {
    if (!XENDIT_SECRET_KEY) {
      return { success: false, error: "Xendit API Key not configured" };
    }

    // Check database transaction
    const [tx] = await db.select().from(walletTransactions).where(eq(walletTransactions.invoiceId, invoiceId));
    if (!tx) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    if (tx.status === "paid") {
      const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
      return { success: true, status: "paid", walletBalance: progress?.walletBalance || 0 };
    }

    // Call Xendit to get status
    const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        "Authorization": getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Xendit Fetch Invoice Failed:", errorText);
      return { success: false, error: "Gagal memverifikasi status pembayaran ke Xendit" };
    }

    const data = await response.json();
    const isPaid = data.status === "PAID" || data.status === "SETTLED";

    if (isPaid) {
      // Update transaction status
      await db.update(walletTransactions)
        .set({ status: "paid" })
        .where(eq(walletTransactions.invoiceId, invoiceId));

      // Get current balance or create if missing
      let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
      if (!progress) {
        const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
        progress = newProgress;
      }

      const newBalance = progress.walletBalance + tx.amount;

      // Update member progress
      await db.update(memberProgress)
        .set({
          walletBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(memberProgress.memberId, memberId));

      const { createNotification } = await import("./notifications");
      await createNotification(memberId, "Top Up Berhasil", `Saldo dompet kamu telah bertambah sebesar Rp ${tx.amount.toLocaleString("id-ID")}.`);

      return { success: true, status: "paid", walletBalance: newBalance };
    }

    return { success: true, status: "pending", walletBalance: 0 };
  } catch (error) {
    console.error("verifyInvoicePayment Error:", error);
    return { success: false, error: "Terjadi kesalahan saat memverifikasi pembayaran" };
  }
}

export async function verifyAndPaySimpananPokok(memberId: number) {
  try {
    const { payDuesFromWallet } = await import("./financials");
    const [latestTx] = await db.select().from(walletTransactions)
      .where(eq(walletTransactions.memberId, memberId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(1);

    if (latestTx) {
      await verifyInvoicePayment(memberId, latestTx.invoiceId);
    }

    const payRes = await payDuesFromWallet(memberId, 'initial');
    if (!payRes.success) {
      return { success: false, error: "Pembayaran belum diselesaikan. Harap bayar di Xendit terlebih dahulu." };
    }

    return { success: true };
  } catch (err) {
    console.error("verifyAndPaySimpananPokok Error:", err);
    return { success: false, error: "Terjadi kesalahan sistem saat memverifikasi pembayaran." };
  }
}
