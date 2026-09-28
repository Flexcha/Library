import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`rounded bg-[#ece7dc] animate-shimmer ${className}`} />
);

export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#e6e0d4] rounded-lg overflow-hidden shadow-xs flex flex-col h-full p-4 space-y-3">
    <div className="w-full h-52 bg-[#ece7dc] rounded animate-shimmer" />
    <div className="space-y-2 flex-1 pt-1">
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="h-5 w-4/5" />
      <SkeletonBox className="h-3.5 w-1/2" />
    </div>
    <div className="pt-3 border-t border-[#e6e0d4] flex items-center justify-between">
      <SkeletonBox className="h-4 w-24" />
      <SkeletonBox className="h-8 w-24 rounded" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="w-full overflow-hidden border border-[#e6e0d4] rounded-lg bg-white divide-y divide-[#e6e0d4]">
    <div className="p-3.5 bg-[#f5f2ea] flex items-center gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="p-3.5 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonBox key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#e6e0d4] rounded-lg p-5 space-y-3 shadow-xs">
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-4 w-28" />
      <SkeletonBox className="h-7 w-7 rounded" />
    </div>
    <SkeletonBox className="h-8 w-20" />
    <SkeletonBox className="h-3 w-36" />
  </div>
);
