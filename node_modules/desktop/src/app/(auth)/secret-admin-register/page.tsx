"use client";
import React, { useActionState } from "react";
import Link from "next/link";
import { signupAdmin } from "@/actions/auth";

const initialState = {
  error: "",
};

export default function AdminSignupPage() {
  const [state, formAction, pending] = useActionState(signupAdmin, initialState);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0F172A] p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="mb-8 text-center relative z-10">
          <div className="inline-block bg-slate-900 text-tertiary p-3 rounded-2xl mb-4 shadow-lg">
            <span className="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Registrasi Pengurus</h1>
          <p className="text-sm text-slate-500 mt-2">Halaman rahasia untuk mendaftar sebagai Admin Koperasi</p>
        </div>

        <form action={formAction} className="space-y-6 relative z-10">
          {state?.error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="namaLengkap">Nama Lengkap</label>
              <input id="namaLengkap" name="namaLengkap" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="John Doe" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nik">NIK (16 Digit)</label>
              <input id="nik" name="nik" type="text" required pattern="\d{16}" minLength={16} maxLength={16} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="3201..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="admin@koperasi.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Kata Sandi</label>
              <input id="password" name="password" type="password" required minLength={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Minimal 6 karakter" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nomorHp">Nomor HP</label>
              <input id="nomorHp" name="nomorHp" type="tel" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="0812..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="pekerjaan">Jabatan/Pekerjaan</label>
              <input id="pekerjaan" name="pekerjaan" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Ketua Koperasi" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Koperasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="provinsi">Provinsi</label>
                <input id="provinsi" name="provinsi" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Jawa Barat" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="kabupaten">Kabupaten/Kota</label>
                <input id="kabupaten" name="kabupaten" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Kota Bogor" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="kecamatan">Kecamatan</label>
                <input id="kecamatan" name="kecamatan" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Bogor Tengah" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="desa">Desa/Kelurahan</label>
                <input id="desa" name="desa" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Sempur" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="koperasi">Nama Koperasi</label>
                <input id="koperasi" name="koperasi" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Koperasi Sempur Sejahtera" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-slate-900 hover:bg-slate-800 text-tertiary font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 mt-4"
          >
            {pending ? "Memproses..." : "Daftar Sebagai Admin"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 relative z-10">
          Kembali ke halaman{' '}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
