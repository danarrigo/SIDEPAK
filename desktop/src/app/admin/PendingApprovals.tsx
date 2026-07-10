"use client";

import { useState } from "react";
import { approveProposal, rejectProposal } from "@/actions/governance";
import { approveEvent, rejectEvent } from "@/actions/events";
import { approveLoan, rejectLoan } from "@/actions/financials";
import { useRouter } from "next/navigation";

export default function PendingApprovals({ 
  pendingProposals, 
  pendingEvents,
  pendingLoans = []
}: { 
  pendingProposals: any[], 
  pendingEvents: any[],
  pendingLoans?: any[]
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleApproveProposal = async (id: number) => {
    setLoading(`prop-${id}`);
    await approveProposal(id);
    router.refresh();
    setLoading(null);
  };

  const handleRejectProposal = async (id: number) => {
    setLoading(`prop-${id}`);
    await rejectProposal(id);
    router.refresh();
    setLoading(null);
  };

  const handleApproveEvent = async (id: number) => {
    setLoading(`evt-${id}`);
    await approveEvent(id);
    router.refresh();
    setLoading(null);
  };

  const handleRejectEvent = async (id: number) => {
    setLoading(`evt-${id}`);
    await rejectEvent(id);
    router.refresh();
    setLoading(null);
  };

  const handleApproveLoan = async (id: number) => {
    setLoading(`loan-${id}`);
    await approveLoan(id);
    router.refresh();
    setLoading(null);
  };

  const handleRejectLoan = async (id: number) => {
    setLoading(`loan-${id}`);
    await rejectLoan(id);
    router.refresh();
    setLoading(null);
  };

  if (pendingProposals.length === 0 && pendingEvents.length === 0 && pendingLoans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-2xl">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task</span>
        <p>Belum ada pengajuan baru yang perlu diproses hari ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingLoans.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Pengajuan Pinjaman</h3>
          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div key={`loan-${loan.id}`} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">Pinjaman: {loan.memberName}</h4>
                  <p className="text-lg text-amber-600 font-black mt-1">
                    Rp {loan.amount.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Diajukan: {new Date(loan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleRejectLoan(loan.id)}
                    disabled={loading === `loan-${loan.id}`}
                    className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Tolak
                  </button>
                  <button 
                    onClick={() => handleApproveLoan(loan.id)}
                    disabled={loading === `loan-${loan.id}`}
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                    Cairkan ke Dompet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Event & Aktivitas</h3>
          <div className="space-y-3">
            {pendingEvents.map((ev) => (
              <div key={`evt-${ev.id}`} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">{ev.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                  <p className="text-xs text-tertiary mt-2 font-medium">Tanggal: {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleRejectEvent(ev.id)}
                    disabled={loading === `evt-${ev.id}`}
                    className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Tolak
                  </button>
                  <button 
                    onClick={() => handleApproveEvent(ev.id)}
                    disabled={loading === `evt-${ev.id}`}
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Terima
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingProposals.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Proposal (Voting)</h3>
          <div className="space-y-3">
            {pendingProposals.map((prop) => (
              <div key={`prop-${prop.id}`} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">{prop.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prop.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleRejectProposal(prop.id)}
                    disabled={loading === `prop-${prop.id}`}
                    className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Tolak
                  </button>
                  <button 
                    onClick={() => handleApproveProposal(prop.id)}
                    disabled={loading === `prop-${prop.id}`}
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Terima
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
