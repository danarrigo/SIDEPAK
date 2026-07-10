import React from "react";
import { getCurrentMember } from "@/actions/members";
import { db } from "@/db";
import { cooperatives } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "Profil Admin | Admin Dashboard",
};

export default async function AdminProfilePage() {
  const adminData = await getCurrentMember();
  
  if (!adminData || !adminData.user || !adminData.cooperativeId) {
    return <div>Error loading admin data</div>;
  }

  const [coop] = await db.select().from(cooperatives).where(eq(cooperatives.id, adminData.cooperativeId));

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in text-slate-900">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg font-black text-slate-900 mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">person</span>
          Profil Pengurus
        </h1>
        <p className="font-body-lg text-slate-500">
          Informasi data diri dan koperasi yang Anda kelola
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl transition-all" />
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-tertiary">badge</span>
              Data Pribadi
            </h2>
            
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

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               {/* Later we can make this editable, for now just show a disabled state or soon to be implemented */}
              <button disabled className="bg-slate-100 text-slate-400 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profil (Segera)
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">store</span>
              Informasi Koperasi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Koperasi</label>
                <div className="text-lg font-bold text-slate-900">{coop?.name}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Provinsi</label>
                <div className="text-lg font-bold text-slate-900">{coop?.provinsi || '-'}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kabupaten/Kota</label>
                <div className="text-lg font-bold text-slate-900">{coop?.kabupaten || '-'}</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kecamatan</label>
                <div className="text-lg font-bold text-slate-900">{coop?.kecamatan || '-'}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Desa/Kelurahan</label>
                <div className="text-lg font-bold text-slate-900">{coop?.desa || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Status */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-800 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/20 rounded-bl-full" />
             
             <div className="relative z-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-4">
                  <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shield_person
                  </span>
               </div>
               
               <h3 className="text-2xl font-black mb-1">{adminData.namaLengkap}</h3>
               <span className="px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-xs font-bold uppercase tracking-wider border border-tertiary/20">
                 Administrator
               </span>
               
               <div className="mt-6 w-full pt-6 border-t border-slate-800/50">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Status Akun</span>
                   <span className="font-bold text-emerald-400 flex items-center gap-1">
                     <span className="material-symbols-outlined text-sm">check_circle</span>
                     Aktif
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm mt-3">
                   <span className="text-slate-400">Hak Akses</span>
                   <span className="font-bold text-white">Full Akses</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
