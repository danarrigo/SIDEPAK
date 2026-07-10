"use client";

import { useState } from "react";
import { repayLoanFromWallet } from "@/actions/financials";
import { useRouter } from "next/navigation";

export default function PayLoanButton({ memberId, loanId }: { memberId: number, loanId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    const res = await repayLoanFromWallet(memberId, loanId);
    if (res?.success) {
      alert("Pinjaman berhasil dilunasi!");
      router.refresh();
    } else {
      alert(res?.error || "Gagal melunasi pinjaman.");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handlePay}
      disabled={loading}
      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-[10px] font-bold hover:bg-primary/90 transition-colors tracking-widest disabled:opacity-50"
    >
      {loading ? "MEMPROSES..." : "BAYAR"}
    </button>
  );
}
