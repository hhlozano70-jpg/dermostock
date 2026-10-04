import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <article 
      aria-hidden="true"
      className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden animate-pulse"
    >
      {/* Image Area Skeleton */}
      <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
        <div className="w-24 h-24 rounded-2xl bg-slate-200/70" />
        <div className="absolute top-2.5 left-2.5 w-16 h-4 rounded-full bg-slate-200" />
        <div className="absolute top-2.5 right-2.5 w-20 h-4 rounded-full bg-slate-200" />
      </div>

      {/* Content Details Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Merchant & Title Lines */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-200" />
            <div className="w-24 h-3 rounded bg-slate-200" />
          </div>
          <div className="w-4/5 h-4 rounded bg-slate-200" />
          <div className="w-3/5 h-3 rounded bg-slate-100" />
        </div>

        {/* Price & Action Area Skeleton */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="w-20 h-5 rounded bg-slate-200" />
            <div className="w-12 h-2.5 rounded bg-slate-100" />
          </div>
          <div className="w-28 h-9 rounded-xl bg-slate-200" />
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div 
      aria-label="Cargando productos..."
      role="status"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
      <span className="sr-only">Cargando catálogo de productos...</span>
    </div>
  );
};
