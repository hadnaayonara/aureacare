import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-md border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-4 rounded-xl bg-slate-200 animate-pulse">
            <div className="w-7 h-7 bg-slate-300 rounded"></div>
          </div>
          <div className="text-right flex-1 ml-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 ml-auto mb-2 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 ml-auto animate-pulse"></div>
          </div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mt-4 animate-pulse"></div>
      </CardContent>
    </Card>
  );
}