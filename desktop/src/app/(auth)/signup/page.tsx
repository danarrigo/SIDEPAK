"use client";

import Link from "next/link";
import { signup } from "@/actions/auth";
import { useActionState, useEffect, useState, useRef } from "react";

const initialState = {
  error: "",
};

// API Types (ibnux/data-indonesia)
interface LocationType { id: string; nama: string; }

export default function SignupPage() {
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

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-6">
      <div className="glass-card border border-outline-variant rounded-2xl w-full max-w-2xl p-8 shadow-lg my-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-on-surface">Daftar Akun</h1>
          <p className="text-sm text-on-surface-variant mt-2">Bergabung dengan KopDes hari ini</p>
        </div>

        <form 
          ref={formRef}
          action={formAction} 
          className="space-y-6"
          onChange={checkFormValidity}
          onKeyUp={checkFormValidity}
          onBlur={handleBlur}
          onInput={handleInput}
        >
          {state?.error && (
            <div className="bg-error-container text-error p-3 rounded-xl text-sm font-bold">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="namaLengkap">Nama Lengkap</label>
              <input
                id="namaLengkap"
                name="namaLengkap"
                type="text"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="John Doe"
              />
              {errors.namaLengkap && <p className="text-error text-xs font-semibold mt-1.5 ml-1">{errors.namaLengkap}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="nik">NIK</label>
              <input
                id="nik"
                name="nik"
                type="text"
                required
                pattern="\d{16}"
                minLength={16}
                maxLength={16}
                title="NIK harus 16 digit angka"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="16 Digit NIK"
              />
              {errors.nik && <p className="text-error text-xs font-semibold mt-1.5 ml-1">{errors.nik}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="nama@email.com"
              />
              {errors.email && <p className="text-error text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
                placeholder="Min. 6 karakter"
              />
              {errors.password && <p className="text-error text-xs font-semibold mt-1.5 ml-1">{errors.password}</p>}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="text-sm font-bold text-on-surface mb-4">Informasi Domisili & Koperasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="provinsi">Provinsi</label>
                <select
                  id="provinsi"
                  name="provinsi"
                  required
                  defaultValue=""
                  onChange={(e) => {
                    const option = e.target.selectedOptions[0];
                    setSelectedProvId(option.dataset.id || "");
                    // Reset child selects
                    setSelectedRegId("");
                    setSelectedDistId("");
                    setSelectedDesaName("");
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface appearance-none"
                >
                  <option value="" disabled>Pilih Provinsi</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.nama} data-id={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="kabupaten">Kabupaten/Kota</label>
                <select
                  id="kabupaten"
                  name="kabupaten"
                  required
                  disabled={!selectedProvId || regencies.length === 0}
                  value={selectedRegId ? regencies.find(r => r.id === selectedRegId)?.nama : ""}
                  onChange={(e) => {
                    const option = e.target.selectedOptions[0];
                    setSelectedRegId(option.dataset.id || "");
                    // Reset child selects
                    setSelectedDistId("");
                    setSelectedDesaName("");
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Pilih Kabupaten/Kota</option>
                  {regencies.map((r) => (
                    <option key={r.id} value={r.nama} data-id={r.id}>{r.nama}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="kecamatan">Kecamatan</label>
                <select
                  id="kecamatan"
                  name="kecamatan"
                  required
                  disabled={!selectedRegId || districts.length === 0}
                  value={selectedDistId ? districts.find(d => d.id === selectedDistId)?.nama : ""}
                  onChange={(e) => {
                    const option = e.target.selectedOptions[0];
                    setSelectedDistId(option.dataset.id || "");
                    setSelectedDesaName("");
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Pilih Kecamatan</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.nama} data-id={d.id}>{d.nama}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="desa">Desa/Kelurahan</label>
                <select
                  id="desa"
                  name="desa"
                  required
                  disabled={!selectedDistId || villages.length === 0}
                  value={selectedDesaName}
                  onChange={(e) => setSelectedDesaName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Pilih Desa</option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.nama}>{v.nama}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="koperasi">Nama Koperasi</label>
                <select
                  id="koperasi"
                  name="koperasi"
                  required
                  value={selectedDesaName ? `Koperasi ${selectedDesaName}` : ""}
                  onChange={() => {}}
                  disabled={!selectedDesaName}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Pilih Koperasi yang tersedia di Desa Anda</option>
                  {selectedDesaName && (
                    <option value={`Koperasi ${selectedDesaName}`}>
                      Koperasi {selectedDesaName}
                    </option>
                  )}
                </select>
                <p className="text-[10px] text-on-surface-variant mt-1 ml-1">Koperasi yang dipilih harus berada di desa yang sama dengan domisili Anda.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || !isFormValid}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {pending ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
