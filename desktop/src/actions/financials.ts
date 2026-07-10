"use server";
import { db } from "@/db";
import { savings, loans, dues } from "@/db/schema/financials";
import { walletTransactions, disbursements } from "@/db/schema/wallet";
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
    const memberDisbursements = await db.select()
      .from(disbursements)
      .where(eq(disbursements.memberId, memberId))
      .orderBy(desc(disbursements.createdAt));
    
    const totalSavingsAmount = memberSavings.reduce((acc, curr) => acc + (curr.type === 'deposit' ? curr.amount : -curr.amount), 0);
    const paidInitialDues = memberDues.filter(d => d.type === 'initial' && d.status === 'paid');
    const simpananPokok = paidInitialDues.length > 0 ? paidInitialDues[0].amount : 0;
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

    const isMemberActive = isPokokPaid;
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
      disbursements: memberDisbursements,
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
      disbursements: [],
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
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member) return { success: false, error: "Anggota tidak ditemukan." };

    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    
    const { calculateMembershipScore, getRankFromScore, getRankLoanLimits } = await import("@/actions/rank");
    const score = calculateMembershipScore(progress?.level ?? 1, progress?.walletBalance ?? 0, progress?.creditScore ?? 0);
    const rank = getRankFromScore(score);
    const limits = getRankLoanLimits(rank);

    const { getGovernanceData } = await import("@/actions/governance");
    const gov = await getGovernanceData(member.cooperativeId ?? -1);
    const kasKoperasi = gov.asetKas;

    const maxPercentAmount = Math.floor(kasKoperasi * (limits.maxPercent / 100));
    const maxBorrowable = Math.min(limits.maxAmount, maxPercentAmount);

    if (amount > maxBorrowable) {
      return { 
        success: false, 
        error: `Jumlah pinjaman melebihi batas maksimum untuk rank ${rank}. Batas maksimum: Rp ${maxBorrowable.toLocaleString('id-ID')} (${limits.maxPercent}% dari kas koperasi daerah Rp ${kasKoperasi.toLocaleString('id-ID')} atau limit maksimum Rp ${limits.maxAmount.toLocaleString('id-ID')})`
      };
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

    // Get current progress or create if missing
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
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

    const { createNotification } = await import("./notifications");
    await createNotification(
      memberId, 
      "Pembayaran Berhasil", 
      `Terima kasih! Pembayaran ${type === 'initial' ? 'Simpanan Pokok' : 'Simpanan Wajib'} sebesar Rp ${amount.toLocaleString("id-ID")} telah berhasil.`
    );

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

    // Get current progress or create if missing
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
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

    const { createNotification } = await import("./notifications");
    await createNotification(
      memberId, 
      "Menabung Berhasil", 
      `Simpanan Sukarela sebesar Rp ${amount.toLocaleString("id-ID")} telah berhasil ditambahkan.`
    );

    return { success: true };
  } catch (error) {
    console.error("depositSavingsFromWallet Error:", error);
    return { success: false, error: "Terjadi kesalahan saat menabung dari dompet." };
  }
}

export async function withdrawSavingsToWallet(memberId: number, amount: number, description?: string) {
  try {
    if (amount <= 0) {
      return { success: false, error: "Jumlah penarikan harus lebih besar dari Rp 0" };
    }

    // Get current financials to check simpanan sukarela balance
    const financials = await getFinancialsData(memberId);
    if (financials.simpananSukarela < amount) {
      return { success: false, error: "Saldo simpanan sukarela Anda tidak mencukupi." };
    }

    // Get current progress or create if missing
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
    }

    // Insert savings record
    await db.insert(savings).values({
      memberId,
      amount,
      type: 'withdrawal',
      description: description || 'Tarik Simpanan Sukarela ke Dompet',
    });

    // Add to wallet balance
    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance + amount,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, memberId));

    return { success: true };
  } catch (error) {
    console.error("withdrawSavingsToWallet Error:", error);
    return { success: false, error: "Terjadi kesalahan saat menarik simpanan ke dompet." };
  }
}

