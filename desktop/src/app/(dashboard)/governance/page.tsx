import Link from "next/link";
import { getGovernanceData, submitProposal, castVote, getKoperasiStats } from "@/actions/governance";
import { getCurrentMember } from "@/actions/members";
import { getLeaderboard, getMemberProgress, getCooperativeLeaderboard } from "@/actions/gamification";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import CooperativeLoanForm from "@/components/CooperativeLoanForm";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const {
    activeProposals,
    pastProposals,
    activeEvents,
    pastEvents,
    totalMembers,
    totalAsetDesa,
    asetPinjaman,
    asetKas,
    asetInvestasi,
  } = await getGovernanceData(currentMember.cooperativeId as number);
  
  const kopStats = await getKoperasiStats(currentMember.cooperativeId as number);

  const mainProposal = activeProposals[0];
  const proposalTitle = mainProposal?.title || "Tidak Ada Voting Aktif";
  const proposalDesc =
    mainProposal?.description ||
    "Saat ini tidak ada proposal yang sedang dalam masa voting.";
  const proposalTarget = mainProposal?.targetQuorumPercentage || 0;

  const progress = await getMemberProgress(currentMember.id);
  const userLevel = progress?.level || 1;
  const canSubmit = userLevel >= 20;

  const { calculateMembershipScore, getRankFromScore, getRankLoanLimits } = await import("@/actions/rank");
  const membershipScoreValue = calculateMembershipScore(progress?.level ?? 1, progress?.walletBalance ?? 0, progress?.creditScore ?? 0);
  const userRankName = getRankFromScore(membershipScoreValue);
  const loanLimits = getRankLoanLimits(userRankName);
  const maxPercentAmt = Math.floor(asetKas * (loanLimits.maxPercent / 100));
  const maxBorrowableAmt = Math.min(loanLimits.maxAmount, maxPercentAmt);

  let userVote: string | null = null;
  if (mainProposal) {
    const { votes } = await import("@/db/schema/governance");
    const { and: dbAnd, eq: dbEq } = await import("drizzle-orm");
    const { db } = await import("@/db");
    const userVoteRes = await db.select().from(votes).where(
      dbAnd(
        dbEq(votes.memberId, currentMember.id),
        dbEq(votes.proposalId, mainProposal.id)
      )
    ).catch(() => []);
    if (userVoteRes.length > 0) {
      userVote = userVoteRes[0].voteType;
    }
  }

  const topContributors = await getCooperativeLeaderboard();


  const kasPercent = totalAsetDesa > 0 ? Math.round((asetKas / totalAsetDesa) * 100) : 0;
  const pinjamanPercent = totalAsetDesa > 0 ? Math.round((asetPinjaman / totalAsetDesa) * 100) : 0;
  const investasiPercent = totalAsetDesa > 0 ? Math.round((asetInvestasi / totalAsetDesa) * 100) : 0;

  const handleCreateProposal = async (formData: FormData) => {
    "use server";
    if (!currentMember) return;
    const title = formData.get("title") as string;
    const desc = formData.get("description") as string;
    await submitProposal(currentMember.id, title, desc);
    revalidatePath("/governance");
  };



  const endDate = mainProposal ? new Date(mainProposal.endDate) : new Date();
  const now = new Date();
  const diffDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
  );
  const sisaWaktu =
    mainProposal && diffDays > 0 ? `${diffDays} Hari` : "Selesai";

  async function voteAction(formData: FormData) {
    "use server";
    if (!currentMember) return;
    const voteType = formData.get("voteType") as string;
    await castVote(currentMember.id, mainProposal?.id || 1, voteType);
    revalidatePath("/governance");
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      {/* Desktop View */}
      <div className="hidden md:block flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        <div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-8 glass-card animate-slide-up flex items-center px-10">
          <div className="relative z-10">
            <h1 className="font-headline-lg text-headline-lg mb-2">
              Governance Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Partisipasi aktif Anda membangun fondasi desa digital yang
              berkelanjutan. Tentukan masa depan bersama melalui keputusan
              demokratis yang transparan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up delay-100">
          <Link href="/governance/members" className="glass-card p-6 rounded-xl flex flex-col justify-between border border-transparent hover:border-primary transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                group
              </span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">
                {totalMembers.toLocaleString()}
              </div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Anggota Aktif
              </div>
            </div>
          </Link>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between border-l-4 border-tertiary">
            <div className="flex justify-between items-start mb-4">
              <span
                className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance_wallet
              </span>
              <span className="font-label-caps text-label-caps text-tertiary">
                SURPLUS
              </span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">
                Rp {totalAsetDesa.toLocaleString("id-ID")}
              </div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Total Aset Desa
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between border border-transparent">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">
                speed
              </span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md">
                {sisaWaktu}
              </div>
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Sisa Waktu Voting
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between border border-transparent">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                health_and_safety
              </span>
              <span className="font-label-caps text-[10px] text-secondary font-bold">100%</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-secondary">
                Sangat Sehat
              </div>
              <div className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">
                Kesehatan Koperasi
              </div>
            </div>
          </div>
        </div>

        <section className="glass-card rounded-xl p-6">
          {mainProposal ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-error/20 text-error rounded font-label-caps text-[10px] uppercase tracking-wider">
                      Sedang Berlangsung
                    </span>
                    <h2 className="font-headline-md text-headline-md">
                      {proposalTitle}
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    {proposalDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TARGET QUORUM ({proposalTarget}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "0%" }}
                    ></div>
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
            </>
          ) : (
            <div className="text-center py-12 bg-surface-container-highest rounded-xl border border-outline-variant/30 relative z-10">
              <span className="material-symbols-outlined text-6xl text-outline mb-4 opacity-50">how_to_vote</span>
              <h3 className="font-headline-md text-headline-md mb-2">Tidak Ada Voting Aktif</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                Saat ini tidak ada proposal yang sedang dalam masa voting. Silakan cek kembali nanti atau ajukan proposal baru.
              </p>
            </div>
          )}
        </section>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
          {/* Financial Breakdown */}
          <section className="glass-card rounded-xl p-6">
            <h3 className="font-headline-md text-headline-md mb-6">
              Distribusi Aset Desa
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between font-label-caps text-label-caps mb-2">
                  <span className="text-on-surface-variant">
                    KAS & LIKUIDITAS
                  </span>
                  <span className="text-primary">{kasPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${kasPercent}%` }}
                  ></div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-right">
                  Rp {asetKas.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <div className="flex justify-between font-label-caps text-label-caps mb-2">
                  <span className="text-on-surface-variant">
                    PINJAMAN ANGGOTA
                  </span>
                  <span className="text-tertiary">{pinjamanPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary"
                    style={{ width: `${pinjamanPercent}%` }}
                  ></div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-right">
                  Rp {asetPinjaman.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <div className="flex justify-between font-label-caps text-label-caps mb-2">
                  <span className="text-on-surface-variant">
                    INVESTASI & LAINNYA
                  </span>
                  <span className="text-error">{investasiPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-error"
                    style={{ width: `${investasiPercent}%` }}
                  ></div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-right">
                  Rp {asetInvestasi.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <CooperativeLoanForm
              memberId={currentMember.id}
              rankName={userRankName}
              maxPercent={loanLimits.maxPercent}
              maxAmount={loanLimits.maxAmount}
              kasKoperasi={asetKas}
              maxBorrowable={maxBorrowableAmt}
            />
          </section>

          {/* Top Cooperatives */}
          <section className="glass-card rounded-xl p-6">
            <h3 className="font-headline-md text-headline-md mb-6">
              Leaderboard Nasional
            </h3>
            <div className="space-y-4">
              {topContributors.slice(0, 3).map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-headline-md text-headline-md">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg font-bold">
                        {member.namaLengkap}
                      </p>
                      <p className="font-label-caps text-label-caps text-tertiary">
                        Rata-Rata Level {member.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-points-display text-points-display text-primary">
                      {member.pointsBalance} Poin
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Event Desa & Submit Proposal */}
          <section className="glass-card rounded-xl p-6 relative overflow-hidden flex flex-col">
            <h3 className="font-headline-md text-headline-md mb-2">
              Event Desa
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Ikuti dan dukung kegiatan desa kita bersama.
            </p>

            <div className="flex-1 space-y-4 mb-6 relative z-10">
              {activeEvents.length === 0 ? (
                <p className="text-on-surface-variant text-sm">Belum ada event aktif.</p>
              ) : (
                activeEvents.map(event => (
                  <div key={event.id} className="p-4 bg-surface-container-highest rounded-lg border border-outline-variant/30">
                    <h4 className="font-bold">{event.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{event.description}</p>
                    <p className="text-[10px] mt-2 font-bold text-primary">Berakhir: {new Date(event.endDate).toLocaleDateString("id-ID")}</p>
                  </div>
                ))
              )}
            </div>

            {canSubmit ? (
              <details className="group relative z-10">
                <summary className="list-none cursor-pointer w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg text-center hover:bg-primary/90 transition-colors select-none flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  AJUKAN PROPOSAL
                </summary>
                <div className="pt-4">
                  <form
                    action={handleCreateProposal}
                    className="space-y-4"
                  >
                    <div>
                      <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                        Judul Proposal
                      </label>
                      <input
                        name="title"
                        required
                        placeholder="Contoh: Pembangunan Sumur Bor Baru"
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
                        Deskripsi Detail
                      </label>
                      <textarea
                        name="description"
                        required
                        rows={3}
                        placeholder="Jelaskan tujuan dan manfaat usulan ini..."
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-tertiary text-on-tertiary font-label-caps text-label-caps rounded-lg hover:bg-tertiary/90 transition-colors"
                    >
                      KIRIM PROPOSAL (GRATIS)
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <div className="bg-surface-container-highest p-6 rounded-xl border border-outline-variant/30 text-center relative z-10">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">
                  lock
                </span>
                <p className="font-body-md text-body-md">
                  Fitur pengajuan proposal hanya tersedia untuk anggota{" "}
                  <strong>Level 20 (GOLD)</strong> ke atas.
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Terus tingkatkan partisipasi Anda!
                </p>
              </div>
            )}
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[200px]">
                event
              </span>
            </div>
          </section>


          <section className="glass-card rounded-xl p-6">
            <h3 className="font-headline-md text-headline-md mb-6">
              Arsip Keputusan (History)
            </h3>
            {pastProposals.length === 0 ? (
              <p className="text-on-surface-variant font-body-md">
                Belum ada riwayat proposal.
              </p>
            ) : (
              <div className="space-y-4">
                {pastProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-body-lg text-body-lg font-bold truncate max-w-[70%]">
                        {prop.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${prop.status === "passed" ? "bg-primary/20 text-primary" : prop.status === "rejected" ? "bg-error/20 text-error" : "bg-surface-container-highest text-on-surface-variant"}`}
                      >
                        {prop.status === "passed"
                          ? "Disetujui"
                          : prop.status === "rejected"
                            ? "Ditolak"
                            : prop.status}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                      {prop.description}
                    </p>
                    <p className="font-label-caps text-[10px] text-outline mt-3">
                      Berakhir pada:{" "}
                      {new Date(prop.endDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-16">
        {/* Top Header Section */}
        <div className="bg-[#111827] pt-12 px-6 pb-8 flex flex-col gap-1">
          <h1 className="text-white text-2xl font-bold">Dashboard Koperasi</h1>
          <p className="text-white/60 text-xs">{currentMember.koperasi || 'Koperasi Merah Putih Desa Sukamaju'}</p>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 space-y-5">
          {/* Statistik Koperasi Card */}
          <div className="bg-gradient-to-br from-[#718096] to-[#4A5568] rounded-[20px] p-4 text-white shadow flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Statistik Koperasi</h3>
              <Link href="/governance/members" className="bg-white/20 border border-white/20 rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 transition-all">
                <span>Lihat Anggota</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 text-[#1E293B] flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400">Total Anggota</span>
                <span className="text-base font-black mt-1">{totalMembers}</span>
                <span className="text-[8px] text-slate-400">Terdaftar aktif</span>
              </div>
              <div className="bg-white rounded-xl p-3 text-[#1E293B] flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400">Total Transaksi</span>
                <span className="text-base font-black mt-1">{kopStats.transaksi}</span>
                <span className="text-[8px] text-slate-400">Simpanan & Pinjaman</span>
              </div>
              <div className="bg-white rounded-xl p-3 text-[#1E293B] flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400">Total Aset Desa</span>
                <span className="text-xs font-black mt-1 truncate">Rp {totalAsetDesa.toLocaleString("id-ID")}</span>
                <span className="text-[8px] text-slate-400">Konsolidasi</span>
              </div>
              <div className="bg-white rounded-xl p-3 text-[#1E293B] flex flex-col justify-center shadow-sm">
                <span className="text-[9px] font-bold text-slate-400">UMKM Aktif</span>
                <span className="text-base font-black mt-1">{kopStats.umkmAktif || '-'}</span>
                <span className="text-[8px] text-slate-400">Data UMKM</span>
              </div>
            </div>
          </div>

          {/* Distribusi Aset Desa Card */}
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-[#475569] text-sm font-bold">Distribusi Aset Desa</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Kas & Likuiditas</span>
                  <span className="text-[#3B82F6]">{kasPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3B82F6]" style={{ width: `${kasPercent}%` }}></div>
                </div>
                <p className="text-[10px] text-right font-bold text-slate-400 mt-1">Rp {asetKas.toLocaleString("id-ID")}</p>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Pinjaman Anggota</span>
                  <span className="text-[#F59E0B]">{pinjamanPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B]" style={{ width: `${pinjamanPercent}%` }}></div>
                </div>
                <p className="text-[10px] text-right font-bold text-slate-400 mt-1">Rp {asetPinjaman.toLocaleString("id-ID")}</p>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Investasi & Lainnya</span>
                  <span className="text-[#EF4444]">{investasiPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444]" style={{ width: `${investasiPercent}%` }}></div>
                </div>
                <p className="text-[10px] text-right font-bold text-slate-400 mt-1">Rp {asetInvestasi.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          {/* Voting Digital (E-RAT) Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-[#3B82F6] text-xl">how_to_vote</span>
              <h3 className="text-[#1E293B] text-sm font-black">Voting Digital (E-RAT)</h3>
            </div>
            <div className="bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-[20px] p-5 text-white shadow-md flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-white/90">Agenda E-RAT Aktif</span>
                {mainProposal && (
                  <span className="bg-white/20 border border-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    Sisa {sisaWaktu}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold leading-tight">{proposalTitle}</h4>
                {mainProposal?.description && (
                  <p className="text-white/80 text-[10px] mt-1.5 leading-relaxed">{proposalDesc}</p>
                )}
              </div>

              {mainProposal && (
                <div className="bg-white/10 border border-white/20 rounded-lg p-2.5 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-white/80">TARGET QUORUM</span>
                  <span>{proposalTarget}%</span>
                </div>
              )}

              {userVote ? (
                <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
                  <span className="text-xs font-bold">Pilihan Anda: {userVote === 'agree' ? 'Setuju' : userVote === 'reject' ? 'Tolak' : 'Abstain'}</span>
                </div>
              ) : mainProposal ? (
                <div className="grid grid-cols-3 gap-2">
                  <form action={voteAction} className="w-full">
                    <input type="hidden" name="voteType" value="agree" />
                    <button type="submit" className="w-full py-2 bg-[#16A34A] text-white rounded-lg font-bold text-[10px] text-center">Setuju</button>
                  </form>
                  <form action={voteAction} className="w-full">
                    <input type="hidden" name="voteType" value="reject" />
                    <button type="submit" className="w-full py-2 bg-[#DC2626] text-white rounded-lg font-bold text-[10px] text-center">Tolak</button>
                  </form>
                  <form action={voteAction} className="w-full">
                    <input type="hidden" name="voteType" value="abstain" />
                    <button type="submit" className="w-full py-2 bg-white/20 text-white rounded-lg font-bold text-[10px] text-center">Abstain</button>
                  </form>
                </div>
              ) : (
                <p className="text-white/70 text-xs">Belum ada vote yang aktif. Ajukan proposal baru di bawah.</p>
              )}
            </div>
          </div>

          {/* Event Desa & Ajukan Proposal Desa */}
          <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-[#1E293B] text-sm font-bold">Event Desa</h3>
              <p className="text-slate-400 text-[10px] mt-0.5">Ikuti dan dukung kegiatan desa kita bersama.</p>
            </div>

            <div className="space-y-3 mb-2">
              {activeEvents.length === 0 ? (
                <p className="text-slate-400 text-xs">Belum ada event aktif.</p>
              ) : (
                activeEvents.map(event => (
                  <div key={event.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-[#1E293B] text-xs">{event.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{event.description}</p>
                    <p className="text-[9px] mt-2 font-bold text-[#3B82F6]">Berakhir: {new Date(event.endDate).toLocaleDateString("id-ID")}</p>
                  </div>
                ))
              )}
            </div>

            {canSubmit ? (
              <details className="group">
                <summary className="list-none cursor-pointer w-full py-2.5 bg-[#0F172A] text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors text-center select-none flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  AJUKAN PROPOSAL
                </summary>
                <div className="pt-3">
                  <form action={handleCreateProposal} className="space-y-3">
                    <div>
                      <input
                        name="title"
                        required
                        placeholder="Contoh: Pembangunan Sumur Bor Baru"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <textarea
                        name="description"
                        required
                        rows={3}
                        placeholder="Jelaskan tujuan dan manfaat usulan ini..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#3B82F6] text-white font-bold text-xs rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      KIRIM PROPOSAL
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-2xl">lock</span>
                <p className="text-xs text-slate-600 font-bold leading-normal">
                  Pengajuan proposal hanya untuk anggota Level 20 (Emas) ke atas.
                </p>
                <p className="text-[10px] text-slate-400">
                  Level Anda saat ini: {userLevel} ({userLevel >= 10 && userLevel < 20 ? 'Perak' : 'Perunggu'})
                </p>
              </div>
            )}
          </div>

          {/* Arsip Keputusan */}
          <div className="space-y-2">
            <h3 className="text-[#475569] text-sm font-bold px-1">Arsip Keputusan</h3>
            {pastProposals.length === 0 ? (
              <div className="bg-slate-50 rounded-[20px] p-5 text-center text-slate-400 text-xs border border-slate-200">
                Belum ada riwayat proposal.
              </div>
            ) : (
              <div className="space-y-3">
                {pastProposals.map((prop) => {
                  const isPassed = prop.status === "passed";
                  const isRejected = prop.status === "rejected";
                  return (
                    <div key={prop.id} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[70%]">{prop.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          isPassed ? "bg-emerald-100 text-emerald-700" : isRejected ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {isPassed ? "Disetujui" : isRejected ? "Ditolak" : prop.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{prop.description}</p>
                      <span className="text-slate-400 text-[8px] block mt-1">Berakhir pada: {new Date(prop.endDate).toLocaleDateString("id-ID")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
