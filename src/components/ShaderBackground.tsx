import { MeshGradient } from '@paper-design/shaders-react';
import type React from 'react';

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

// Paleta Rosa Mexicano
// #ffc95b - Amarelo
// #d71919 - Vermelho
// #f98f21 - Laranja
// #25bcc0 - Turquesa
// #234c91 - Azul

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#1a0505]">
      {/* Background Shader - Mesh Gradient vibrante com cores mexicanas */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-80"
        colors={['#d71919', '#f98f21', '#ffc95b', '#25bcc0', '#234c91']}
        speed={0.12}
      />

      {/* Overlay mais leve para manter cores vibrantes */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

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
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={['#d71919', '#f98f21', '#ffc95b', '#25bcc0', '#234c91']}
        speed={0.08}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
