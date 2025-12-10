import { Link } from 'react-router-dom';
import ReservaForm from '../components/ReservaForm';

export default function Landing() {
  const MAINTENANCE_MODE = false; // ✅ MODO DE MANUTENÇÃO DESATIVADO - SISTEMA OPERACIONAL

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Banner de Manutenção */}
      {MAINTENANCE_MODE && (
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-4 px-4 text-center shadow-lg">
          <p className="font-bold text-sm md:text-base">
            🚧 SISTEMA EM MANUTENÇÃO - Reservas temporariamente indisponíveis
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 px-4 md:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Rosa Mexicano
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Celebração de Fim de Ano
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Reservas para 24 a 31 de Dezembro de 2024
          </p>
          <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold">
            R$ 50,00 por pessoa
          </div>
        </div>
      </section>

      {/* Formulário de Reserva */}
      <section className="py-16 px-4 bg-gray-50">
        {MAINTENANCE_MODE ? (
          // Mensagem de Manutenção
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg p-12 text-center border-2 border-orange-500/50">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Sistema em Manutenção
            </h2>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Desculpe! Estamos realizando manutenção no sistema de reservas no momento.
            </p>
            <p className="text-gray-600 text-base mb-8">
              Por favor, tente novamente em breve. Se tiver dúvidas, entre em contato conosco:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+554732883096"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:opacity-90 transition-all shadow-lg inline-block"
              >
                📞 Ligar (47) 3288-3096
              </a>
              <a
                href="https://wa.me/554732883096"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 transition-all shadow-lg inline-block"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        ) : (
          // Formulário Normal
          <>
            <h2 className="text-4xl font-bold text-center mb-12">Faça sua Reserva</h2>
            <ReservaForm />
          </>
        )}
      </section>

      {/* Detalhes */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Benefícios da Reserva</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-3">Lugar Garantido</h3>
              <p className="text-gray-600">Garanta seu lugar com antecedência</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-3">Voucher Exclusivo</h3>
              <p className="text-gray-600">Receba um voucher com QR code para validação</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-3">Experiência Premium</h3>
              <p className="text-gray-600">Defrute da melhor experiência culinária</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Rosa Mexicano</h3>
            <p className="text-gray-400">
              O melhor lugar para celebrar o seu fim de ano com estilo, música e boa comida.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contato</h4>
            <p className="text-gray-400 mb-2">📞 (11) 3000-0000</p>
            <p className="text-gray-400 mb-2">📧 contato@rosamexicano.com</p>
            <p className="text-gray-400">
              Para suporte admin:{' '}
              <Link to="/admin" className="text-red-500 hover:underline">
                Acesse aqui
              </Link>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Rosa Mexicano. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
