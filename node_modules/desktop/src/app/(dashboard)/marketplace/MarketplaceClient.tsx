"use client";
import React, { useState, useTransition } from "react";
import { buyShopItem, buyMarketplaceItem, listMarketplaceItem } from "@/actions/shop";
import { useRouter } from "next/navigation";

type InAppItem = { id: number, name: string, description: string | null, priceInPoints: number, effectType: string | null };
type PhysicalItem = { id: number, name: string, description: string | null, priceInPoints: number, stock: number, imageUrl: string | null, sellerId: number, seller?: { namaLengkap: string } };

export default function MarketplaceClient({ memberId, points = 0, inAppItems, physicalItems }: { memberId: number, points?: number, inAppItems: InAppItem[], physicalItems: PhysicalItem[] }) {
  const [activeTab, setActiveTab] = useState<"in_app" | "physical">("physical");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // List Item Form State
  const [showListForm, setShowListForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", priceInPoints: 0, stock: 1, imageUrl: "" });

  const handleBuyInApp = (itemId: number) => {
    if (confirm("Yakin ingin membeli item Pasar Poin ini?")) {
      startTransition(async () => {
        const res = await buyShopItem(memberId, itemId);
        if (res.success) {
          alert("Berhasil dibeli!");
          router.refresh();
        } else {
          alert("Gagal: " + res.error);
        }
      });
    }
  };

  const handleBuyPhysical = (itemId: number) => {
    if (confirm("Yakin ingin membeli barang ini dari anggota lain?")) {
      startTransition(async () => {
        const res = await buyMarketplaceItem(memberId, itemId);
        if (res.success) {
          alert("Berhasil dibeli!");
          router.refresh();
        } else {
          alert("Gagal: " + res.error);
        }
      });
    }
  };

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await listMarketplaceItem({ ...formData, sellerId: memberId });
      if (res.success) {
        alert("Barang berhasil didaftarkan ke marketplace!");
        setShowListForm(false);
        setFormData({ name: "", description: "", priceInPoints: 0, stock: 1, imageUrl: "" });
        router.refresh();
      } else {
        alert("Gagal: " + res.error);
      }
    });
  };

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-outline-variant/30">
          <button 
            onClick={() => setActiveTab("physical")}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "physical" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
          >
            Pasar Anggota
          </button>
          <button 
            onClick={() => setActiveTab("in_app")}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "in_app" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
          >
            Pasar Poin
          </button>
        </div>

        {activeTab === "in_app" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up delay-100">
            {inAppItems.map(item => (
              <div key={item.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-outline-variant transition-all">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{item.description}</p>
                  <div className="mt-4 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                    Efek: {item.effectType}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="font-black text-tertiary">{item.priceInPoints} Poin</span>
                  <button 
                    disabled={isPending}
                    onClick={() => handleBuyInApp(item.id)}
                    className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Beli
                  </button>
                </div>
              </div>
            ))}
            {inAppItems.length === 0 && <p className="text-on-surface-variant">Belum ada item Pasar Poin tersedia.</p>}
          </div>
        )}

        {activeTab === "physical" && (
          <div className="space-y-6 animate-slide-up delay-100">
            <div className="flex justify-between items-center">
              <p className="text-sm text-on-surface-variant">Beli barang yang dijual oleh anggota koperasi lain.</p>
              <button 
                onClick={() => setShowListForm(!showListForm)}
                className="border border-primary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">{showListForm ? 'close' : 'add'}</span>
                {showListForm ? "Batal" : "Jual Barang"}
              </button>
            </div>

            {showListForm && (
              <form onSubmit={handleListSubmit} className="glass-card p-6 rounded-2xl border border-primary/30 space-y-4">
                <h3 className="font-bold border-b border-outline-variant/30 pb-2">Daftarkan Barang Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Nama Barang</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Harga (Poin)</label>
                    <input required type="number" min="1" value={formData.priceInPoints} onChange={e => setFormData({...formData, priceInPoints: Number(e.target.value)})} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Stok</label>
                    <input required type="number" min="1" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">URL Gambar (Opsional)</label>
                    <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1">Deskripsi</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                  </div>
                </div>
                <button disabled={isPending} type="submit" className="w-full bg-primary text-on-primary py-2 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50">
                  {isPending ? "Menyimpan..." : "Posting Barang"}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {physicalItems.map(item => (
                <div key={item.id} className="glass-card rounded-2xl flex flex-col justify-between border border-outline-variant transition-all overflow-hidden">
                  <div className="h-40 bg-surface-container-highest relative flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
                    )}
                    <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold border border-outline-variant/50">
                      Sisa {item.stock}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Dijual oleh: <span className="font-bold">{item.seller?.namaLengkap || 'Anggota'}</span></p>
                    <p className="text-sm text-on-surface-variant mt-3 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="p-6 pt-0 mt-auto flex justify-between items-center">
                    <span className="font-black text-tertiary">{item.priceInPoints} Poin</span>
                    {item.sellerId !== memberId ? (
                      <button 
                        disabled={isPending || item.stock <= 0}
                        onClick={() => handleBuyPhysical(item.id)}
                        className="bg-tertiary hover:bg-tertiary/90 text-on-tertiary px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Beli
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">Barang Anda</span>
                    )}
                  </div>
                </div>
              ))}
              {physicalItems.length === 0 && <p className="text-on-surface-variant">Belum ada barang di pasar anggota.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Mobile View (1-to-1 with Flutter app) */}
      <div className="md:hidden flex flex-col min-h-screen bg-[#F1F5F9] pb-24 relative">
        {/* Top Header Section */}
        <div className="bg-[#0F172A] pt-12 px-6 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-white text-2xl font-bold">Marketplace</h1>
            <p className="text-white/60 text-[11px] mt-1">Pasar Anggota & Pasar Poin</p>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#FACC15] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="text-white text-[11px] font-bold">{points} Poin</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 space-y-6">
          {/* Section 1: Toko Item (Power-Ups) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#FACC15] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <h3 className="text-[#1E293B] text-sm font-black">Pasar Poin</h3>
              </div>
              <span className="text-slate-400 text-[11px] font-bold">{inAppItems.length} item</span>
            </div>

            {inAppItems.length === 0 ? (
              <div className="bg-white rounded-[20px] p-6 text-center text-slate-400 text-xs font-bold border border-slate-100">
                Belum ada item di Pasar Poin.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {inAppItems.map(item => (
                  <div key={item.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="text-slate-800 text-xs font-black leading-snug">{item.name}</h4>
                      <p className="text-slate-400 text-[10px] mt-1 line-clamp-3">{item.description}</p>
                      <span className="inline-block bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded mt-2 uppercase">
                        {item.effectType}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <span className="text-amber-500 text-xs font-black">{item.priceInPoints} Poin</span>
                      <button 
                        disabled={isPending}
                        onClick={() => handleBuyInApp(item.id)}
                        className="w-full bg-[#0F172A] text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                      >
                        Beli
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Pasar Anggota */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[#1E293B] text-sm font-black">Pasar Anggota</h3>
              <span className="text-slate-400 text-[11px] font-bold">{physicalItems.length} barang</span>
            </div>

            {physicalItems.length === 0 ? (
              <div className="bg-white rounded-[20px] p-8 text-center text-slate-400 border border-slate-100 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-slate-300 text-4xl">shopping_bag</span>
                <p className="text-xs font-bold">Belum ada barang di pasar anggota.</p>
                <p className="text-[10px] text-amber-500 font-bold">Jadilah yang pertama menjual!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {physicalItems.map(item => {
                  const isOwn = item.sellerId === memberId;
                  return (
                    <div key={item.id} className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="h-28 bg-slate-50 relative flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-3xl">shopping_bag</span>
                        )}
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                          Sisa {item.stock}
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-slate-800 text-xs font-bold line-clamp-1">{item.name}</h4>
                          <p className="text-slate-400 text-[8px] mt-0.5">Penjual: {item.seller?.namaLengkap.split(' ')[0] || 'Anggota'}</p>
                          <p className="text-slate-500 text-[9px] mt-1.5 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
                          <span className="text-amber-500 text-xs font-black">{item.priceInPoints} Poin</span>
                          {isOwn ? (
                            <span className="text-center text-slate-400 text-[8px] font-black uppercase py-1.5 bg-slate-50 rounded">Milik Anda</span>
                          ) : (
                            <button 
                              disabled={isPending || item.stock <= 0}
                              onClick={() => handleBuyPhysical(item.id)}
                              className="w-full bg-[#FACC15] text-[#0F172A] text-[10px] font-black py-1.5 rounded-lg transition-colors"
                            >
                              Beli
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed right-4 bottom-20 z-50">
          <button 
            onClick={() => setShowListForm(true)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-bold text-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Jual Barang</span>
          </button>
        </div>

        {/* Modal Form Overlay */}
        {showListForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-slate-800 text-base font-black">Jual Barang Baru</h3>
                <button 
                  onClick={() => setShowListForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleListSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Barang</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Harga (Poin)</label>
                    <input required type="number" min="1" value={formData.priceInPoints} onChange={e => setFormData({...formData, priceInPoints: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Stok</label>
                    <input required type="number" min="1" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL Gambar (Opsional)</label>
                  <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:bg-white"></textarea>
                </div>

                <button disabled={isPending} type="submit" className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                  {isPending ? "Menyimpan..." : "Posting Barang"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
