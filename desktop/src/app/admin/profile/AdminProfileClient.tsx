"use client";
import React, { useState, useTransition } from "react";
import { updateCurrentAdminProfile } from "@/actions/members";

export default function AdminProfileClient({ adminData }: { adminData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    namaLengkap: adminData.namaLengkap || "",
    nik: adminData.nik || "",
    nomorHp: adminData.nomorHp || "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Only send password if it's filled
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }
      
      const res = await updateCurrentAdminProfile(dataToSubmit);
      if (res.success) {
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: "" })); // reset password field
      } else {
        alert(res.error || "Gagal mengupdate profil.");
      }
    });
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl transition-all" />
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
        <span className="material-symbols-outlined text-tertiary">badge</span>
        Data Pribadi
      </h2>
      
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Lengkap</label>
            <div className="text-lg font-bold text-slate-900">{adminData.namaLengkap}</div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">NIK (Nomor Induk Kependudukan)</label>
            <div className="text-lg font-mono text-slate-900">{adminData.nik}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
            <div className="text-lg font-bold text-slate-900">{adminData.user.email}</div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nomor HP / WhatsApp</label>
            <div className="text-lg font-bold text-slate-900">{adminData.nomorHp || '-'}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
              <input 
                type="text" 
                required
                value={formData.namaLengkap}
                onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIK</label>
              <input 
                type="text" 
                required
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
              />
            </div>

            <div className="space-y-1.5 opacity-60">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Tidak dapat diubah)</label>
              <input 
                type="text" 
                disabled
                value={adminData.user.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor HP / WhatsApp</label>
              <input 
                type="tel" 
                value={formData.nomorHp}
                onChange={(e) => setFormData({...formData, nomorHp: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kata Sandi Baru (Opsional)</label>
              <input 
                type="password" 
                placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
              />
              <p className="text-[10px] text-slate-400">Minimal 6 karakter jika ingin diubah.</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  namaLengkap: adminData.namaLengkap || "",
                  nik: adminData.nik || "",
                  nomorHp: adminData.nomorHp || "",
                  password: "",
                });
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 text-tertiary px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end relative z-10">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-900 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profil
          </button>
        </div>
      )}
    </div>
  );
}
