/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { payDuesFromWallet, depositSavingsFromWallet } from '@/actions/financials';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SavingsClient({ memberId, walletBalance, financials }: {
  memberId: number,
  walletBalance: number,
  financials: any
}) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const totalSimpanan = financials.simpananPokok + financials.simpananWajib + financials.simpananSukarela;

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePayDues = async (type: 'initial' | 'monthly') => {
    setLoadingType(type);
    const res = await payDuesFromWallet(memberId, type);
    if (res.success) {
      showMessage(`Pembayaran Simpanan ${type === 'initial' ? 'Pokok' : 'Wajib'} berhasil!`, 'success');
      router.refresh();
    } else {
      showMessage(res.error || 'Terjadi kesalahan.', 'error');
    }
    setLoadingType(null);
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showMessage('Masukkan jumlah simpanan yang valid.', 'error');
      return;
    }
    if (amount > walletBalance) {
      showMessage('Saldo dompet digital Anda tidak mencukupi.', 'error');
      return;
    }

    setLoadingType('deposit');
    const res = await depositSavingsFromWallet(memberId, amount, 'Simpanan Sukarela Mandiri');
    if (res.success) {
      showMessage('Simpanan Sukarela berhasil ditambahkan!', 'success');
      setDepositAmount('');
      router.refresh();
    } else {
      showMessage(res.error || 'Terjadi kesalahan.', 'error');
    }
    setLoadingType(null);
  };

  // Combine and sort transactions
  const combinedTxs = [];
  for (const s of (financials.savings || [])) {
    combinedTxs.push({
      type: 'savings',
      label: s.description || 'Simpanan Sukarela',
      amount: s.amount,
      isPositive: s.type === 'deposit',
      rawDate: new Date(s.createdAt)
    });
  }
  for (const d of (financials.dues || [])) {
    if (d.status === 'paid') {
      combinedTxs.push({
        type: 'dues',
        label: d.type === 'initial' ? 'Simpanan Pokok' : 'Simpanan Wajib',
        amount: d.amount,
        isPositive: true,
        rawDate: new Date(d.paymentDate || d.createdAt)
      });
    }
  }
  combinedTxs.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/" className="p-2 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-black text-on-surface">Kelola Simpanan & Mutasi</h1>
            </div>
            <p className="text-sm text-on-surface-variant ml-12">Pantau dan kelola kewajiban simpanan Koperasi Anda dari satu tempat.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-surface-container-highest px-6 py-4 border border-outline-variant/30 rounded-2xl ml-12 md:ml-0 shadow-sm">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Saldo Dompet Digital</p>
              <p className="text-xl font-black text-on-surface mt-1">Rp {walletBalance.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border animate-fade-in ${message.type === 'success' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-error/10 border-error/30 text-error'}`}>
            <p className="font-bold text-sm">{message.text}</p>
          </div>
        )}

        {/* Total Overview */}
        <div className="glass-card animate-slide-up delay-100 border border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-xs uppercase font-extrabold tracking-widest text-on-surface-variant mb-2">TOTAL SIMPANAN ANDA</p>
          <h2 className="text-4xl font-black text-primary">Rp {totalSimpanan.toLocaleString('id-ID')}</h2>
        </div>

        {/* Savings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-200">
          
          {/* Simpanan Pokok */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-on-surface text-lg">Simpanan Pokok</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Dibayar 1x saat bergabung</p>
                </div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${financials.isPokokPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                  {financials.isPokokPaid ? 'LUNAS' : 'WAJIB BAYAR'}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 mb-6">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Total Terbayar</p>
                <p className="text-xl font-black text-on-surface mt-1">Rp {financials.simpananPokok.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            {!financials.isPokokPaid && (
              <button 
                onClick={() => handlePayDues('initial')}
                disabled={loadingType === 'initial'}
                className="w-full py-3 rounded-xl bg-on-surface text-surface font-bold text-sm hover:bg-on-surface/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loadingType === 'initial' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                Bayar Rp 100.000
              </button>
            )}
          </div>

          {/* Simpanan Wajib */}
          <div className="glass-card border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-on-surface text-lg">Simpanan Wajib</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Dibayar setiap bulan</p>
                </div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${financials.isWajibPaidThisMonth ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                  {financials.isWajibPaidThisMonth ? 'LUNAS BULAN INI' : 'TUNGGAKAN'}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 mb-6">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Total Terbayar</p>
                <p className="text-xl font-black text-on-surface mt-1">Rp {financials.simpananWajib.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            {!financials.isWajibPaidThisMonth && (
              <button 
                onClick={() => handlePayDues('monthly')}
                disabled={loadingType === 'monthly'}
                className="w-full py-3 rounded-xl bg-on-surface text-surface font-bold text-sm hover:bg-on-surface/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loadingType === 'monthly' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                Bayar Rp 50.000
              </button>
            )}
          </div>

          {/* Simpanan Sukarela */}
          <div className="glass-card border border-primary/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_rgba(22,163,74,0.1)]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-on-surface text-lg text-primary">Simpanan Sukarela</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Bebas menabung kapan saja</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">savings</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 mb-4">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Total Saldo</p>
                <p className="text-xl font-black text-on-surface mt-1">Rp {financials.simpananSukarela.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">Rp</span>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Jumlah Simpanan"
                  className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                />
              </div>
              <button 
                onClick={handleDeposit}
                disabled={loadingType === 'deposit' || !depositAmount}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loadingType === 'deposit' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
                Setor Simpanan
              </button>
            </div>
          </div>

        </div>

        {/* Transactions History */}
        <div className="glass-card animate-slide-up delay-300 border border-outline-variant rounded-2xl p-6">
          <h3 className="font-bold text-on-surface text-lg mb-6">Mutasi Transaksi & Riwayat</h3>
          
          {combinedTxs.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant text-sm">
              Belum ada riwayat transaksi.
            </div>
          ) : (
            <div className="space-y-4">
              {combinedTxs.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.isPositive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                      <span className="material-symbols-outlined text-lg">
                        {tx.isPositive ? 'add_circle' : 'remove_circle'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{tx.label}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {tx.rawDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {tx.type === 'dues' ? 'Iuran' : 'Simpanan'}
                      </p>
                    </div>
                  </div>
                  <div className={`font-black ${tx.isPositive ? 'text-primary' : 'text-error'}`}>
                    {tx.isPositive ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
