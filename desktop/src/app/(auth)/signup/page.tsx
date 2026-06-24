"use client";

import Link from "next/link";
import { signup } from "@/actions/auth";
import { useActionState } from "react";

const initialState = {
  error: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-6">
      <div className="glass-card border border-outline-variant rounded-2xl w-full max-w-2xl p-8 shadow-lg my-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-on-surface">Daftar Akun</h1>
          <p className="text-sm text-on-surface-variant mt-2">Bergabung dengan KopDes hari ini</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-error-container text-error p-3 rounded-xl text-sm font-bold">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="namaLengkap">Nama Lengkap</label>
              <input
                id="namaLengkap"
                name="namaLengkap"
                type="text"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="nik">NIK</label>
              <input
                id="nik"
                name="nik"
                type="text"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="16 Digit NIK"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="Min. 6 karakter"
              />
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="text-sm font-bold text-on-surface mb-4">Informasi Domisili & Koperasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="provinsi">Provinsi</label>
                <input
                  id="provinsi"
                  name="provinsi"
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                  placeholder="Contoh: Jawa Barat"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="kabupaten">Kabupaten/Kota</label>
                <input
                  id="kabupaten"
                  name="kabupaten"
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                  placeholder="Contoh: Bandung"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="kecamatan">Kecamatan</label>
                <input
                  id="kecamatan"
                  name="kecamatan"
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                  placeholder="Contoh: Lembang"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="desa">Desa/Kelurahan</label>
                <input
                  id="desa"
                  name="desa"
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                  placeholder="Contoh: Sukamaju"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="koperasi">Nama Koperasi</label>
                <input
                  id="koperasi"
                  name="koperasi"
                  type="text"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                  placeholder="Nama koperasi harus terdaftar di desa Anda"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {pending ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
