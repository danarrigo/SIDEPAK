"use client";
import React, { useState, useTransition } from "react";
import { updateMemberAdmin } from "@/actions/members";

export default function MembersTableClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorHp: "",
    statusAnggota: "active",
  });

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setFormData({
      namaLengkap: member.namaLengkap || "",
      nomorHp: member.nomorHp || "",
      statusAnggota: member.statusAnggota || "active",
    });
  };

  const handleClose = () => {
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    startTransition(async () => {
      const res = await updateMemberAdmin(editingMember.id, formData);
      if (res.success) {
        // Update local state to reflect changes
        setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...formData } : m));
        handleClose();
      } else {
        alert(res.error || "Gagal mengupdate data anggota.");
      }
    });
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                <th className="px-6 py-4 font-bold">NIK</th>
                <th className="px-6 py-4 font-bold">No. HP</th>
                <th className="px-6 py-4 font-bold">Desa</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{member.namaLengkap}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{member.nik}</td>
                  <td className="px-6 py-4">{member.nomorHp || '-'}</td>
                  <td className="px-6 py-4">{member.desa}</td>
                  <td className="px-6 py-4">
                    {member.statusAnggota === 'active' ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20">
                        Inaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditClick(member)}
                      className="text-tertiary hover:bg-tertiary/10 p-2 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Belum ada anggota yang terdaftar di koperasi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Data Anggota</h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">No. HP</label>
                <input 
                  type="tel" 
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({...formData, nomorHp: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Status Anggota</label>
                <select 
                  value={formData.statusAnggota}
                  onChange={(e) => setFormData({...formData, statusAnggota: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Inaktif</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-tertiary px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
