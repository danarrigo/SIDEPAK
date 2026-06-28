"use server";
import { db } from "@/db";
import { savings, loans, dues } from "@/db/schema/financials";
import { walletTransactions } from "@/db/schema/wallet";
import { members } from "@/db/schema/members";
import { eq, and, or, desc } from "drizzle-orm";
import { awardPoints, getMemberProgress } from "@/actions/gamification";
import { memberProgress } from "@/db/schema/gamification";

export async function getFinancialsData(memberId: number) {
  try {
    const memberSavings = await db.select().from(savings).where(eq(savings.memberId, memberId));
    const memberLoans = await db.select().from(loans).where(eq(loans.memberId, memberId));
    const memberDues = await db.select().from(dues).where(eq(dues.memberId, memberId));
    const memberWalletTxs = await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.memberId, memberId))
      .orderBy(desc(walletTransactions.createdAt));
    
    const totalSavingsAmount = memberSavings.reduce((acc, curr) => acc + (curr.type === 'deposit' ? curr.amount : -curr.amount), 0);
    const simpananPokok = memberDues.filter(d => d.type === 'initial' && d.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const simpananWajib = memberDues.filter(d => d.type === 'monthly' && d.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const simpananSukarela = totalSavingsAmount;
    const totalKonsolidasi = simpananPokok + simpananWajib + simpananSukarela;
    
    // Status calculations
    const isPokokPaid = memberDues.some(d => d.type === 'initial' && d.status === 'paid');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isWajibPaidThisMonth = memberDues.some(d => {
      if (d.type !== 'monthly' || d.status !== 'paid') return false;
      const pDate = new Date(d.paymentDate);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });

    const isMemberActive = isPokokPaid && isWajibPaidThisMonth;
    const pendingWajibAmount = isWajibPaidThisMonth ? 0 : 50000;

    // Sync active status to members table
    const targetStatus = isMemberActive ? 'active' : 'inactive';
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (member && member.statusAnggota !== targetStatus) {
      await db.update(members)
        .set({ statusAnggota: targetStatus, updatedAt: new Date() })
        .where(eq(members.id, memberId));
    }
    
    return { 
      savings: memberSavings, 
      loans: memberLoans, 
      dues: memberDues, 
      walletTransactions: memberWalletTxs,
      totalSavings: totalKonsolidasi,
      simpananPokok,
      simpananWajib,
      simpananSukarela,
      isMemberActive,
      isPokokPaid,
      isWajibPaidThisMonth,
      pendingWajibAmount
    };
  } catch (error) {
    console.error("Financials DB Error:", error);
    return { 
      savings: [], 
      loans: [], 
      dues: [], 
      walletTransactions: [],
      totalSavings: 0, 
      simpananPokok: 0, 
      simpananWajib: 0, 
      simpananSukarela: 0,
      isMemberActive: false,
      isPokokPaid: false,
      isWajibPaidThisMonth: false,
      pendingWajibAmount: 50000
    };
  }
}

export async function addSaving(memberId: number, amount: number, description?: string) {
  try {
    const [saving] = await db.insert(savings).values({
      memberId,
      amount,
      type: 'deposit',
      description
    }).returning();
    
    // Award 100 points for saving
    await awardPoints(memberId, 100, 'saving', 'Menabung');
    
    return { success: true, saving };
  } catch(error) {
    console.error("Add Saving Error:", error);
    return { success: false, error: "Gagal menyimpan data." };
  }
}

export async function addLoan(memberId: number, amount: number) {
  try {
    // Max loan = points * 10,000
    const progress = await getMemberProgress(memberId);
    const maxLoan = (progress?.pointsBalance || 0) * 10000;
    
    if (amount > maxLoan) {
      return { success: false, error: `Plafon pinjaman tidak mencukupi. Maksimum: Rp ${maxLoan.toLocaleString('id-ID')}` };
    }

    const [loan] = await db.insert(loans).values({
      memberId,
      amount,
      interestRate: 2,
      status: 'pending'
    }).returning();
    
    // Award 200 points for meminjam duit
    await awardPoints(memberId, 200, 'loan', 'Meminjam dana');
    
    return { success: true, loan };
  } catch(error) {
    console.error("Add Loan Error:", error);
    return { success: false, error: "Gagal mengajukan pinjaman." };
  }
}

export async function payDues(memberId: number, amount: number, type: 'initial' | 'monthly') {
  try {
    const [due] = await db.insert(dues).values({
      memberId,
      amount,
      type,
      status: 'paid'
    }).returning();
    
    // Award 50 points for paying dues
    await awardPoints(memberId, 50, 'dues', 'Membayar iuran');
    
    return { success: true, due };
  } catch(error) {
    console.error("Pay Dues Error:", error);
    return { success: false, error: "Gagal membayar iuran." };
  }
}

export async function getActiveLoan(memberId: number) {
  try {
    const activeLoans = await db.select()
      .from(loans)
      .where(and(eq(loans.memberId, memberId), or(eq(loans.status, 'pending'), eq(loans.status, 'approved'))))
      .orderBy(desc(loans.createdAt));
      
    return activeLoans[0] || null;
  } catch (error) {
    console.error("Get Active Loan Error:", error);
    return null;
  }
}

export async function payDuesFromWallet(memberId: number, type: 'initial' | 'monthly') {
  try {
    const amount = type === 'initial' ? 100000 : 50000;

    // Get current progress
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      return { success: false, error: "Data progress member tidak ditemukan" };
    }

    if (progress.walletBalance < amount) {
      return { success: false, error: "Saldo dompet digital Anda tidak mencukupi." };
    }

    // Deduct wallet balance
    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance - amount,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, memberId));

    // Insert dues record
    await db.insert(dues).values({
      memberId,
      amount,
      type,
      status: 'paid',
    });

    // Award points
    await awardPoints(memberId, 50, 'dues', type === 'initial' ? 'Bayar Simpanan Pokok' : 'Bayar Simpanan Wajib');

    // Update statusAnggota in members
    await getFinancialsData(memberId);

    return { success: true };
  } catch (error) {
    console.error("payDuesFromWallet Error:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses pembayaran iuran." };
  }
}

export async function depositSavingsFromWallet(memberId: number, amount: number, description?: string) {
  try {
    if (amount <= 0) {
      return { success: false, error: "Jumlah simpanan harus lebih besar dari Rp 0" };
    }

    // Get current progress
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      return { success: false, error: "Data progress member tidak ditemukan" };
    }

    if (progress.walletBalance < amount) {
      return { success: false, error: "Saldo dompet digital Anda tidak mencukupi." };
    }

    // Deduct wallet balance
    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance - amount,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, memberId));

    // Insert savings record
    await db.insert(savings).values({
      memberId,
      amount,
      type: 'deposit',
      description: description || 'Simpanan Sukarela dari Dompet',
    });

    // Award points
    await awardPoints(memberId, 100, 'saving', 'Simpanan Sukarela');

    return { success: true };
  } catch (error) {
    console.error("depositSavingsFromWallet Error:", error);
    return { success: false, error: "Terjadi kesalahan saat menabung dari dompet." };
  }
}
