"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/actions/auth";

export default function OnboardingPaywall({ isActive, memberId }: { isActive: boolean, memberId: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const [isPaid, setIsPaid] = useState(isActive);

  useEffect(() => {
    if (isPaid) return;

    let isChecking = false;

    const checkStatus = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const { verifyAndPaySimpananPokok } = await import("@/actions/wallet");
        const res = await verifyAndPaySimpananPokok(memberId);
        if (res.success) {
          setIsPaid(true);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        isChecking = false;
      }
    };

    const intervalId = setInterval(checkStatus, 5000);
    return () => clearInterval(intervalId);
  }, [isPaid, memberId]);

  if (isPaid || isActive) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    const { createTopUpInvoice } = await import("@/actions/wallet");
    const res = await createTopUpInvoice(memberId, 100000);
    if (res.success && res.invoiceUrl) {
      window.open(res.invoiceUrl, "_blank");
    } else {
      alert(res.error || "Gagal membuat invoice");
    }
    setIsProcessing(false);
  };

  const handleCheckPayment = async () => {
    setIsProcessing(true);
    const { verifyAndPaySimpananPokok } = await import("@/actions/wallet");
    const res = await verifyAndPaySimpananPokok(memberId);
    if (res.success) {
      alert("Pembayaran berhasil! Membuka akses Dashboard...");
      router.push("/savings");
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } else {
      alert(res.error || "Pembayaran belum terverifikasi");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-slide-up">
        {/* Header Graphic */}
        <div className="bg-[#0F172A] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-tertiary/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 bg-white/10 w-20 h-20 rounded-full mx-auto flex items-center justify-center border border-white/20 mb-4 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            <span className="material-symbols-outlined text-[#FACC15] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          </div>
          
          <h2 className="text-2xl font-black text-white relative z-10">Satu Langkah Lagi!</h2>
          <p className="text-white/70 text-sm mt-2 relative z-10">Untuk mengakses Dashboard, Anda wajib melunasi Simpanan Pokok & Wajib bulan ini.</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center">Fasilitas Eksklusif Anggota</h3>
            
            <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sports_kabaddi</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Arena Bertanding</h4>
                <p className="text-xs text-slate-500 mt-0.5">Ikuti pertandingan mingguan dan menangkan hadiah poin melimpah.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Akses Marketplace</h4>
                <p className="text-xs text-slate-500 mt-0.5">Beli dan jual barang fisik dengan anggota koperasi lainnya menggunakan Poin.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Hak Suara Governance</h4>
                <p className="text-xs text-slate-500 mt-0.5">Ikut serta dalam pengambilan keputusan penting koperasi.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-800/20 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-lg">
                {isProcessing ? 'hourglass_empty' : 'payments'}
              </span>
              {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
            <button 
              onClick={handleCheckPayment}
              disabled={isProcessing}
              className="w-full mt-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-lg text-primary">
                sync
              </span>
              Saya Sudah Bayar
            </button>
            <div className="text-center mt-4">
              <form action={logout}>
                <button 
                  type="submit"
                  className="text-slate-400 hover:text-rose-500 font-bold text-xs py-2 transition-colors"
                >
                  Keluar dari Akun
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
