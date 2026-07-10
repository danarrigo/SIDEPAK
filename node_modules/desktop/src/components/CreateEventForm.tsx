"use client";

import { useState } from "react";
import { createEvent } from "@/actions/events";
import { useRouter } from "next/navigation";

export default function CreateEventForm({ memberId, level }: { memberId: number, level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();

  if (level < 20) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const result = await createEvent(
        memberId,
        name,
        description,
        new Date(startDate),
        new Date(endDate)
      );

      if (result.success) {
        setMessage({ text: result.message || "Event dibuat!", type: "success" });
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setTimeout(() => setIsOpen(false), 2000);
        router.refresh();
      } else {
        setMessage({ text: result.error || "Gagal membuat event", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl shadow-md transition-colors flex items-center gap-2 mb-6"
      >
        <span className="material-symbols-outlined">add</span>
        Buat Event Baru
      </button>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-lg mb-8 animate-fade-in relative">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
      
      <h3 className="text-xl font-bold text-on-surface mb-4">Buat Event Koperasi</h3>
      
      {message.text && (
        <div className={`p-3 rounded-xl mb-4 text-sm ${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Nama Event</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
            placeholder="Contoh: Kerja Bakti Desa"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Deskripsi</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
            placeholder="Jelaskan detail event..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Mulai</label>
            <input
              required
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Selesai</label>
            <input
              required
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin">refresh</span> Menyimpan...</>
          ) : (
            "Simpan Event"
          )}
        </button>
      </form>
    </div>
  );
}