export async function getPendingLoans(cooperativeId: number) {
  try {
    const pendingLoans = await db.select({
      id: loans.id,
      amount: loans.amount,
      createdAt: loans.createdAt,
      memberName: members.namaLengkap,
      memberId: members.id
    })
    .from(loans)
    .innerJoin(members, eq(loans.memberId, members.id))
    .where(and(
      eq(members.cooperativeId, cooperativeId),
      eq(loans.status, 'pending')
    ))
    .orderBy(desc(loans.createdAt));

    return pendingLoans;
  } catch (error) {
    console.error("getPendingLoans Error:", error);
    return [];
  }
}

export async function approveLoan(loanId: number) {
  try {
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));
    if (!loan || loan.status !== 'pending') {
      return { success: false, error: "Pinjaman tidak valid atau sudah diproses." };
    }

    // 1. Update loan status to approved
    await db.update(loans)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(loans.id, loanId));

    // 2. Get current wallet balance
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, loan.memberId));
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId: loan.memberId }).returning();
      progress = newProgress;
    }

    // 3. Add to wallet balance
    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance + loan.amount,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, loan.memberId));

    // 4. Create wallet transaction record so it shows up in history
    await db.insert(walletTransactions).values({
      memberId: loan.memberId,
      invoiceId: `PINJAMAN-KOPDES-${loanId}-${Date.now()}`,
      amount: loan.amount,
      status: 'paid'
    });

    // 5. Send notification
    const { createNotification } = await import("./notifications");
    await createNotification(
      loan.memberId, 
      "Pinjaman Disetujui! 🎉", 
      `Pinjaman Anda sebesar Rp ${loan.amount.toLocaleString("id-ID")} telah disetujui dan ditambahkan ke saldo dompet.`
    );

    return { success: true };
  } catch (error) {
    console.error("approveLoan Error:", error);
    return { success: false, error: "Terjadi kesalahan saat menyetujui pinjaman." };
  }
}

export async function rejectLoan(loanId: number) {
  try {
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));
    if (!loan || loan.status !== 'pending') {
      return { success: false, error: "Pinjaman tidak valid atau sudah diproses." };
    }

    await db.update(loans)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(loans.id, loanId));

    const { createNotification } = await import("./notifications");
    await createNotification(
      loan.memberId, 
      "Pinjaman Ditolak", 
      `Maaf, pengajuan pinjaman Anda sebesar Rp ${loan.amount.toLocaleString("id-ID")} belum dapat disetujui saat ini.`
    );

    return { success: true };
  } catch (error) {
    console.error("rejectLoan Error:", error);
    return { success: false, error: "Terjadi kesalahan saat menolak pinjaman." };
  }
}

export async function repayLoanFromWallet(memberId: number, loanId: number) {
  try {
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));
    if (!loan || loan.status !== 'approved' || loan.memberId !== memberId) {
      return { success: false, error: "Pinjaman tidak ditemukan atau belum aktif." };
    }

    const totalToPay = loan.amount + (loan.amount * loan.interestRate / 100);

    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress || progress.walletBalance < totalToPay) {
      return { success: false, error: `Saldo dompet tidak mencukupi (Butuh Rp ${totalToPay.toLocaleString("id-ID")}).` };
    }

    // Deduct wallet balance
    await db.update(memberProgress)
      .set({
        walletBalance: progress.walletBalance - totalToPay,
        updatedAt: new Date(),
      })
      .where(eq(memberProgress.memberId, memberId));

    // Update loan status to paid
    await db.update(loans)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(loans.id, loanId));

    // Send notification
    const { createNotification } = await import("./notifications");
    await createNotification(
      memberId, 
      "Pinjaman Lunas! ✅", 
      `Terima kasih! Pembayaran pinjaman sebesar Rp ${totalToPay.toLocaleString("id-ID")} telah berhasil dipotong dari dompet Anda.`
    );

    return { success: true };
  } catch (error) {
    console.error("repayLoanFromWallet Error:", error);
    return { success: false, error: "Terjadi kesalahan saat membayar pinjaman." };
  }
}
