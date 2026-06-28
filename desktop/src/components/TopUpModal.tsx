"use client";
import React, { useState } from "react";
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

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-2 px-4 bg-primary text-on-primary hover:bg-primary/95 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
      >
        Top Up Saldo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-container-high rounded-3xl border border-outline-variant p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {!invoiceUrl ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-primary bg-primary/10 p-3 rounded-2xl mb-2 inline-block">
                    account_balance_wallet
                  </span>
                  <h3 className="text-xl font-black text-on-surface">Top Up Saldo Dompet</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Masukkan jumlah saldo yang ingin Anda tambahkan.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Jumlah (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">Rp</span>
                    <input
                      type="number"
                      required
                      min={10000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline rounded-xl text-on-surface font-bold focus:border-primary focus:outline-none transition-colors"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[20000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        amount === preset
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-outline hover:border-on-surface-variant text-on-surface"
                      }`}
                    >
                      {preset.toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Lanjutkan Pembayaran"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div>
                  <span className="material-symbols-outlined text-4xl text-tertiary bg-tertiary/10 p-3 rounded-2xl mb-2 inline-block">
                    credit_card
                  </span>
                  <h3 className="text-xl font-black text-on-surface">Invoice Pembayaran Dibuat</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Invoice Xendit telah dibuka di tab baru.</p>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant space-y-2">
                  <p className="text-xs text-on-surface-variant">Jumlah Top Up</p>
                  <p className="text-2xl font-black text-on-surface">Rp {amount.toLocaleString("id-ID")}</p>
                </div>

                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-xl flex items-center gap-2 text-left">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {verificationStatus === "paid" ? (
                  <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex flex-col items-center gap-2 justify-center">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                    <p className="text-sm font-bold">Top Up Berhasil!</p>
                    <p className="text-xs text-on-surface-variant">Saldo Anda telah diperbarui.</p>
                    <button
                      onClick={handleClose}
                      className="mt-2 w-full py-2 bg-primary text-on-primary font-bold rounded-xl"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open(invoiceUrl, "_blank")}
                      className="w-full py-3 border border-outline hover:border-on-surface-variant text-on-surface font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Buka Kembali Halaman Pembayaran
                    </button>

                    <button
                      onClick={handleVerify}
                      disabled={loading}
                      className="w-full py-3 bg-tertiary text-on-tertiary font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Cek Status Pembayaran"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
