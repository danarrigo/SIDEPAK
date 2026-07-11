import { getCurrentMember, getMemberData } from "@/actions/members";
import { getDashboardData } from "@/actions/dashboard";
import { getMemberInventory } from "@/actions/gamification";
import { redirect } from "next/navigation";
import Link from "next/link";
import UseItemClient from "@/components/UseItemClient";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const targetId = parseInt(params.id, 10);
  if (isNaN(targetId)) redirect("/governance/members");

  const targetMember = await getMemberData(targetId);
  if (!targetMember) redirect("/governance/members");

  const targetDbData = await getDashboardData(targetId);
  const inventory = await getMemberInventory(currentMember.id);

  const level = targetDbData?.progress?.level || 1;
  const xp = targetDbData?.progress?.xp || 0;
  const nextLevelXp = level * 1000;
  const xpPercent = Math.min(100, (xp / nextLevelXp) * 100);

  const isSelf = currentMember.id === targetId;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background pb-24 md:pb-0">
      <div className="flex-1 overflow-y-auto px-6 py-10 w-full max-w-4xl mx-auto space-y-8 animate-slide-up">
        
        <Link href="/governance/members" className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-medium gap-1 mb-4">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke Direktori
        </Link>

        <section className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-[150px]">person</span>
          </div>
          
          <div className="relative z-10 shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface-container-high p-1 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest">
                <img 
                  className="w-full h-full object-cover" 
                  alt={targetMember.namaLengkap} 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(targetMember.namaLengkap)}&background=1E293B&color=fff&size=256`}
                />
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-tertiary to-primary text-on-primary px-4 py-1 rounded-full font-black text-sm shadow-[0_0_15px_rgba(250,204,21,0.5)] whitespace-nowrap">
              Lv. {level}
            </div>
          </div>

          <div className="relative z-10 flex-1 text-center md:text-left mt-4 md:mt-0 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-black text-on-surface mb-1">{targetMember.namaLengkap}</h1>
                <p className="text-on-surface-variant font-medium text-lg">NPA: {targetMember.nomorAnggota || "Menunggu"}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    targetMember.statusAnggota === 'active' 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                  }`}>
                    {targetMember.statusAnggota === 'active' ? 'Aktif' : 'Menunggu'}
                  </span>
                  <span className="text-sm text-on-surface-variant">• {targetMember.pekerjaan || 'Anggota'}</span>
                </div>
              </div>
              
              {!isSelf && (
                <div className="shrink-0 flex flex-col items-center">
                  <UseItemClient currentMemberId={currentMember.id} targetMemberId={targetId} inventory={inventory} />
                </div>
              )}
            </div>

            <div className="mt-8 bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-on-surface-variant text-sm uppercase tracking-wider">Experience</span>
                <span className="font-bold text-on-surface">{xp} / {nextLevelXp} XP</span>
              </div>
              <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-tertiary to-primary rounded-full shadow-[0_0_10px_rgba(233,196,0,0.4)] transition-all duration-1000" style={{ width: `${xpPercent}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="glass-card rounded-2xl p-8 animate-slide-up delay-100">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">contact_mail</span>
              Info Kontak
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-2xl">call</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Nomor HP</p>
                  <p className="text-sm font-bold text-on-surface">{targetMember.nomorHp || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Alamat</p>
                  <p className="text-sm font-bold text-on-surface">{[targetMember.desa, targetMember.kecamatan, targetMember.kabupaten, targetMember.provinsi].filter(Boolean).join(', ') || '-'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-8 animate-slide-up delay-150">
             <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">info</span>
              Data Koperasi
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-2xl">event_available</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Tanggal Bergabung</p>
                  <p className="text-sm font-bold text-on-surface">
                    {targetMember.createdAt ? new Date(targetMember.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-2xl">fingerprint</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">NIK</p>
                  <p className="text-sm font-bold text-on-surface">{targetMember.nik || '-'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
