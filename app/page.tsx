'use client';

import { Calendar, Users, Clock, Check } from 'lucide-react';
import ReservaForm from './components/ReservaForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#B71C1C] to-[#8B0000] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo-rosa-mexicano.png"
                alt="Rosa Mexicano"
                width={180}
                height={60}
                priority
                className="h-14 w-auto drop-shadow-lg"
              />
              <div className="hidden md:block border-l border-white/30 pl-4">
                <p className="text-xs text-white/90 font-light tracking-wide">Rosa Mexicano</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2 rounded-full font-medium">
                Site Oficial de Reservas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden flex items-center">
        {/* Background Image com overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banners/rosa-mexicano-principal.jpg"
            alt="Rosa Mexicano - Fachada"
            fill
            className="object-cover hero-image-enhanced"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm md:text-base text-zinc-300 mb-4 tracking-widest uppercase font-light">
              Rosa Mexicano
            </p>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight text-shadow-lg font-normal">
              Celebre o Final do Ano<br />
              com <span className="text-[#E53935] italic">Sabor Autêntico</span> <span className="text-[#E53935] italic">Mexicano</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Reserve sua mesa e garanta momentos inesquecíveis em nosso ambiente acolhedor.<br />
              <span className="text-[#E53935] font-medium">R$ 50,00</span> <span className="text-sm">de reserva convertidos em consumação</span>
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-300 border-t border-zinc-700 pt-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E53935]" />
                <span className="font-light">Disponível até 31 de dezembro</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#E53935]" />
                <span className="font-light">Grupos de 2 a 60 pessoas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E53935]" />
                <span className="font-light">Horários flexíveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Por que reservar conosco?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E53935] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Ambiente Exclusivo</h4>
                <p className="text-zinc-400">Espaço preparado especialmente para sua confraternização</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E53935] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Cardápio Especial</h4>
                <p className="text-zinc-400">Pratos e bebidas selecionados para a ocasião</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E53935] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Garantia de Mesa</h4>
                <p className="text-zinc-400">Sua mesa reservada com valor retornável em consumação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Reserva */}
      <section id="reserva" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">Faça sua Reserva</h3>
              <p className="text-zinc-400 mb-6">
                Preencha os dados abaixo e garanta sua mesa para o final de ano
              </p>

              {/* Informações Importantes */}
              <div className="max-w-3xl mx-auto mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-[#E53935]">📋 Informações Importantes</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Reservas de <strong>2 a 208 pessoas</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Apenas <strong>múltiplos de 2</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300"><strong>49 mesas disponíveis</strong> por data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Capacidade: <strong>208 pessoas/dia</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Horários: <strong>18:00 às 19:30</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300"><strong>Escolha suas mesas</strong> no mapa</span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <Check className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">
                      <strong className="text-yellow-400">R$ 50,00 retido</strong> em caso de não comparecimento
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <ReservaForm />
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Como funciona?</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Escolha data, horário e número de pessoas</h4>
                  <p className="text-zinc-400">Preencha o formulário com suas preferências</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Pagamento de R$ 50,00</h4>
                  <p className="text-zinc-400">Valor simbólico que retorna 100% em consumação</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Confirmação instantânea</h4>
                  <p className="text-zinc-400">Receba a confirmação da sua reserva por e-mail e WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Fotos */}
      <section className="py-16 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Nosso Ambiente</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/bnu01.jpg"
                  alt="Ambiente Rosa Mexicano"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/bnu02.jpg"
                  alt="Interior do Restaurante"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/bnu03.jpg"
                  alt="Gastronomia Mexicana"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/bnu04.jpg"
                  alt="Especialidades"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/bnu05.jpg"
                  alt="Culinária Mexicana"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/ambiente/a3b363b686c06baa2308326374f9406b.jpg"
                  alt="Experiência Rosa Mexicano"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 bg-black border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Nosso Restaurante</h3>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-[#E53935]">Localização</h4>
                <p className="text-zinc-300">
                  Rua Carlos Rischbieter, 64<br />
                  Victor Konder, Blumenau/SC
                </p>

                <h4 className="text-xl font-semibold text-[#E53935] mt-6">Contato</h4>
                <p className="text-zinc-300">
                  <strong>Telefone:</strong> (47) 3288-3096
                </p>

                <a
                  href="tel:+554732883096"
                  className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#B71C1C] text-white px-6 py-3 rounded-lg transition mt-4"
                >
                  Ligar Agora
                </a>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-[#E53935]">Sobre o Rosa Mexicano</h4>
                <p className="text-zinc-300">
                  O Rosa Mexicano Restaurante traz o autêntico sabor mexicano para Blumenau,
                  oferecendo experiências gastronômicas memoráveis com pratos tradicionais.
                </p>
                <p className="text-zinc-300">
                  Nosso espaço é ideal para confraternizações, reuniões de família e celebrações especiais.
                  Reserve agora e garanta um final de ano inesquecível!
                </p>
              </div>
            </div>

            {/* Mapa do Google Maps */}
            <div className="w-full h-[450px] rounded-lg overflow-hidden border-2 border-[#E53935]/30 shadow-2xl">
              <iframe
                src="https://www.google.com/maps?q=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Rosa Mexicano - Rua Carlos Rischbieter, 64 - Blumenau/SC"
              ></iframe>
            </div>

            <div className="text-center mt-6">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E53935] hover:bg-[#B71C1C] text-white px-8 py-3 rounded-lg transition font-medium shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Como Chegar (Abrir no Google Maps)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center text-zinc-400">
            <Image
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              width={160}
              height={53}
              className="h-12 w-auto mb-6 opacity-90"
            />
            <p className="mb-2 text-white">© 2025 Rosa Mexicano Restaurante</p>
            <p className="text-sm">Sabor Autêntico Mexicano</p>
            <p className="text-xs mt-4">Rua Carlos Rischbieter, 64 - Victor Konder, Blumenau/SC</p>
            <p className="text-xs mt-2">(47) 3288-3096</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
