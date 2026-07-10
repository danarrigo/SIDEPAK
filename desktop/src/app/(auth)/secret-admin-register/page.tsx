"use client";
import React, { useState, useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import { signupAdmin } from "@/actions/auth";

const initialState = {
  error: "",
};

// API Types (ibnux/data-indonesia)
interface LocationType { id: string; nama: string; }

export default function AdminSignupPage() {
  const [state, formAction, pending] = useActionState(signupAdmin, initialState);

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

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0F172A] p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="mb-8 text-center relative z-10">
          <div className="inline-block bg-slate-900 text-tertiary p-3 rounded-2xl mb-4 shadow-lg">
            <span className="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Registrasi Pengurus</h1>
          <p className="text-sm text-slate-500 mt-2">Halaman rahasia untuk mendaftar sebagai Admin Koperasi</p>
        </div>

        <form 
          ref={formRef}
          action={formAction} 
          className="space-y-6 relative z-10"
          onChange={checkFormValidity}
          onKeyUp={checkFormValidity}
          onBlur={handleBlur}
          onInput={handleInput}
        >
          {state?.error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="namaLengkap">Nama Lengkap</label>
              <input id="namaLengkap" name="namaLengkap" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="John Doe" />
              {errors.namaLengkap && <p className="text-red-500 text-xs font-semibold">{errors.namaLengkap}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nik">NIK (16 Digit)</label>
              <input id="nik" name="nik" type="text" required pattern="\d{16}" minLength={16} maxLength={16} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="3201..." />
              {errors.nik && <p className="text-red-500 text-xs font-semibold">{errors.nik}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="admin@koperasi.com" />
              {errors.email && <p className="text-red-500 text-xs font-semibold">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Kata Sandi</label>
              <input id="password" name="password" type="password" required minLength={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Minimal 6 karakter" />
              {errors.password && <p className="text-red-500 text-xs font-semibold">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="nomorHp">Nomor HP</label>
              <input id="nomorHp" name="nomorHp" type="tel" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="0812..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="pekerjaan">Jabatan/Pekerjaan</label>
              <input id="pekerjaan" name="pekerjaan" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Ketua Koperasi" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Domisili & Koperasi</h3>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100 appearance-none"
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
                      Sistem Tersedia
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Koperasi otomatis dipilih dan dibuat berdasarkan domisili Anda.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !isFormValid}
            className="w-full bg-slate-900 hover:bg-slate-800 text-tertiary font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 mt-4"
          >
            {pending ? "Memproses..." : "Daftar Sebagai Admin"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 relative z-10">
          Kembali ke halaman{' '}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
