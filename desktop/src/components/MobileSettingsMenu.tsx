"use client";

import React, { useState } from "react";

interface MobileSettingsMenuProps {
  logoutAction: () => void;
  currentPhone: string | null;
  onUpdatePhone: (newPhone: string) => Promise<{ success: boolean; error?: string }>;
}

export default function MobileSettingsMenu({
  logoutAction,
  currentPhone,
  onUpdatePhone,
}: MobileSettingsMenuProps) {
  const [activeModal, setActiveModal] = useState<"security" | "notifications" | "help" | null>(null);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Notification states
  const [notifIuran, setNotifIuran] = useState(true);
  const [notifShu, setNotifShu] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Phone form states
  const [newPhone, setNewPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [obscurePhone, setObscurePhone] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok!" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: "success", text: "Password berhasil diperbarui." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setMessage(null);
        setActiveModal(null);
      }, 1500);
    }, 1000);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneMessage(null);
    if (!newPhone.trim()) {
      setPhoneMessage({ type: "error", text: "Nomor handphone tidak boleh kosong!" });
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await onUpdatePhone(newPhone);
      if (res.success) {
        setPhoneMessage({ type: "success", text: "Nomor handphone berhasil diperbarui." });
        setNewPhone("");
        setTimeout(() => {
          setPhoneMessage(null);
          setActiveModal(null);
        }, 1500);
      } else {
        setPhoneMessage({ type: "error", text: res.error || "Gagal memperbarui nomor handphone." });
      }
    } catch (err: any) {
      setPhoneMessage({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setPhoneLoading(false);
    }
  };

  // Helper to format obscured phone
  const getObscuredPhone = (phone: string | null) => {
    if (!phone) return "-";
    if (phone.length <= 4) return phone;
    return "••••••••" + phone.slice(-4);
  };

  return (
    <div className="space-y-4">
      {/* Pengaturan Card */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[#475569]">Pengaturan</h3>
        <div className="bg-[#6D7D91] rounded-[20px] overflow-hidden text-white shadow-sm flex flex-col">
          {[
            { id: "security", label: "Keamanan & Password" },
            { id: "notifications", label: "Notifikasi" },
            { id: "help", label: "Profil & Kontak" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModal(item.id as any)}
              className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-all border-b border-white/10 last:border-0"
            >
              <span className="text-xs font-bold">{item.label}</span>
              <span className="material-symbols-outlined text-white/50 text-sm">chevron_right</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={() => logoutAction()}
          className="flex items-center justify-center py-3 bg-[#0F172A] text-white hover:bg-slate-800 rounded-xl transition-all w-full font-bold text-xs cursor-pointer"
        >
          Keluar
        </button>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl text-slate-800 relative space-y-4 animate-scale-up">
            <button
              onClick={() => {
                setActiveModal(null);
                setMessage(null);
                setPhoneMessage(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Modal Security */}
            {activeModal === "security" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <span className="material-symbols-outlined">security</span>
                  <h4 className="font-bold text-base">Keamanan & Password</h4>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Password Saat Ini</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Password Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-800 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-800 transition-colors"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 ${
                        message.type === "error"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {message.type === "error" ? "error" : "check_circle"}
                      </span>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[#0F172A] text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : null}
                    Simpan Password
                  </button>
                </form>
              </div>
            )}

            {/* Modal Notifications */}
            {activeModal === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <span className="material-symbols-outlined">notifications_active</span>
                  <h4 className="font-bold text-base">Notifikasi</h4>
                </div>
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Notifikasi Iuran</p>
                      <p className="text-[10px] text-slate-400">Pengingat jatuh tempo iuran bulanan</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifIuran}
                        onChange={(e) => setNotifIuran(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F172A]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Pencairan SHU</p>
                      <p className="text-[10px] text-slate-400">Info saat Sisa Hasil Usaha cair</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifShu}
                        onChange={(e) => setNotifShu(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F172A]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Promo & Info Koperasi</p>
                      <p className="text-[10px] text-slate-400">Update item baru di pasar poin</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifPromo}
                        onChange={(e) => setNotifPromo(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F172A]"></div>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                  }}
                  className="w-full py-2 mt-2 bg-[#0F172A] text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors"
                >
                  Selesai
                </button>
              </div>
            )}

            {/* Modal Profil & Kontak (Ganti Nomor Handphone) */}
            {activeModal === "help" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <span className="material-symbols-outlined">person</span>
                  <h4 className="font-bold text-base">Profil & Kontak</h4>
                </div>
                
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <p className="text-xs font-bold text-slate-700">Ganti Nomor Handphone</p>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Nomor Handphone Saat Ini</label>
                    <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl text-sm font-semibold text-slate-800">
                      <span>{obscurePhone ? getObscuredPhone(currentPhone) : (currentPhone || "-")}</span>
                      <button
                        type="button"
                        onClick={() => setObscurePhone(!obscurePhone)}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {obscurePhone ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Nomor Handphone Baru</label>
                    <input
                      type="text"
                      required
                      placeholder="6281234567890"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 transition-colors"
                    />
                  </div>

                  {phoneMessage && (
                    <div
                      className={`p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 ${
                        phoneMessage.type === "error"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {phoneMessage.type === "error" ? "error" : "check_circle"}
                      </span>
                      {phoneMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={phoneLoading}
                    className="w-full py-2 bg-[#0F172A] text-white font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {phoneLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : null}
                    Simpan Nomor
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
