'use client';

import { Suspense } from 'react';
import PagamentoDemoContent from './PagamentoDemoContent';
import Image from 'next/image';

export default function PagamentoDemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-[#063d0c] to-[#042808] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo_mortadella_branco.png"
              alt="Mortadella Ristorante"
              width={160}
              height={53}
              className="h-12 w-auto drop-shadow-lg"
            />
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e9a20] mx-auto"></div>
              <p className="mt-4 text-zinc-400">Carregando...</p>
            </div>
          </div>
        }
      >
        <PagamentoDemoContent />
      </Suspense>
    </div>
  );
}
