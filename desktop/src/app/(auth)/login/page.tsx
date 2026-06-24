"use client";

import Link from "next/link";
import { login } from "@/actions/auth";
import { useActionState } from "react";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-6">
      <div className="glass-card border border-outline-variant rounded-2xl w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-on-surface">Masuk</h1>
          <p className="text-sm text-on-surface-variant mt-2">Masuk ke akun KopDes Anda</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-error-container text-error p-3 rounded-xl text-sm font-bold">
              {state.error}
            </div>
          )}

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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {pending ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          Belum punya akun?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
