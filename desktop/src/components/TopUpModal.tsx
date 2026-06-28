"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { createTopUpInvoice, verifyInvoicePayment } from "@/actions/wallet";

interface TopUpModalProps {
  memberId: number;
}

export default function TopUpModal({ memberId }: TopUpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(50000);
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setIsOpen(true);
    setInvoiceUrl(null);
    setInvoiceId(null);
    setVerificationStatus(null);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (verificationStatus === "paid") {
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      setError("Minimal top up adalah Rp 10.000");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const res = await createTopUpInvoice(memberId, amount);
      if (res.success && res.invoiceUrl && res.invoiceId) {
        setInvoiceUrl(res.invoiceUrl);
        setInvoiceId(res.invoiceId);
        window.open(res.invoiceUrl, "_blank");
      } else {
        setError(res.error || "Gagal membuat invoice");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyInvoicePayment(memberId, invoiceId);
      if (res.success) {
        if (res.status === "paid") {
          setVerificationStatus("paid");
        } else {
          setVerificationStatus("pending");
          setError("Pembayaran belum terdeteksi. Silakan selesaikan pembayaran Anda di halaman Xendit.");
        }
      } else {
        setError(res.error || "Gagal memverifikasi pembayaran");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat verifikasi");
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md"></div>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide bg-surface-container-high/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl relative transform transition-all animate-scale-up">
            
            {/* Decorative background gradients */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl pointer-events-none"></div>

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-white/10 transition-colors z-20"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-6 md:p-8 relative z-10">
              {!invoiceUrl ? (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="text-center pt-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
                      <span className="material-symbols-outlined text-3xl text-primary">
                        account_balance_wallet
                      </span>
                    </div>
                    <h3 className="font-headline-md text-2xl font-black text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface/70">Top Up Saldo</h3>
                    <p className="text-sm text-on-surface-variant mt-2 font-medium">Mau isi saldo berapa hari ini?</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Nominal Top Up</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-primary transition-colors">Rp</span>
                      <input
                        type="number"
                        required
                        min={10000}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-14 pr-5 py-4 bg-surface-container-highest/50 backdrop-blur-sm border-2 border-outline-variant/50 rounded-2xl text-on-surface font-black text-xl focus:border-primary focus:bg-surface-container-highest focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[50000, 100000, 500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-300 ${
                          amount === preset
                            ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/30 scale-105"
                            : "border-outline-variant/30 hover:border-primary/50 text-on-surface bg-surface-container-lowest/50 hover:bg-surface-container-highest"
                        }`}
                      >
                        {preset >= 1000000 ? `${preset/1000000}M` : preset >= 1000 ? `${preset/1000}k` : preset}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-error/10 border border-error/20 text-error text-sm rounded-xl flex items-start gap-3 animate-shake">
                      <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 text-on-primary font-bold rounded-2xl transition-all shadow-xl hover:shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Lanjutkan Pembayaran
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 text-center relative z-10 pt-2">
                  <div className="animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary to-tertiary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-tertiary/30 animate-pulse-slow">
                      <span className="material-symbols-outlined text-4xl text-on-tertiary">
                        receipt_long
                      </span>
                    </div>
                    <h3 className="font-headline-md text-2xl font-black text-on-surface mb-2">Invoice Dibuat!</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Halaman pembayaran Xendit telah dibuka.<br/>Silakan selesaikan pembayaran Anda.</p>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-inner">
                    <p className="text-xs text-on-surface-variant font-bold tracking-widest uppercase mb-1">Total Tagihan</p>
                    <p className="text-4xl font-black text-primary">Rp {amount.toLocaleString("id-ID")}</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-error/10 border border-error/20 text-error text-sm rounded-xl flex items-start gap-3 text-left animate-shake">
                      <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {verificationStatus === "paid" ? (
                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 text-green-500 rounded-3xl flex flex-col items-center gap-4 justify-center animate-scale-up">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <span className="material-symbols-outlined text-white text-3xl">check</span>
                      </div>
                      <div>
                        <p className="text-lg font-black">Top Up Berhasil!</p>
                        <p className="text-sm text-green-500/80 mt-1">Saldo dompet Anda sudah bertambah.</p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Selesai & Kembali
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full py-4 bg-tertiary text-on-tertiary font-bold rounded-2xl transition-all shadow-lg hover:shadow-tertiary/25 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? (
                          <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Cek Status Pembayaran
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => window.open(invoiceUrl, "_blank")}
                        className="w-full py-3 bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Buka Ulang Halaman Pembayaran
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-on-primary text-sm font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(var(--primary-rgb),0.3)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 relative z-10"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Top Up Saldo
      </button>

      {mounted && isOpen && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
