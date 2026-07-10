'use client';
import { useState } from 'react';

export default function WithdrawForm() {
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('ID_BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          bankCode,
          accountNumber,
          accountName,
        }),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ text: 'Penarikan berhasil diproses! Saldo akan masuk setelah dikonfirmasi.', type: 'success' });
        setAmount('');
        setAccountNumber('');
        setAccountName('');
      } else {
        setMessage({ text: result.error || 'Terjadi kesalahan saat memproses penarikan.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Gagal terhubung ke server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 w-full max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Tarik Saldo</h2>
      </div>
      <p className="text-sm text-on-surface-variant mb-8 ml-13">Pindahkan saldo dompet digital Anda ke rekening bank pribadi.</p>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-primary-container/50 text-on-primary-container border border-primary-container' : 'bg-error-container/50 text-on-error-container border border-error-container'}`}>
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleWithdraw} className="space-y-5">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-on-surface mb-1.5">Jumlah Penarikan (Rp)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-on-surface-variant font-medium">Rp</span>
            </div>
            <input 
              id="amount"
              type="number" 
              required 
              min="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
              placeholder="50000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bankCode" className="block text-sm font-medium text-on-surface mb-1.5">Bank Tujuan</label>
          <div className="relative">
            <select 
              id="bankCode"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-xl p-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
            >
              <option value="ID_BCA">BCA (Bank Central Asia)</option>
              <option value="ID_MANDIRI">Bank Mandiri</option>
              <option value="ID_BNI">BNI (Bank Negara Indonesia)</option>
              <option value="ID_BRI">BRI (Bank Rakyat Indonesia)</option>
              <option value="ID_OVO">OVO E-Wallet</option>
              <option value="ID_DANA">DANA E-Wallet</option>
              <option value="ID_GOPAY">GoPay</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-on-surface mb-1.5">Nomor Rekening / No. HP</label>
          <input 
            id="accountNumber"
            type="text" 
            required 
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
            placeholder="Contoh: 1234567890"
          />
        </div>

        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-on-surface mb-1.5">Nama Pemilik Rekening</label>
          <input 
            id="accountName"
            type="text" 
            required 
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all"
            placeholder="Sesuai buku tabungan"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-semibold py-3.5 rounded-xl mt-6 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Memproses...
            </>
          ) : (
            <>
              Tarik Dana Sekarang
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
