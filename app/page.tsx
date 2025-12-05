'use client';

import { Calendar, Users, Clock, Check, MapPin, Phone, ChevronDown } from 'lucide-react';
import ReservaForm from './components/ReservaForm';
import { ShaderBackground } from './components/ShaderBackground';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  const scrollToReserva = () => {
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ShaderBackground>
      <div className="min-h-screen text-white">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              width={200}
              height={200}
              priority
              className="h-14 md:h-20 w-auto drop-shadow-lg"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={scrollToReserva}
              className="text-xs text-white bg-[#d71919] hover:bg-[#b71515] px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-[#d71919]/30"
            >
              Reservar Mesa
            </button>
          </div>
        </header>

        {/* Hero Section com Foto */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Imagem de Fundo */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/rosa-mexicano-principal.jpg"
              alt="Rosa Mexicano Restaurante"
              fill
              className="object-cover"
              priority
            />
            {/* Gradiente colorido sobre a imagem */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#d71919]/40 via-[#f98f21]/20 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#234c91]/30 via-transparent to-[#25bcc0]/20" />
          </div>

          {/* Conteúdo do Hero */}
          <div className="relative z-10 container mx-auto px-4 text-center pt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge colorido */}
              <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-[#ffc95b] to-[#f98f21] text-black text-xs font-bold mb-6 shadow-lg">
                Final de Ano 2024/2025
              </div>

              {/* Título com cores */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="text-white drop-shadow-lg">Celebre com</span>
                <br />
                <span className="text-[#ffc95b] drop-shadow-lg">Sabor Mexicano</span>
              </h1>

              {/* Descrição */}
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Reserve sua mesa e viva momentos inesquecíveis com a autêntica culinária mexicana
              </p>

              {/* Destaque do valor */}
              <div className="inline-flex flex-col items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 mb-8 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-[#ffc95b]">R$ 50</span>
                  <span className="text-white/60 text-lg">de reserva</span>
                </div>
                <div className="bg-[#25bcc0] text-black font-bold text-sm px-4 py-1.5 rounded-full">
                  ✓ 100% VIRA CONSUMAÇÃO
                </div>
              </div>

              {/* Botão CTA */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={scrollToReserva}
                  className="bg-gradient-to-r from-[#d71919] to-[#f98f21] hover:from-[#b71515] hover:to-[#d97a1c] text-white font-bold text-lg px-10 py-4 rounded-full transition-all shadow-xl shadow-[#d71919]/40 hover:scale-105"
                >
                  Fazer Reserva Agora
                </button>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-white/80">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4 text-[#ffc95b]" />
                    <span>Até 30/12</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-4 h-4 text-[#25bcc0]" />
                    <span>2 a 60 pessoas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-[#f98f21]" />
                    <span>18h às 19h30</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-8 h-8 text-white/60" />
            </motion.div>
          </div>
        </section>

        {/* Benefícios com cores */}
        <section className="py-16 px-4 bg-gradient-to-b from-black/80 to-[#1a0505]">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Por que escolher o <span className="text-[#f98f21]">Rosa Mexicano</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Ambiente Exclusivo', desc: 'Espaço acolhedor para sua confraternização', color: '#d71919', icon: '🎉' },
                { title: 'Cardápio Especial', desc: 'Pratos autênticos e bebidas selecionadas', color: '#f98f21', icon: '🌮' },
                { title: 'Garantia de Mesa', desc: 'Valor retorna 100% em consumação', color: '#25bcc0', icon: '✨' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:border-white/20 transition-all hover:scale-105"
                  style={{ borderTopColor: item.color, borderTopWidth: '3px' }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: item.color }}>{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário de Reserva */}
        <section id="reserva" className="py-16 px-4 bg-[#1a0505]">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Faça sua <span className="text-[#ffc95b]">Reserva</span>
                </h2>
                <p className="text-white/60 text-sm">
                  Preencha os dados abaixo e garanta sua mesa
                </p>
              </div>

              {/* Info Box colorido */}
              <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-[#d71919]/20 via-[#f98f21]/20 to-[#ffc95b]/20 rounded-2xl p-5 border border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25bcc0]" />
                    <span className="text-white/80">2 a 208 pessoas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25bcc0]" />
                    <span className="text-white/80">Múltiplos de 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25bcc0]" />
                    <span className="text-white/80">49 mesas por data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#ffc95b]" />
                    <span className="text-white/80">208 pessoas/dia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#ffc95b]" />
                    <span className="text-white/80">18:00 às 19:30</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#f98f21]" />
                    <span className="text-white/80">Escolha suas mesas</span>
                  </div>
                </div>
              </div>

              <ReservaForm />
            </motion.div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#1a0505] to-[#0f0808]">
          <div className="container mx-auto max-w-3xl">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Como <span className="text-[#f98f21]">funciona</span>?
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Escolha data, horário e pessoas', desc: 'Preencha o formulário acima', color: '#d71919' },
                { step: 2, title: 'Pague R$ 50,00 via PIX', desc: 'Valor retorna 100% em consumação', color: '#f98f21' },
                { step: 3, title: 'Receba confirmação', desc: 'Por e-mail e WhatsApp na hora', color: '#25bcc0' },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: item.step * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-center bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}88)` }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Galeria */}
        <section className="py-16 px-4 bg-[#0f0808]">
          <div className="container mx-auto max-w-5xl">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Nosso <span className="text-[#ffc95b]">Ambiente</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                '/images/ambiente/bnu01.jpg',
                '/images/ambiente/bnu02.jpg',
                '/images/ambiente/bnu03.jpg',
                '/images/ambiente/bnu04.jpg',
                '/images/ambiente/bnu05.jpg',
                '/images/ambiente/a3b363b686c06baa2308326374f9406b.jpg',
              ].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative aspect-square overflow-hidden rounded-xl group"
                >
                  <Image
                    src={src}
                    alt={`Ambiente ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#d71919]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#0f0808] to-[#1a0505]">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-[#d71919]/10 via-[#f98f21]/10 to-[#ffc95b]/10 rounded-2xl p-6 md:p-8 border border-white/10">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">
                    Visite o <span className="text-[#f98f21]">Rosa Mexicano</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d71919]/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#d71919]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Localização</p>
                        <p className="text-white/60 text-sm">Rua Carlos Rischbieter, 64</p>
                        <p className="text-white/60 text-sm">Victor Konder, Blumenau/SC</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#25bcc0]/20 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#25bcc0]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Contato</p>
                        <p className="text-white/60 text-sm">(47) 3288-3096</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <a
                      href="tel:+554732883096"
                      className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
                    >
                      Ligar Agora
                    </a>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d71919] to-[#f98f21] text-white text-sm font-medium hover:opacity-90 transition-all"
                    >
                      Como Chegar
                    </a>
                  </div>
                </div>

                <div className="h-[280px] md:h-auto rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    src="https://www.google.com/maps?q=Rua+Carlos+Rischbieter,+64+-+Victor+Konder,+Blumenau+-+SC&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '280px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-4 bg-[#0a0303] border-t border-white/5">
          <div className="container mx-auto text-center">
            <Image
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              width={140}
              height={47}
              className="h-10 w-auto mx-auto mb-4"
            />
            <p className="text-white/50 text-sm mb-2">© 2025 Rosa Mexicano Restaurante</p>
            <p className="text-white/30 text-xs">(47) 3288-3096 • Victor Konder, Blumenau/SC</p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="w-3 h-3 rounded-full bg-[#d71919]"></span>
              <span className="w-3 h-3 rounded-full bg-[#f98f21]"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffc95b]"></span>
              <span className="w-3 h-3 rounded-full bg-[#25bcc0]"></span>
              <span className="w-3 h-3 rounded-full bg-[#234c91]"></span>
            </div>
          </div>
        </footer>
      </div>
    </ShaderBackground>
  );
}
