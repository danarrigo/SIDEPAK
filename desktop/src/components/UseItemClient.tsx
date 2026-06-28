"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { useItem } from "@/actions/gamification";

interface Props {
  currentMemberId: number;
  targetMemberId?: number;
  inventory: any[];
}

export default function UseItemClient({ currentMemberId, targetMemberId, inventory }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    if (!targetMemberId) {
      alert("Anda harus memiliki lawan terlebih dahulu!");
      return;
    }
    setIsOpen(true);
    setError(null);
    setSuccess(null);
  };
  
  const handleClose = () => setIsOpen(false);

  const handleUseItem = async (itemId: number) => {
    if (!targetMemberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await useItem(currentMemberId, itemId, targetMemberId);
      if (res.success) {
        setSuccess(`Item berhasil digunakan! Efek: ${res.effect}`);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setError(res.error || "Gagal menggunakan item.");
      }
    } catch(err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const modalContent = isOpen && (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
       <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose}></div>
       <div className="w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-hide bg-surface-container-high/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl relative p-8 z-10 transform transition-all animate-scale-up">
         <button onClick={handleClose} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-white/10 transition-colors">
           <span className="material-symbols-outlined">close</span>
         </button>
         
         <div className="text-center mb-6">
           <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
             <span className="material-symbols-outlined text-3xl text-primary">auto_fix_high</span>
           </div>
           <h3 className="font-headline-md text-2xl font-black text-on-surface">Gunakan Item</h3>
           <p className="text-sm text-on-surface-variant mt-2 font-medium">Pilih item dari inventory Anda</p>
         </div>

         {error && (
           <div className="p-4 bg-error/10 border border-error/20 text-error text-sm rounded-xl mb-4 flex items-start gap-3">
             <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
             <span className="font-medium">{error}</span>
           </div>
         )}
         {success && (
           <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-xl mb-4 flex items-start gap-3">
             <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">check_circle</span>
             <span className="font-medium">{success}</span>
           </div>
         )}
         
         <div className="space-y-4">
           {inventory.length === 0 ? (
             <p className="text-on-surface-variant text-center py-8 font-medium">Inventory kosong.</p>
           ) : (
             inventory.map((inv: any) => (
               <div key={inv.id} className="p-5 rounded-2xl bg-surface-container-lowest/50 border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container-highest transition-colors">
                 <div>
                   <h4 className="font-bold text-on-surface">{inv.item.name}</h4>
                   <p className="text-xs text-on-surface-variant mt-1">{inv.item.description}</p>
                   <p className="text-sm font-black text-primary mt-2">Jumlah: {inv.quantity}</p>
                 </div>
                 <button 
                   disabled={loading}
                   onClick={() => handleUseItem(inv.item.id)} 
                   className="px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-on-primary rounded-xl font-bold text-sm shadow-md hover:shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 ml-4 shrink-0"
                 >
                   {loading ? "..." : "Pakai"}
                 </button>
               </div>
             ))
           )}
         </div>
       </div>
     </div>
  );

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-on-primary font-bold rounded-full mb-6 hover:shadow-primary/30 shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        Gunakan Item
      </button>
      {mounted && isOpen && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </>
  );
}
