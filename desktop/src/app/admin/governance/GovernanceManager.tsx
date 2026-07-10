"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProposalByAdmin } from "@/actions/governance";
import { createEventByAdmin } from "@/actions/events";

export default function GovernanceManager({ 
  proposals, 
  events, 
  coopId 
}: { 
  proposals: any[], 
  events: any[], 
  coopId: number 
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"events" | "proposals">("events");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (tab === "events") {
      await createEventByAdmin(coopId, title, desc, new Date(startDate), new Date(endDate));
    } else {
      await createProposalByAdmin(coopId, title, desc);
    }

    setShowModal(false);
    setTitle("");
    setDesc("");
    setStartDate("");
    setEndDate("");
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setTab("events")}
          className={`pb-3 px-2 font-bold transition-colors border-b-2 ${tab === "events" ? "border-tertiary text-tertiary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Daftar Event
        </button>
        <button 
          onClick={() => setTab("proposals")}
          className={`pb-3 px-2 font-bold transition-colors border-b-2 ${tab === "proposals" ? "border-tertiary text-tertiary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Daftar Proposal
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">
          {tab === "events" ? "Semua Event" : "Semua Proposal"}
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-tertiary hover:bg-tertiary/90 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buat {tab === "events" ? "Event" : "Proposal"}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Judul / Nama</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tab === "events" && events.map(ev => (
              <tr key={ev.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{ev.name}</div>
                  <div className="text-xs mt-1 line-clamp-1">{ev.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${ev.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : ev.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {ev.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs whitespace-nowrap">
                  {new Date(ev.startDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
            
            {tab === "proposals" && proposals.map(prop => (
              <tr key={prop.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{prop.title}</div>
                  <div className="text-xs mt-1 line-clamp-1">{prop.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${prop.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : prop.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {prop.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs whitespace-nowrap">
                  {new Date(prop.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {(tab === "events" && events.length === 0) || (tab === "proposals" && proposals.length === 0) ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Buat {tab === "events" ? "Event" : "Proposal"} Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Nama</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                  placeholder={`Nama ${tab === "events" ? "Event" : "Proposal"}...`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi</label>
                <textarea 
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary"
                  placeholder="Penjelasan detail..."
                />
              </div>

              {tab === "events" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tertiary"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 font-bold text-white bg-tertiary hover:bg-tertiary/90 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
