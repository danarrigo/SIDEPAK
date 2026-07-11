"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCurrentMemberPhone, updateCurrentMemberPassword, updateMemberNotifications } from '@/actions/members';

export default function ProfileSettings({ currentPhone, notifications = { notifyIuran: true, notifyShu: true, notifyPromo: true } }: { currentPhone?: string | null, notifications?: { notifyIuran: boolean, notifyShu: boolean, notifyPromo: boolean } }) {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Phone form states
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const [notifyState, setNotifyState] = useState(notifications);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok!' });
      return;
    }
    setLoading(true);
    
    const result = await updateCurrentMemberPassword(newPassword);
    
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Password berhasil diperbarui.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Gagal mengubah kata sandi' });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneNumber) {
      setPhoneMessage({ type: 'error', text: 'Nomor handphone tidak boleh kosong!' });
      return;
    }
    setPhoneLoading(true);
    
    const result = await updateCurrentMemberPhone(newPhoneNumber);
    
    setPhoneLoading(false);
    if (result.success) {
      setPhoneMessage({ type: 'success', text: 'Nomor handphone berhasil diperbarui.' });
      setNewPhoneNumber('');
      router.refresh();
      setTimeout(() => setPhoneMessage(null), 3000);
    } else {
      setPhoneMessage({ type: 'error', text: result.error || 'Gagal memperbarui nomor handphone.' });
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifyState) => {
    const newState = { ...notifyState, [key]: !notifyState[key] };
    setNotifyState(newState);
    await updateMemberNotifications(newState);
  };

  const renderUnderDevelopment = () => (
    <div className="px-6 pb-6 pt-2 animate-fade-in">
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-primary text-2xl">construction</span>
        </div>
        <h4 className="font-headline-sm text-on-surface">Sedang Dikembangkan</h4>
        <p className="text-sm text-on-surface-variant mt-1">Fitur ini akan segera hadir pada pembaruan berikutnya.</p>
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-outline-variant divide-y divide-outline-variant/50">

      {/* Profil & Kontak */}
      <div className="group">
        <button 
          onClick={() => toggleSection('profile')} 
          className="w-full text-left p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="font-body-lg text-body-lg text-on-surface">Profil & Kontak</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Update nomor handphone dan info profil</p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandedSection === 'profile' ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
            chevron_right
          </span>
        </button>
        
        {expandedSection === 'profile' && (
          <div className="px-6 pb-6 pt-2 animate-fade-in">
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30">
              <h4 className="font-headline-sm text-on-surface mb-4">Ganti Nomor Handphone</h4>
              
              {currentPhone && (
                <div className="mb-6 p-4 bg-surface-container-highest rounded-xl border border-outline-variant/50">
                  <p className="text-xs font-bold text-on-surface-variant mb-1">Nomor Handphone Saat Ini</p>
                  <div className="flex items-center justify-between">
                    <p className="font-body-lg text-on-surface font-medium tracking-wider">
                      {showPhone ? currentPhone : '••••••••' + currentPhone.slice(-4)}
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setShowPhone(!showPhone)}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPhone ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Nomor Handphone Baru</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="6281234567890"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-container-highest border border-outline rounded-lg text-sm text-on-surface focus:border-primary outline-none transition-colors"
                  />
                </div>
                
                {phoneMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${phoneMessage.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                    <span className="material-symbols-outlined text-sm">{phoneMessage.type === 'error' ? 'error' : 'check_circle'}</span>
                    {phoneMessage.text}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={phoneLoading}
                    className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {phoneLoading ? <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span> : null}
                    Simpan Nomor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Keamanan & Password */}
      <div className="group">
        <button 
          onClick={() => toggleSection('security')} 
          className="w-full text-left p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">security</span>
            </div>
            <div>
              <p className="font-body-lg text-body-lg text-on-surface">Keamanan & Password</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Update password, 2FA, dan biometrik</p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandedSection === 'security' ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
            chevron_right
          </span>
        </button>
        
        {expandedSection === 'security' && (
          <div className="px-6 pb-6 pt-2 animate-fade-in">
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30">
              <h4 className="font-headline-sm text-on-surface mb-4">Ganti Password</h4>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Password Saat Ini</label>
                  <input 
                    type="password" 
                    required 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-container-highest border border-outline rounded-lg text-sm text-on-surface focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Password Baru</label>
                    <input 
                      type="password" 
                      required 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-highest border border-outline rounded-lg text-sm text-on-surface focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-highest border border-outline rounded-lg text-sm text-on-surface focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>
                
                {message && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                    <span className="material-symbols-outlined text-sm">{message.type === 'error' ? 'error' : 'check_circle'}</span>
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span> : null}
                    Simpan Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Notifikasi */}
      <div className="group">
        <button onClick={() => toggleSection('notifications')} className="w-full text-left p-6 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <div>
              <p className="font-body-lg text-body-lg text-on-surface">Notifikasi</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Atur pengingat iuran dan info SHU</p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandedSection === 'notifications' ? 'rotate-90' : 'group-hover:translate-x-1'}`}>chevron_right</span>
        </button>
        {expandedSection === 'notifications' && (
          <div className="p-6 pt-0 border-t border-outline-variant/30 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-bold">Notifikasi Iuran</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Terima pengingat saat mendekati jatuh tempo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifyState.notifyIuran} onChange={() => handleNotificationToggle('notifyIuran')} />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-bold">Pencairan SHU</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Info saat SHU sudah bisa dicairkan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifyState.notifyShu} onChange={() => handleNotificationToggle('notifyShu')} />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md text-on-surface font-bold">Promo Koperasi</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Update item baru dan diskon di pasar poin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifyState.notifyPromo} onChange={() => handleNotificationToggle('notifyPromo')} />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
