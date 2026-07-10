import React from 'react';
import WithdrawForm from '@/components/WithdrawForm';
import Link from 'next/link';

export default function WithdrawPage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 w-full max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-2 animate-slide-up">
          <Link
            href="/savings"
            className="p-2 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-black text-on-surface">Tarik Tunai</h1>
        </div>
        <p className="text-sm text-on-surface-variant ml-12 animate-slide-up">
          Tarik simpanan Anda langsung ke rekening bank.
        </p>
        <div className="animate-slide-up delay-100">
          <WithdrawForm />
        </div>
      </div>
    </main>
  );
}
