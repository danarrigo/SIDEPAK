"use client";
import React, { useState, useTransition } from "react";
import { buyShopItem, buyMarketplaceItem, listMarketplaceItem } from "@/actions/shop";
import { useRouter } from "next/navigation";

type InAppItem = { id: number, name: string, description: string | null, priceInPoints: number, effectType: string | null };
type PhysicalItem = { id: number, name: string, description: string | null, priceInPoints: number, stock: number, imageUrl: string | null, sellerId: number, seller?: { namaLengkap: string } };

export default function MarketplaceClient({ memberId, inAppItems, physicalItems }: { memberId: number, inAppItems: InAppItem[], physicalItems: PhysicalItem[] }) {
  const [activeTab, setActiveTab] = useState<"in_app" | "physical">("physical");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // List Item Form State
  const [showListForm, setShowListForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", priceInPoints: 0, stock: 1, imageUrl: "" });

  const handleBuyInApp = (itemId: number) => {
    if (confirm("Yakin ingin membeli Power-Up ini?")) {
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
    <div className="space-y-6">
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
          Power-Ups
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
          {inAppItems.length === 0 && <p className="text-on-surface-variant">Belum ada power-up tersedia.</p>}
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
  );
}
