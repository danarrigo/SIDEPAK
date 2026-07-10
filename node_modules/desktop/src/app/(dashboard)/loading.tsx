import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-screen px-4 md:px-6 py-6 md:py-10 pb-32 animate-fade-in flex flex-col gap-6">
      
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-48 h-8 bg-surface-container-highest/50 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-surface-container-highest/50 rounded-full animate-pulse" />
      </div>

      {/* Main Hero Card Skeleton */}
      <div className="w-full h-48 md:h-64 rounded-3xl bg-surface-container-highest/40 border border-outline-variant/20 animate-pulse flex flex-col justify-end p-6 md:p-8">
        <div className="w-32 h-4 bg-surface-container-highest rounded mb-4" />
        <div className="w-64 h-8 bg-surface-container-highest rounded" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 md:h-36 rounded-2xl md:rounded-3xl bg-surface-container-highest/30 border border-outline-variant/10 animate-pulse flex flex-col justify-between p-4 md:p-6">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest/50" />
            <div>
              <div className="w-16 h-3 bg-surface-container-highest/50 rounded mb-2" />
              <div className="w-24 h-5 bg-surface-container-highest/50 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Large Content Block Skeleton */}
      <div className="w-full h-64 mt-4 rounded-3xl bg-surface-container-highest/20 border border-outline-variant/10 animate-pulse p-6 flex flex-col gap-4">
        <div className="w-1/4 h-6 bg-surface-container-highest/40 rounded mb-4" />
        <div className="w-full h-12 bg-surface-container-highest/30 rounded-xl" />
        <div className="w-full h-12 bg-surface-container-highest/30 rounded-xl" />
        <div className="w-full h-12 bg-surface-container-highest/30 rounded-xl" />
      </div>

    </div>
  );
}
