import React from 'react';
import Link from 'next/link';
import { getCurrentMember, getActiveMembers } from '@/actions/members';
import { redirect } from 'next/navigation';

export default async function MembersPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember || !currentMember.cooperativeId) redirect("/login");

  const activeMembers = await getActiveMembers(currentMember.cooperativeId as number);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 w-full max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-2">
          <Link href="/governance" className="p-2 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-on-surface">Daftar Anggota Aktif</h1>
            <p className="text-sm text-on-surface-variant">{currentMember.koperasi}</p>
          </div>
        </div>

        <div className="glass-card border border-outline-variant rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-on-surface">Semua Anggota</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full border border-primary/20">
              {activeMembers.length} Anggota
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMembers.map((m) => (
              <Link href={`/governance/members/${m.id}`} key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {m.namaLengkap.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{m.namaLengkap}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">No. Anggota: {m.nomorAnggota || '-'}</p>
                </div>
              </Link>
            ))}
          </div>
          
          {activeMembers.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant text-sm">
              Belum ada anggota aktif di koperasi ini.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
