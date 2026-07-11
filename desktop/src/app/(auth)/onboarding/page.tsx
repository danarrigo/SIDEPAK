"use client";
import React, { useState, useEffect, useRef, useActionState } from "react";
import { useRouter, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signup } from "@/actions/auth";

const initialState = {
  error: "",
};

// API Types (ibnux/data-indonesia)
interface LocationType { id: string; nama: string; }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedPekerjaan, setSelectedPekerjaan] = useState("");

  const [state, formAction, pending] = useActionState(signup, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInput = (target: HTMLInputElement | HTMLSelectElement) => {
    const { name, validity } = target;
    if (!name) return;
    let errorMessage = "";
    if (!validity.valid) {
      if (validity.valueMissing) {
        errorMessage = "Bagian ini harus diisi.";
      } else if (name === "nik" && (validity.patternMismatch || validity.tooShort || validity.tooLong)) {
        errorMessage = "NIK harus tepat 16 digit angka.";
      } else if (name === "password" && validity.tooShort) {
        errorMessage = "Kata sandi minimal 6 karakter.";
      } else if (name === "email" && validity.typeMismatch) {
        errorMessage = "Email tidak valid.";
      } else {
        errorMessage = "Format tidak valid.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement | HTMLSelectElement;
    validateInput(target);
    checkFormValidity();
  };

  const handleInput = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement | HTMLSelectElement;
    if (errors[target.name]) {
      validateInput(target);
    }
    checkFormValidity();
  };

  const checkFormValidity = () => {
    if (formRef.current) {
      setIsFormValid(formRef.current.checkValidity());
    }
  };

  // Location Data States
  const [provinces, setProvinces] = useState<LocationType[]>([]);
  const [regencies, setRegencies] = useState<LocationType[]>([]);
  const [districts, setDistricts] = useState<LocationType[]>([]);
  const [villages, setVillages] = useState<LocationType[]>([]);

  // Selected ID States (for fetching)
  const [selectedProvId, setSelectedProvId] = useState("");
  const [selectedRegId, setSelectedRegId] = useState("");
  const [selectedDistId, setSelectedDistId] = useState("");
  const [selectedDesaName, setSelectedDesaName] = useState("");

  useEffect(() => {
    // Fetch Provinces on mount
    fetch("https://ibnux.github.io/data-indonesia/provinsi.json")
      .then(res => res.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProvId) {
      setRegencies([]);
      setSelectedRegId("");
      return;
    }
    fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${selectedProvId}.json`)
      .then(res => res.json())
      .then(setRegencies)
      .catch(console.error);
  }, [selectedProvId]);

  useEffect(() => {
    if (!selectedRegId) {
      setDistricts([]);
      setSelectedDistId("");
      return;
    }
    fetch(`https://ibnux.github.io/data-indonesia/kecamatan/${selectedRegId}.json`)
      .then(res => res.json())
      .then(setDistricts)
      .catch(console.error);
  }, [selectedRegId]);

  useEffect(() => {
    if (!selectedDistId) {
      setVillages([]);
      return;
    }
    fetch(`https://ibnux.github.io/data-indonesia/kelurahan/${selectedDistId}.json`)
      .then(res => res.json())
      .then(setVillages)
      .catch(console.error);
  }, [selectedDistId]);

  const handleNext = () => {
    if (step === 1 && !selectedGoal) return;
    if (step === 2 && !selectedPekerjaan) return;
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  return (
    <div className="w-full h-full flex bg-white">
      {/* Left Panel - Hidden on mobile, beautiful gradient on desktop */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-[#0F172A] text-white flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Image src="/logo.png" alt="SIDEPAK Logo" width={48} height={48} className="object-contain" />
            <span className="text-2xl font-black tracking-tight">SIDEPAK</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
            Langkah Awal Menuju <span className="text-tertiary">Ekosistem Koperasi.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Bergabunglah dengan ekosistem koperasi digital pertama yang menghubungkan desa-desa di seluruh Indonesia.
          </p>
        </div>

        {/* Mascot */}
        <div className="relative z-10 flex items-end">
        </div>
      </div>

      {/* Right Panel - The Wizard */}
      <div className="flex-1 flex flex-col py-12 px-6 sm:px-12 lg:px-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 3 ? "Lengkapi Profil" : "Personalisasi Akun"}
            </h2>
            <p className="mt-2 text-slate-500">
              {step === 3 ? "Masukkan data diri Anda untuk bergabung" : "Mari sesuaikan pengalaman Koperasi Anda"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 px-1">
              <span className={`transition-colors duration-300 ${step >= 1 ? "text-primary" : ""}`}>1. Tujuan</span>
              <span className={`transition-colors duration-300 ${step >= 2 ? "text-primary" : ""}`}>2. Aktivitas</span>
              <span className={`transition-colors duration-300 ${step >= 3 ? "text-primary" : ""}`}>3. Selesai</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-500">
              <h3 className="text-lg font-bold text-slate-800 mb-5">Apa tujuan utama Anda bergabung?</h3>
              <div className="grid gap-3">
                {[
                  { id: "pinjaman", icon: "account_balance", title: "Pinjaman Modal Usaha", desc: "Akses pembiayaan dengan bunga ringan" },
                  { id: "investasi", icon: "savings", title: "Menabung & Investasi", desc: "Kembangkan aset dengan aman" },
                  { id: "belanja", icon: "storefront", title: "Belanja di Marketplace", desc: "Beli dan jual produk sesama anggota" },
                  { id: "jual", icon: "store", title: "Menjual Barang", desc: "Mulai berjualan di marketplace" },
                  { id: "jasa", icon: "handshake", title: "Networking & Menyediakan Jasa", desc: "Tawarkan keahlian ke anggota lain" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedGoal(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                      selectedGoal === item.id 
                        ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(250,204,21,0.15)] transform scale-[1.02]" 
                        : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors duration-200 ${
                      selectedGoal === item.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
                    }`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedGoal === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm transition-colors duration-200 ${selectedGoal === item.id ? "text-[#0F172A]" : "text-slate-700"}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-500">
              <h3 className="text-lg font-bold text-slate-800 mb-5">Apa pekerjaan atau peran utama Anda saat ini?</h3>
              <div className="grid gap-3">
                {[
                  { id: "Petani / Peternak", icon: "agriculture", title: "Petani / Peternak", desc: "Fokus pada hasil panen dan komoditas" },
                  { id: "Pedagang / UMKM", icon: "storefront", title: "Pedagang / UMKM", desc: "Pemilik warung, toko, atau produksi rumahan" },
                  { id: "Pegawai / Pekerja Formal", icon: "work", title: "Pegawai / Pekerja Formal", desc: "Memiliki penghasilan atau gaji tetap" },
                  { id: "Lainnya", icon: "handyman", title: "Pekerja Lepas / Jasa Lainnya", desc: "Montir, tukang, freelancer, dll" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPekerjaan(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                      selectedPekerjaan === item.id 
                        ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(250,204,21,0.15)] transform scale-[1.02]" 
                        : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors duration-200 ${
                      selectedPekerjaan === item.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
                    }`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedPekerjaan === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm transition-colors duration-200 ${selectedPekerjaan === item.id ? "text-[#0F172A]" : "text-slate-700"}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-500">
              <form 
                ref={formRef}
                action={formAction} 
                className="space-y-5"
                onChange={checkFormValidity}
                onKeyUp={checkFormValidity}
                onBlur={handleBlur}
                onInput={handleInput}
              >
                {/* Hidden inputs */}
                <input type="hidden" name="goal" value={selectedGoal} />
                <input type="hidden" name="pekerjaan" value={selectedPekerjaan} />

                {state?.error && (
                  <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {state.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="namaLengkap">Nama Lengkap</label>
                    <input
                      id="namaLengkap"
                      name="namaLengkap"
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                      placeholder="John Doe"
                    />
                    {errors.namaLengkap && <p className="text-red-500 text-xs font-semibold">{errors.namaLengkap}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nomorHp">Nomor Handphone</label>
                    <input
                      id="nomorHp"
                      name="nomorHp"
                      type="tel"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                      placeholder="081234567890"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nik">NIK</label>
                    <input
                      id="nik"
                      name="nik"
                      type="text"
                      required
                      pattern="\d{16}"
                      minLength={16}
                      maxLength={16}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                      placeholder="16 Digit NIK"
                    />
                    {errors.nik && <p className="text-red-500 text-xs font-semibold">{errors.nik}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                    placeholder="nama@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-semibold">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Kata Sandi</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.password && <p className="text-red-500 text-xs font-semibold">{errors.password}</p>}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Domisili</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="provinsi">Provinsi</label>
                      <select
                        id="provinsi"
                        name="provinsi"
                        required
                        value={selectedProvId ? (provinces.find(p => p.id === selectedProvId)?.nama || "") : ""}
                        onChange={(e) => {
                          const selectedNama = e.target.value;
                          const prov = provinces.find(p => p.nama === selectedNama);
                          setSelectedProvId(prov?.id || "");
                          setSelectedRegId("");
                          setSelectedDistId("");
                          setSelectedDesaName("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                      >
                        <option value="" disabled>Pilih Provinsi</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="kabupaten">Kabupaten/Kota</label>
                      <select
                        id="kabupaten"
                        name="kabupaten"
                        required
                        disabled={!selectedProvId || regencies.length === 0}
                        value={selectedRegId ? (regencies.find(r => r.id === selectedRegId)?.nama || "") : ""}
                        onChange={(e) => {
                          const selectedNama = e.target.value;
                          const reg = regencies.find(r => r.nama === selectedNama);
                          setSelectedRegId(reg?.id || "");
                          setSelectedDistId("");
                          setSelectedDesaName("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                      >
                        <option value="" disabled>Pilih Kabupaten/Kota</option>
                        {regencies.map((r) => (
                          <option key={r.id} value={r.nama}>{r.nama}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="kecamatan">Kecamatan</label>
                      <select
                        id="kecamatan"
                        name="kecamatan"
                        required
                        disabled={!selectedRegId || districts.length === 0}
                        value={selectedDistId ? (districts.find(d => d.id === selectedDistId)?.nama || "") : ""}
                        onChange={(e) => {
                          const selectedNama = e.target.value;
                          const dist = districts.find(d => d.nama === selectedNama);
                          setSelectedDistId(dist?.id || "");
                          setSelectedDesaName("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                      >
                        <option value="" disabled>Pilih Kecamatan</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.nama}>{d.nama}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="desa">Desa/Kelurahan</label>
                      <select
                        id="desa"
                        name="desa"
                        required
                        disabled={!selectedDistId || villages.length === 0}
                        value={selectedDesaName}
                        onChange={(e) => setSelectedDesaName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                      >
                        <option value="" disabled>Pilih Desa</option>
                        {villages.map((v) => (
                          <option key={v.id} value={v.nama}>{v.nama}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="koperasi">Nama Koperasi</label>
                      <div className="relative">
                        <select
                          id="koperasi"
                          name="koperasi"
                          required
                          value={selectedDesaName ? `Koperasi ${selectedDesaName}` : ""}
                          onChange={() => {}}
                          disabled={!selectedDesaName}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                        >
                          <option value="" disabled>Pilih Koperasi yang tersedia di Desa Anda</option>
                          {selectedDesaName && (
                            <option value={`Koperasi ${selectedDesaName}`}>
                              Koperasi {selectedDesaName}
                            </option>
                          )}
                        </select>
                        {selectedDesaName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">
                            <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Tersedia
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Koperasi otomatis dipilih berdasarkan domisili Anda.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !isFormValid}
                    className="flex-[2] bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {pending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        Buat Akun
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 flex gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={(step === 1 && !selectedGoal) || (step === 2 && !selectedPekerjaan)}
                className={`${step === 2 ? 'w-2/3' : 'w-full'} bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Lanjutkan
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
          
          <div className="mt-10 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
