"use server";
import { db } from "@/db";
import { savings, loans, dues } from "@/db/schema/financials";
import { eq } from "drizzle-orm";

export async function getFinancialsData(memberId: number = 1) {
  try {
    const memberSavings = await db.select().from(savings).where(eq(savings.memberId, memberId));
    const memberLoans = await db.select().from(loans).where(eq(loans.memberId, memberId));
    const memberDues = await db.select().from(dues).where(eq(dues.memberId, memberId));
    
    const totalSavings = memberSavings.reduce((acc, curr) => acc + (curr.type === 'deposit' ? curr.amount : -curr.amount), 0);
    
    return { savings: memberSavings, loans: memberLoans, dues: memberDues, totalSavings };
  } catch (error) {
    console.error("Financials DB Error:", error);
    return { savings: [], loans: [], dues: [], totalSavings: 0 };
  }
}
