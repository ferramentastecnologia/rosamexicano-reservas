import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, ChevronDown } from 'lucide-react';
import ReservaForm from '../components/ReservaForm';

export default function Landing() {
  const MAINTENANCE_MODE = true;

  const scrollToReserva = () => {
    const elemento = document.getElementById('reserva');
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner de Manutenção */}
      {MAINTENANCE_MODE && (
        <div className="w-full px-4 py-3 bg-gradient-to-r from-[#d71919] to-[#f98f21] text-white text-center shadow-lg">
          <p className="font-bold text-sm md:text-base max-w-6xl mx-auto">
            🚧 RESERVAS EM MANUTENÇÃO - Temporariamente indisponíveis
          </p>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-rosa-mexicano.png"
            alt="Rosa Mexicano"
            className="h-12 md:h-16 w-auto drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white hidden sm:block">Rosa Mexicano</h1>
        </div>
        <button
          onClick={scrollToReserva}
          className="text-xs text-white bg-[#C2185B] hover:bg-[#a8155a] px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-[#C2185B]/30"
        >
          Reservar Mesa
        </button>
      </header>

      {/* Hero Section com Imagem de Fundo */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/banners/rosa-mexicano-principal.jpg)',
              filter: 'brightness(0.6)'
            }}
          />
          {/* Gradientes coloridos sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#C2185B]/40 via-[#BA68C8]/20 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#BA68C8]/30 via-transparent to-[#FFD700]/20" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          {/* Badge colorido */}
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#C2185B] text-white text-xs font-bold mb-6 shadow-lg">
            Final de Ano 2024/2025
          </div>

          {/* Título com cores */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-white drop-shadow-lg">Celebre com</span>
            <br />
            <span className="text-[#FFD700] drop-shadow-lg">Sabor Mexicano</span>
          </h1>

          {/* Descrição */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Reserve sua mesa e viva momentos inesquecíveis com a autêntica culinária mexicana
          </p>

          {/* Destaque do valor */}
          <div className="inline-flex flex-col items-center gap-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl px-10 py-7 mb-8 border border-white/30 shadow-2xl shadow-[#C2185B]/20">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold text-[#FFD700]">R$ 50</span>
              <span className="text-white/70 text-lg">de reserva</span>
            </div>
            <div className="bg-gradient-to-r from-[#C2185B] via-[#BA68C8] to-[#FFD700] text-white font-bold text-sm px-6 py-2 rounded-full shadow-lg">
              ✓ 100% VIRA CONSUMAÇÃO
            </div>
          </div>

          {/* Botão CTA */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={scrollToReserva}
              className="relative bg-gradient-to-r from-[#C2185B] to-[#FFD700] text-white font-bold text-lg px-12 py-4 rounded-full transition-all shadow-2xl shadow-[#C2185B]/50 hover:shadow-[#C2185B]/70 border border-white/20 hover:scale-105"
            >
              <span className="relative z-10">Fazer Reserva Agora</span>
            </button>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-white/80">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-[#FFD700]" />
                <span>Até 31/12</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-[#BA68C8]" />
                <span>2 a 60 pessoas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-[#C2185B]" />
                <span>18h às 19h30</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#C2185B]/25 via-[#BA68C8]/18 to-[#FFD700]/15">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher o <span className="text-[#FFD700]">Rosa Mexicano</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Ambiente Exclusivo', desc: 'Espaço acolhedor para sua confraternização', color: '#C2185B', icon: '🎉' },
              { title: 'Cardápio Especial', desc: 'Pratos autênticos e bebidas selecionadas', color: '#FFD700', icon: '🌮' },
              { title: 'Garantia de Mesa', desc: 'Valor retorna 100% em consumação', color: '#BA68C8', icon: '✨' },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl p-7 text-center border border-white/30 hover:border-white/50 transition-all hover:shadow-2xl hover:-translate-y-2"
                style={{ borderTopColor: item.color, borderTopWidth: '4px' }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-lg font-bold mb-2" style={{ color: item.color }}>{item.title}</h4>
                <p className="text-white/70 text-sm">{item.desc}</p>
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -z-10"
                  style={{ background: `${item.color}30` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria de Fotos */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#C2185B]/18 via-[#BA68C8]/15 to-[#FFD700]/18">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Nosso <span className="text-[#FFD700]">Ambiente</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: '/images/ambiente/bnu01.jpg', alt: 'Ambiente Rosa Mexicano 1' },
              { src: '/images/ambiente/bnu02.jpg', alt: 'Ambiente Rosa Mexicano 2' },
              { src: '/images/ambiente/bnu03.jpg', alt: 'Ambiente Rosa Mexicano 3' },
              { src: '/images/ambiente/bnu04.jpg', alt: 'Ambiente Rosa Mexicano 4' },
              { src: '/images/ambiente/bnu05.jpg', alt: 'Ambiente Rosa Mexicano 5' },
              { src: '/images/ambiente/a3b363b686c06baa2308326374f9406b.jpg', alt: 'Ambiente Rosa Mexicano 6' },
            ].map((image, i) => (
              <div
                key={i}
                className="relative aspect-[3/2] rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Overlay no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#C2185B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Reserva */}
      <section id="reserva" className="py-16 bg-gradient-to-b from-[#FFD700]/15 via-[#C2185B]/18 to-[#BA68C8]/20">
        {MAINTENANCE_MODE ? (
          // Mensagem de Manutenção
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="glass-strong rounded-2xl p-8 md:p-12 text-center border border-white/10">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Sistema em <span className="text-[#f98f21]">Manutenção</span>
              </h2>
              <p className="text-white/80 text-lg mb-6 leading-relaxed max-w-2xl mx-auto">
                Desculpe! Estamos realizando manutenção no sistema de reservas no momento.
              </p>
              <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
                Por favor, tente novamente em breve. Se tiver dúvidas, entre em contato conosco:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+554732883096"
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#d71919] to-[#f98f21] text-white font-bold hover:shadow-lg hover:shadow-[#d71919]/50 transition-all"
                >
                  📞 Ligar (47) 3288-3096
                </a>
                <a
                  href="https://wa.me/554732883096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-full bg-[#25bcc0] text-white font-bold hover:bg-[#1aa7ab] transition-all"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Formulário Normal
          <>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-12 text-white">Faça sua Reserva</h2>
              <ReservaForm />
            </div>
          </>
        )}
      </section>

      {/* Detalhes */}
      <section className="py-16 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Benefícios da Reserva</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-strong rounded-2xl p-8 text-center border border-white/10">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-3 text-white">Lugar Garantido</h3>
              <p className="text-white/70">Garanta seu lugar com antecedência</p>
            </div>
            <div className="glass-strong rounded-2xl p-8 text-center border border-white/10">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-3 text-white">Voucher Exclusivo</h3>
              <p className="text-white/70">Receba um voucher com QR code para validação</p>
            </div>
            <div className="glass-strong rounded-2xl p-8 text-center border border-white/10">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-3 text-white">Experiência Premium</h3>
              <p className="text-white/70">Defrute da melhor experiência culinária</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              className="h-16 w-auto mb-4 drop-shadow-lg"
            />
            <h3 className="text-2xl font-bold mb-4 text-[#ffc95b]">Rosa Mexicano</h3>
            <p className="text-white/70">
              O melhor lugar para celebrar o seu fim de ano com estilo, música e boa comida.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 text-[#f98f21]">Contato</h4>
            <p className="text-white/70 mb-2">📞 (47) 3288-3096</p>
            <p className="text-white/70 mb-2">📧 contato@rosamexicano.com</p>
            <p className="text-white/70">
              Para suporte admin:{' '}
              <Link to="/admin" className="text-[#f98f21] hover:text-[#ffc95b] transition">
                Acesse aqui
              </Link>
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-8 text-center text-white/50">
          <p>&copy; 2024 Rosa Mexicano. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
