import { getGovernanceData, submitProposal } from "@/actions/governance";
import { getCurrentMember } from "@/actions/members";
import { getLeaderboard, getMemberProgress } from "@/actions/gamification";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function Page() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const {
    activeProposals,
    pastProposals,
    totalMembers,
    totalAsetDesa,
    asetPinjaman,
    asetKas,
    asetInvestasi,
  } = await getGovernanceData();
  const mainProposal = activeProposals[0];
  const proposalTitle = mainProposal?.title || "Tidak Ada Voting Aktif";
  const proposalDesc =
    mainProposal?.description ||
    "Saat ini tidak ada proposal yang sedang dalam masa voting.";
  const proposalTarget = mainProposal?.targetQuorumPercentage || 0;

  const progress = await getMemberProgress(currentMember.id);
  const userLevel = progress?.level || 1;
  const canSubmit = userLevel >= 20;

  const topContributors = await getLeaderboard(
    currentMember.koperasi as string,
  );

  const kasPercent = totalAsetDesa > 0 ? Math.round((asetKas / totalAsetDesa) * 100) : 0;
  const pinjamanPercent = totalAsetDesa > 0 ? Math.round((asetPinjaman / totalAsetDesa) * 100) : 0;
  const investasiPercent = totalAsetDesa > 0 ? Math.round((asetInvestasi / totalAsetDesa) * 100) : 0;

  const handleCreateProposal = async (formData: FormData) => {
    "use server";
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

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 pb-32 w-full">
        <div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-8 bento-card flex items-center px-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bento-card p-6 rounded-xl flex flex-col justify-between">
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
          </div>

          <div className="bento-card p-6 rounded-xl flex flex-col justify-between border-l-4 border-tertiary">
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

          <div className="bento-card p-6 rounded-xl flex flex-col justify-between">
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
        </div>

        {mainProposal && (
          <section className="bento-card rounded-xl p-6">
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
              <button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95">
                <span className="material-symbols-outlined text-4xl mb-2 text-primary group-hover:scale-110 transition-transform">
                  thumb_up
                </span>
                <span className="font-label-caps text-label-caps">SETUJU</span>
              </button>
              <button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-error/50 hover:bg-error/5 transition-all active:scale-95">
                <span className="material-symbols-outlined text-4xl mb-2 text-error group-hover:scale-110 transition-transform">
                  thumb_down
                </span>
                <span className="font-label-caps text-label-caps">TOLAK</span>
              </button>
              <button className="group flex flex-col items-center justify-center p-6 border-2 border-outline-variant/30 rounded-xl hover:border-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95">
                <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant group-hover:scale-110 transition-transform">
                  remove_circle
                </span>
                <span className="font-label-caps text-label-caps">ABSTAIN</span>
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
          {/* Financial Breakdown */}
          <section className="bento-card rounded-xl p-6">
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
          </section>

          {/* Top Contributors */}
          <section className="bento-card rounded-xl p-6">
            <h3 className="font-headline-md text-headline-md mb-6">
              Top Kontributor (Leaderboard)
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
                        Level {member.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-points-display text-points-display text-primary">
                      {member.xp} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Submit Proposal */}
          <section className="bento-card rounded-xl p-6 relative overflow-hidden">
            <h3 className="font-headline-md text-headline-md mb-2">
              Ajukan Proposal Desa
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Suarakan ide Anda untuk kemajuan bersama.
            </p>

            {canSubmit ? (
              <form
                action={handleCreateProposal}
                className="space-y-4 relative z-10"
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
                  className="w-full py-3 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/90 transition-colors"
                >
                  AJUKAN PROPOSAL (GRATIS)
                </button>
              </form>
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
                campaign
              </span>
            </div>
          </section>

          {/* Voting History */}
          <section className="bento-card rounded-xl p-6">
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
    </main>
  );
}
