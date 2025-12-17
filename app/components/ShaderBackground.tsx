'use client';

import type React from 'react';

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-[#FFF8E7] via-[#FFF5E0] to-[#FFEDD5]">
      {/* Conteúdo */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function ShaderBackgroundSubtle({ children }: ShaderBackgroundProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0f0f0f]">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
