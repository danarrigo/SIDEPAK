import React from "react";

export default function AdminDashboardLoading() {
  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 animate-fade-in flex flex-col gap-8">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="w-64 h-10 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="w-40 h-6 bg-slate-200 rounded animate-pulse" />
        </div>
        
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
          <div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-1 animate-pulse" />
            <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
            <div>
              <div className="w-20 h-8 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 p-6 mt-2">
        <div className="w-48 h-6 bg-slate-200 rounded mb-6 animate-pulse" />
        
        <div className="text-center py-12 flex flex-col items-center border border-dashed border-slate-200 rounded-2xl">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4 animate-pulse" />
          <div className="w-64 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
