import { getCurrentMember } from "@/actions/members";
import { getCoopHealthScore } from "@/actions/health_score";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Metodologi Skor Kesehatan | SIDEPAK Admin",
};

export default async function MethodologyPage() {
  const admin = await getCurrentMember();
  if (!admin?.cooperativeId) redirect("/admin");

  const healthData = await getCoopHealthScore(admin.cooperativeId);

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/health" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali ke Dashboard Kesehatan
        </Link>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Laporan Justifikasi</p>
        <h1 className="text-2xl font-black text-slate-900">Metodologi SIDEPAK Health Score</h1>
        <p className="text-slate-500 mt-1 text-sm">Adaptasi dari model Simkopdes Health Score (1.026 koperasi)</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6">
        {/* Why adapted */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-base font-black text-amber-800 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">info</span>
            Mengapa Model Diadaptasi?
          </h2>
          <p className="text-sm text-amber-700 leading-relaxed">
            Model asli Simkopdes menggunakan data dari 7 tabel (dokumen, gerai, aset, modal awal) yang <strong>tidak tersedia</strong> di database SIDEPAK. Mengisi nilai nol untuk data yang tidak ada akan secara tidak valid merendahkan skor semua koperasi. Oleh karena itu, setiap dimensi disubstitusi dengan proksi yang mengukur <em>konstruk laten yang sama</em> menggunakan data yang tersedia.
          </p>
        </div>

        {/* Dimensions table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-black text-slate-900 mb-4">Pemetaan Dimensi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-slate-500 font-bold">Dimensi Asli (Simkopdes)</th>
                  <th className="text-center py-2 px-3 text-slate-500 font-bold">Bobot</th>
                  <th className="text-left py-2 pl-4 text-slate-500 font-bold">Substitusi SIDEPAK</th>
                  <th className="text-center py-2 px-3 text-slate-500 font-bold">Kesetaraan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { orig: "D1 Likuiditas Simpanan", weight: "35%", sub: "D1 Kepatuhan Iuran (dues PAID/total)", eq: "5/5" },
                  { orig: "D2 Keanggotaan Aktif", weight: "25%", sub: "D2 Penetrasi Digital (members with user_id)", eq: "4/5" },
                  { orig: "D3 Kelengkapan Dokumen", weight: "20%", sub: "D3 Partisipasi Governance (votes/proposals)", eq: "4/5" },
                  { orig: "D4 Infrastruktur & Aset", weight: "10%", sub: "D4 Kesehatan Kredit (loan repayment rate)", eq: "3/5" },
                  { orig: "D5 Permodalan", weight: "10%", sub: "D5 Engagement Gamifikasi (median XP + streak)", eq: "2/5" },
                ].map((row) => (
                  <tr key={row.orig} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-700">{row.orig}</td>
                    <td className="py-3 px-3 text-center font-black text-tertiary">{row.weight}</td>
                    <td className="py-3 pl-4 text-slate-600">{row.sub}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{row.eq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula */}
        <div className="bg-slate-900 rounded-2xl p-6">
          <h2 className="text-sm font-black text-tertiary mb-3">Formula Komposit</h2>
          <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
{`health_score = (
  d1 × 0.35 +   // Kepatuhan Iuran
  d2 × 0.25 +   // Penetrasi Digital
  d3 × 0.20 +   // Partisipasi Governance
  d4 × 0.10 +   // Kesehatan Kredit
  d5 × 0.10     // Engagement Gamifikasi
) × 100

Label:
  score ≥ 60  →  "Sehat"
  score ≥ 35  →  "Waspada"
  score <  35  →  "Kritis"`}
          </pre>
        </div>

        {/* Limitations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">warning</span>
            Keterbatasan Model
          </h2>
          <div className="space-y-3">
            {[
              { issue: "D5 menggunakan engagement gamifikasi", impact: "Koperasi dengan anggota aktif bermain tapi iuran macet bisa tampak lebih baik dari seharusnya", fix: "Tambahkan modal_awal ke skema cooperatives" },
              { issue: "D3 bergantung pada aktivitas 90 hari terakhir", impact: "Koperasi baru tanpa riwayat voting mendapat skor D3=0", fix: "Gunakan window rolling atau beri skor default untuk koperasi baru" },
              { issue: "Formula belum divalidasi empiris di SIDEPAK", impact: "Belum ada ground truth untuk mengkonfirmasi akurasi klasifikasi", fix: "Audit manual 10-20 koperasi dan bandingkan hasilnya" },
            ].map((item) => (
              <div key={item.issue} className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
                <p className="font-black text-slate-900">⚠ {item.issue}</p>
                <p className="text-slate-500"><strong>Dampak:</strong> {item.impact}</p>
                <p className="text-slate-500"><strong>Rekomendasi:</strong> {item.fix}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pb-8">
          Laporan lengkap: <code>dataanalysis/SIDEPAK_HEALTH_SCORE_JUSTIFICATION.md</code>
        </p>
      </div>
    </div>
  );
}
