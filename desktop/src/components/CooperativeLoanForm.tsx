"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addLoan } from "@/actions/financials";

interface CooperativeLoanFormProps {
  memberId: number;
  rankName: string;
  maxPercent: number;
  maxAmount: number;
  kasKoperasi: number;
  maxBorrowable: number;
}

export default function CooperativeLoanForm({
  memberId,
  rankName,
  maxPercent,
  maxAmount,
  kasKoperasi,
  maxBorrowable,
}: CooperativeLoanFormProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      setError("Masukkan jumlah pinjaman yang valid.");
      return;
    }

    if (amt > maxBorrowable) {
      setError(
        `Jumlah melebihi batas maksimum Rp ${maxBorrowable.toLocaleString("id-ID")}`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await addLoan(memberId, amt);
      if (res.success) {
        setSuccess("Pengajuan pinjaman berhasil diajukan!");
        setAmount("");
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(null);
          window.location.reload();
        }, 1500);
      } else {
        setError(res.error || "Gagal mengajukan pinjaman.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Pengajuan Pinjaman Kas Koperasi
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pinjam langsung dari kas daerah koperasi Anda. Limit disesuaikan dengan Rank Anda.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs text-slate-700 space-y-2 border border-slate-100">
          <div className="flex justify-between">
            <span>Rank Anda:</span>
            <span className="font-bold text-primary">{rankName}</span>
          </div>
          <div className="flex justify-between">
            <span>Ketentuan Rank:</span>
            <span className="font-semibold">
              Maks {maxPercent}% Kas & Rp {maxAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span>Kas Koperasi Daerah:</span>
            <span className="font-semibold">Rp {kasKoperasi.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-dashed pt-2 mt-2">
            <span>Maks. Pinjaman:</span>
            <span>Rp {maxBorrowable.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Pinjaman (Rupiah)
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 5000000"
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold">
              {success}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 px-4 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#0F172A] text-white hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? "Memproses..." : "Ajukan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-xl font-bold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors"
      >
        Ajukan Pinjaman Kas Koperasi
      </button>

      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </div>
  );
}
