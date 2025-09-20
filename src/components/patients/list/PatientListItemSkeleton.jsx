import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientListItemSkeleton() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 bg-white rounded-xl p-4 border border-slate-100">
      {/* Avatar e Nome */}
      <div className="col-span-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      {/* Contato */}
      <div className="hidden md:flex col-span-3 flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      {/* Idade/Plano */}
      <div className="hidden lg:flex col-span-2 flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Status */}
      <div className="hidden lg:flex col-span-1 justify-start">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Ações */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}