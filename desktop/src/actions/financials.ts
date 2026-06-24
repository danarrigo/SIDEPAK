"use server";
import { db } from "@/db";
import { savings, loans, dues } from "@/db/schema/financials";
import { eq } from "drizzle-orm";

export async function getFinancialsData(memberId: number) {
  try {
    const memberSavings = await db.select().from(savings).where(eq(savings.memberId, memberId));
    const memberLoans = await db.select().from(loans).where(eq(loans.memberId, memberId));
    const memberDues = await db.select().from(dues).where(eq(dues.memberId, memberId));
    
    const totalSavingsAmount = memberSavings.reduce((acc, curr) => acc + (curr.type === 'deposit' ? curr.amount : -curr.amount), 0);
    const simpananPokok = memberDues.filter(d => d.type === 'initial' && d.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const simpananWajib = memberDues.filter(d => d.type === 'monthly' && d.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const simpananSukarela = totalSavingsAmount;
    const totalKonsolidasi = simpananPokok + simpananWajib + simpananSukarela;
    
    return { 
      savings: memberSavings, 
      loans: memberLoans, 
      dues: memberDues, 
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
