'use client';

import React from 'react';

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="rounded-xl border border-white/8 bg-[#141414] p-5 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Matchup */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-1 w-8 rounded-full bg-white/10" />
          <div className="h-6 w-12 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/5" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-4 rounded bg-white/5" />
          <div className="h-3 w-12 rounded bg-white/5" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <div className="h-1 w-8 rounded-full bg-white/10" />
          <div className="h-6 w-12 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/5" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-28 rounded-full bg-white/8" />
        <div className="h-6 w-24 rounded-full bg-white/6" />
      </div>

      {/* Button */}
      <div className="h-4 w-24 rounded bg-white/5" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm text-center py-2 animate-pulse">
        Reading tonight&apos;s storylines...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}
