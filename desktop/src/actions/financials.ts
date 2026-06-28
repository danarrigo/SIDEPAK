"use server";
import { db } from "@/db";
import { savings, loans, dues } from "@/db/schema/financials";
import { walletTransactions } from "@/db/schema/wallet";
import { eq, and, or, desc } from "drizzle-orm";
import { awardPoints, getMemberProgress } from "@/actions/gamification";

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
    
    return { 
      savings: memberSavings, 
      loans: memberLoans, 
      dues: memberDues, 
      walletTransactions: memberWalletTxs,
      totalSavings: totalKonsolidasi,
      simpananPokok,
      simpananWajib,
      simpananSukarela
    };
  } catch (error) {
    console.error("Financials DB Error:", error);
    return { savings: [], loans: [], dues: [], totalSavings: 0, simpananPokok: 0, simpananWajib: 0, simpananSukarela: 0 };
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
