"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type LoanStatus = {
  status: string;
  count: number;
  totalAmount: number;
};

interface AdminChartsProps {
  loansByStatus: LoanStatus[];
  totalAssets: number;
  totalLoans: number;
}

const COLORS = {
  approved: "#f59e0b", // amber
  paid: "#14b8a6", // teal
  pending: "#94a3b8", // grey
  defaulted: "#f43f5e", // rose
};

const LABEL_MAP: Record<string, string> = {
  approved: "Aktif",
  paid: "Lunas",
  pending: "Menunggu",
  defaulted: "Macet",
};

export default function AdminCharts({ loansByStatus, totalAssets, totalLoans }: AdminChartsProps) {
  // Format data for PieChart
  const pieData = loansByStatus
    .filter((l) => l.count > 0)
    .map((l) => ({
      name: LABEL_MAP[l.status] || l.status,
      value: l.count,
      color: COLORS[l.status as keyof typeof COLORS] || "#cbd5e1",
    }));

  // Format data for BarChart
  const barData = [
    {
      name: "Aset Total",
      amount: totalAssets,
      fill: "#3b82f6", // blue
    },
    {
      name: "Pinjaman Aktif",
      amount: totalLoans,
      fill: "#f59e0b", // amber
    },
  ];

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Pinjaman (Pie Chart) */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 p-6 flex flex-col">
        <h2 className="font-headline-sm text-xl font-bold mb-4 text-slate-900">
          Status Pinjaman (Jumlah)
        </h2>
        {pieData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Belum ada data pinjaman.
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} Pinjaman`, "Jumlah"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-semibold text-slate-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Komposisi Kas (Bar Chart) */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 p-6 flex flex-col">
        <h2 className="font-headline-sm text-xl font-bold mb-4 text-slate-900">
          Komposisi Kas (Aset vs Pinjaman)
        </h2>
        <div className="flex-1 min-h-[250px] relative mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 600 }} />
              <YAxis 
                tickFormatter={(val) => `Rp ${val / 1000000}M`}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                width={80}
              />
              <Tooltip 
                cursor={{ fill: "#f8fafc" }}
                formatter={(value: number) => [formatRupiah(value), "Total"]}
              />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={50}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
