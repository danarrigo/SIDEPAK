import { getGovernanceData, castVote } from "@/actions/governance";
import { getCurrentMember } from "@/actions/members";
import { revalidatePath } from "next/cache";

export default async function Page() {
  const { activeProposals, totalMembers, totalAsetDesa } = await getGovernanceData();
  const mainProposal = activeProposals[0];
  const proposalTitle = mainProposal?.title || "Tidak Ada Voting Aktif";
  const proposalDesc = mainProposal?.description || "Saat ini tidak ada proposal yang sedang dalam masa voting.";
  const proposalTarget = mainProposal?.targetQuorumPercentage || 0;
  
  const endDate = mainProposal ? new Date(mainProposal.endDate) : new Date();
  const now = new Date();
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const sisaWaktu = diffDays > 0 ? `${diffDays} Hari` : 'Selesai';

  const currentMember = await getCurrentMember();
  const memberId = currentMember?.id || 1;
  
  async function voteAction(formData: FormData) {
    "use server";
    const voteType = formData.get("voteType") as string;
    await castVote(memberId, mainProposal?.id || 1, voteType);
    revalidatePath("/governance");
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
      
        <div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-8 bento-card flex items-center px-10">
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg mb-2">Governance Dashboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Partisipasi aktif Anda membangun fondasi desa digital yang berkelanjutan. Tentukan masa depan bersama melalui keputusan demokratis yang transparan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bento-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">group</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">{totalMembers.toLocaleString()}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Anggota Aktif</div>
            </div>
          </div>
          
          <div className="bento-card p-6 rounded-xl flex flex-col justify-between border-l-4 border-tertiary">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <span className="font-label-caps text-label-caps text-tertiary">SURPLUS</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">Rp {totalAsetDesa.toLocaleString('id-ID')}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Aset Desa</div>
            </div>
          </div>
          
          <div className="bento-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">speed</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">{sisaWaktu}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sisa Waktu Voting</div>
            </div>
          </div>
        </div>

        {mainProposal && (
          <section className="bento-card rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-error/20 text-error rounded font-label-caps text-[10px] uppercase tracking-wider">Sedang Berlangsung</span>
                  <h2 className="font-headline-md text-headline-md">{proposalTitle}</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{proposalDesc}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">TARGET QUORUM ({proposalTarget}%)</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <form action={voteAction} className="w-full">
                <input type="hidden" name="voteType" value="agree" />
                <button type="submit" className="w-full group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined text-4xl mb-2 text-primary group-hover:scale-110 transition-transform">thumb_up</span>
                  <span className="font-label-caps text-label-caps">SETUJU</span>
                </button>
              </form>
              <form action={voteAction} className="w-full">
                <input type="hidden" name="voteType" value="reject" />
                <button type="submit" className="w-full group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-error/50 hover:bg-error/5 transition-all active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined text-4xl mb-2 text-error group-hover:scale-110 transition-transform">thumb_down</span>
                  <span className="font-label-caps text-label-caps">TOLAK</span>
                </button>
              </form>
              <form action={voteAction} className="w-full">
                <input type="hidden" name="voteType" value="abstain" />
                <button type="submit" className="w-full group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-hover:scale-110 transition-transform">remove_circle</span>
                  <span className="font-label-caps text-label-caps">ABSTAIN</span>
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}