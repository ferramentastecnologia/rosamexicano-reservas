'use client';

// Componente base de skeleton
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 rounded ${className}`}
    />
  );
}

// Card skeleton para dashboard
export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-8" />
      </div>
      <Skeleton className="w-24 h-4" />
    </div>
  );
}

// Dashboard skeleton completo
export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="w-48 h-8 mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <Skeleton className="w-8 h-8 mb-4" />
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-full h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="w-full h-5" />
        </td>
      ))}
    </tr>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="w-20 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mesa skeleton para seleção de mesas
export function MesasSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <Skeleton className="w-40 h-6 mb-4" />
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
