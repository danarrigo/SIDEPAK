import { getCurrentMember } from "@/actions/members";
import { getCoopHealthScore } from "@/actions/health_score";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kesehatan Koperasi | SIDEPAK Admin",
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const isSehat = label === "Sehat";
  const isWaspada = label === "Waspada";
  const color = isSehat ? "#22c55e" : isWaspada ? "#f59e0b" : "#ef4444";
  const bgColor = isSehat ? "bg-green-500/10" : isWaspada ? "bg-amber-500/10" : "bg-red-500/10";
  const textColor = isSehat ? "text-green-500" : isWaspada ? "text-amber-500" : "text-red-500";
  const borderColor = isSehat ? "border-green-500/30" : isWaspada ? "border-amber-500/30" : "border-red-500/30";

  // SVG circle gauge
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ filter: `drop-shadow(0 0 8px ${color}66)`, transition: "stroke-dasharray 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-slate-900">{score}</span>
          <span className="text-sm text-slate-500 font-bold mt-1">/ 100</span>
        </div>
      </div>
      <span className={`px-5 py-1.5 rounded-full text-sm font-black border ${bgColor} ${textColor} ${borderColor} uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );
}

function DimensionCard({
  label, weight, score, weightedScore, description, detail, icon, color
}: {
  label: string; weight: number; score: number; weightedScore: number;
  description: string; detail: string; icon: string; color: string;
}) {
  const pct = Math.round(score * 100);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-400 font-semibold">Bobot {weight}%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900">{pct}<span className="text-sm font-bold text-slate-400">/100</span></p>
          <p className="text-xs text-slate-400">Kontribusi: <span className="font-bold" style={{ color }}>{Math.round(weightedScore * 100)}pts</span></p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>

      <p className="text-xs text-slate-500 font-semibold mb-1">{description}</p>
      <p className="text-xs text-slate-400 leading-relaxed hidden group-hover:block transition-all">{detail}</p>
    </div>
  );
}

function WeightChart({ dimensions }: { dimensions: Array<{ label: string; weight: number; score: number; color: string }> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-sm">
        <span className="material-symbols-outlined text-slate-400">bar_chart</span>
        Kontribusi Per Dimensi
      </h3>
      <div className="space-y-4">
        {dimensions.map((d) => {
          const actualContrib = Math.round(d.score * d.weight);
          const maxContrib = d.weight;
          return (
            <div key={d.label}>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>{d.label}</span>
                <span style={{ color: d.color }}>{actualContrib} / {maxContrib} pts</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Max weight indicator (light) */}
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${d.color}15` }} />
                {/* Actual contribution */}
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(actualContrib / 35) * 100}%`,
                    backgroundColor: d.color,
                    boxShadow: `0 0 6px ${d.color}55`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function HealthScorePage() {
  const admin = await getCurrentMember();
  if (!admin?.cooperativeId) redirect("/admin");

  const healthData = await getCoopHealthScore(admin.cooperativeId);
  if (!healthData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Gagal memuat data kesehatan koperasi.</p>
      </div>
    );
  }

  const { healthScore, healthLabel, dimensions, cooperativeName, computedAt } = healthData;

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Monitor Kesehatan</p>
        <h1 className="text-3xl font-black text-slate-900">Skor Kesehatan Koperasi</h1>
        <p className="text-slate-500 mt-1 text-sm">{cooperativeName}</p>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gauge Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-sm">
          <ScoreGauge score={healthScore} label={healthLabel} />
          <p className="text-xs text-slate-400 mt-4 text-center">
            Dihitung {new Date(computedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        {/* Weight Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <WeightChart dimensions={dimensions} />
          {/* Score Breakdown Summary */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">Formula Skor</p>
            <code className="text-xs text-slate-300 leading-relaxed block">
              {dimensions.map(d => `${Math.round(d.score * 100)} × ${d.weight}%`).join(" + ")}
              {" = "}<span className="text-tertiary font-black text-base">{healthScore}</span>
            </code>
          </div>
        </div>
      </div>

      {/* Dimension Cards */}
      <div className="mb-8">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">analytics</span>
          Rincian 5 Dimensi Kesehatan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map(({ key, ...restDim }) => (
            <DimensionCard key={key} {...restDim} />
          ))}
          {/* Methodology Card */}
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tentang Model Ini</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skor dihitung menggunakan formula <strong>Weighted Sum Scoring</strong> dengan 5 dimensi berbasis data real database SIDEPAK. Diadaptasi dari metodologi Simkopdes Health Score (1.026 koperasi).
              </p>
            </div>
            <a
              href="/admin/health/methodology"
              className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">article</span>
              Baca Laporan Justifikasi →
            </a>
          </div>
        </div>
      </div>

      {/* Threshold Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">info</span>
          Panduan Interpretasi Skor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <p className="font-black text-green-700">Sehat (≥60)</p>
            </div>
            <p className="text-xs text-green-600">Koperasi beroperasi optimal. Kepatuhan iuran tinggi, anggota aktif, governance berjalan.</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <p className="font-black text-amber-700">Waspada (35–59)</p>
            </div>
            <p className="text-xs text-amber-600">Perlu perhatian. Ada dimensi yang lemah — identifikasi dan intervensi sebelum memburuk.</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <p className="font-black text-red-700">Kritis (&lt;35)</p>
            </div>
            <p className="text-xs text-red-600">Memerlukan tindakan segera. Mayoritas dimensi di bawah ambang batas minimal operasional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
