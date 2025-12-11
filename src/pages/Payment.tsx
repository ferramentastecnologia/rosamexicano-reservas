import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { AlertCircle, CheckCircle, Clock, Copy } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentData = location.state?.paymentData;
  const { status, error } = usePaymentPolling(paymentData?.payment_id);

  useEffect(() => {
    if (!paymentData) {
      navigate('/');
      return;
    }

    // Se pagamento foi confirmado, redirecionar para sucesso
    if (status?.is_confirmed) {
      setTimeout(() => {
        navigate('/sucesso', { state: { paymentData } });
      }, 2000);
    }
  }, [status, navigate, paymentData]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#f98f21] mx-auto mb-4"></div>
          <p className="text-white/60">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const isConfirmed = status?.is_confirmed;
  const isExpired = status?.status === 'EXPIRED';

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Status Confirmado */}
        {isConfirmed && (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#25bcc0]/20 rounded-full p-6 border border-[#25bcc0]/30">
                <CheckCircle className="w-16 h-16 text-[#25bcc0]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#25bcc0] mb-3">Pagamento Confirmado!</h1>
            <p className="text-white/70 mb-6">Seu pagamento foi confirmado com sucesso. Redirecionando...</p>
            <div className="mt-8">
              <button
                onClick={() => navigate('/sucesso', { state: { paymentData } })}
                className="w-full bg-gradient-to-r from-[#d71919] to-[#f98f21] hover:from-[#b71515] hover:to-[#d97a1c] text-white font-bold py-3 rounded-xl transition-all"
              >
                Ver Voucher →
              </button>
            </div>
          </div>
        )}

        {/* Status Expirado */}
        {isExpired && (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#d71919]/20 rounded-full p-6 border border-[#d71919]/30">
                <AlertCircle className="w-16 h-16 text-[#d71919]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#d71919] mb-3">Código Expirado</h1>
            <p className="text-white/70 mb-6">O tempo para pagamento expirou. Por favor, faça uma nova reserva.</p>
            <div className="mt-8">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-[#d71919] to-[#f98f21] hover:from-[#b71515] hover:to-[#d97a1c] text-white font-bold py-3 rounded-xl transition-all"
              >
                ← Fazer Nova Reserva
              </button>
            </div>
          </div>
        )}

        {/* Status Aguardando */}
        {!isConfirmed && !isExpired && (
          <div className="glass-strong rounded-2xl p-8">
            {/* Status Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-[#f98f21]/20 rounded-full p-4">
                  <Clock className="w-12 h-12 text-[#f98f21] animate-spin" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Aguardando Pagamento</h1>
              <p className="text-white/70">Escaneie o código QR abaixo para pagar com PIX</p>
            </div>

            {/* QR Code */}
            <div className="bg-black/40 rounded-xl p-6 flex justify-center mb-8 border border-white/10">
              <img
                src={`data:image/png;base64,${paymentData.pix_qr_code}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>

            {/* Detalhes */}
            <div className="space-y-4 mb-8 p-6 bg-black/30 rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Valor da Reserva:</span>
                <span className="text-2xl font-bold text-[#ffc95b]">R$ {paymentData.amount.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <span className="text-white/60">ID da Reserva:</span>
                <span className="font-mono text-sm text-white/80">{paymentData.reservation_id}</span>
              </div>
              {paymentData.expiration_date && (
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-white/60">Vencimento:</span>
                  <span className="text-sm text-white/80">
                    {new Date(paymentData.expiration_date).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {/* Código Copia e Cola */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-white/80 block mb-2">
                Ou copie o código PIX:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentData.pix_copy_paste}
                  readOnly
                  className="flex-1 bg-black/40 px-4 py-3 rounded-xl border border-white/10 text-white/80 font-mono text-sm focus:outline-none focus:border-[#f98f21]"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentData.pix_copy_paste);
                    alert('Código copiado!');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#d71919] to-[#f98f21] hover:from-[#b71515] hover:to-[#d97a1c] text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-black/30 rounded-xl p-6 border border-white/5 mb-8">
              <h3 className="font-bold text-white mb-4">Como pagar:</h3>
              <ol className="space-y-2 text-sm text-white/70">
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">1.</span>
                  <span>Abra seu banco ou app de pagamento</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">2.</span>
                  <span>Selecione PIX</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">3.</span>
                  <span>Escaneie o código QR ou copie e cole o código</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">4.</span>
                  <span>Confirme o pagamento</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">5.</span>
                  <span>Receba seu voucher automaticamente</span>
                </li>
              </ol>
            </div>

            {/* Info do Benefício */}
            <div className="bg-gradient-to-r from-[#25bcc0]/20 to-[#25bcc0]/5 border border-[#25bcc0]/30 rounded-lg p-4 mb-8 flex items-center gap-3">
              <div className="bg-[#25bcc0] rounded-full p-2 shrink-0">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-[#25bcc0] font-bold text-sm">100% da reserva vira consumação!</p>
                <p className="text-white/60 text-xs">Os R$ 50 serão creditados como valor para gastar no restaurante</p>
              </div>
            </div>

            {/* Mensagens de Erro */}
            {error && (
              <div className="p-4 bg-[#d71919]/20 border border-[#d71919]/50 rounded-lg text-[#ff6b6b] text-sm mb-8">
                <p className="font-semibold mb-1">Erro:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Link de Voltar */}
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-white/60 hover:text-white transition"
              >
                ← Voltar para reservas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
