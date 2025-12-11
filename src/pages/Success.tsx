import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Share2, Copy } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentData = location.state?.paymentData;

    if (!paymentData) {
      // Tentar recuperar do localStorage
      const stored = localStorage.getItem('reservaAtual');
      if (!stored) {
        navigate('/');
        return;
      }
      setVoucher(JSON.parse(stored));
    } else {
      setVoucher(paymentData);
    }
    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#f98f21] mx-auto mb-4"></div>
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/60">Redirecionando...</p>
      </div>
    );
  }

  const handleShare = () => {
    const text = `Minha reserva na Rosa Mexicano foi confirmada! Código: ${voucher.voucher_code || 'RM-XXX'}`;
    if (navigator.share) {
      navigator.share({ title: 'Rosa Mexicano', text });
    } else {
      alert('Não foi possível compartilhar');
    }
  };

  const handleDownloadPDF = () => {
    alert('Download do PDF em breve');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Sucesso */}
        <div className="text-center mb-12">
          <div className="bg-[#25bcc0]/20 rounded-full p-4 w-fit mx-auto mb-4 border border-[#25bcc0]/30">
            <CheckCircle className="w-16 h-16 text-[#25bcc0]" />
          </div>
          <h1 className="text-5xl font-bold text-[#25bcc0] mb-2">Reserva Confirmada!</h1>
          <p className="text-white/70 text-lg">
            Seu pagamento foi processado com sucesso e seu voucher está pronto
          </p>
        </div>

        {/* Voucher Card */}
        <div className="glass-strong rounded-2xl overflow-hidden mb-8">
          {/* Header com gradiente vermelho */}
          <div className="bg-gradient-to-r from-[#d71919] to-[#f98f21] text-white p-8 text-center">
            <h2 className="text-4xl font-bold mb-2">ROSA MEXICANO</h2>
            <p className="text-sm opacity-90">Celebração de Fim de Ano 2024/2025</p>
          </div>

          {/* Conteúdo */}
          <div className="p-8 space-y-6">
            {/* Código do Voucher */}
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">SEU CÓDIGO DE VOUCHER</p>
              <div className="bg-black/40 rounded-xl p-4 font-mono text-2xl font-bold text-[#ffc95b] break-all border border-white/10">
                {voucher.voucher_code || 'RM-XXXXXXXX-XXXXXXXX'}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(voucher.voucher_code || '');
                  alert('Código copiado!');
                }}
                className="mt-3 flex items-center justify-center gap-2 text-[#f98f21] hover:text-[#ffc95b] font-semibold transition"
              >
                <Copy className="w-4 h-4" />
                Copiar Código
              </button>
            </div>

            {/* QR Code */}
            {voucher.pix_qr_code && (
              <div className="border-t border-b border-white/10 py-6">
                <p className="text-white/60 text-sm text-center mb-4">QR CODE DA SUA RESERVA</p>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${voucher.pix_qr_code}`}
                    alt="QR Code Voucher"
                    className="w-48 h-48 border border-white/10 rounded-lg bg-white p-2"
                  />
                </div>
              </div>
            )}

            {/* Detalhes da Reserva */}
            <div className="space-y-3">
              <h3 className="font-bold text-white">Detalhes da Reserva</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-white/60 mb-1">Reserva ID</p>
                  <p className="font-mono text-sm text-white/80">{voucher.reservation_id}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-white/60 mb-1">Valor</p>
                  <p className="font-bold text-[#ffc95b]">R$ {(voucher.amount || 50).toFixed(2)}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-white/60 mb-1">Validade</p>
                  <p className="text-sm text-white/80">31/12/2025</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-white/60 mb-1">Status</p>
                  <p className="text-sm font-bold text-[#25bcc0]">✓ Ativo</p>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-gradient-to-r from-[#25bcc0]/20 to-[#25bcc0]/5 border border-[#25bcc0]/30 rounded-lg p-4">
              <h4 className="font-bold text-[#25bcc0] mb-3">Como usar seu voucher:</h4>
              <ol className="space-y-2 text-sm text-white/70">
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">1.</span>
                  <span>Apresente este código QR na entrada do Rosa Mexicano</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">2.</span>
                  <span>Nossos funcionários validarão sua reserva</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#f98f21] font-bold">3.</span>
                  <span>Aproveite sua celebração de fim de ano!</span>
                </li>
              </ol>
            </div>

            {/* Confirmação por email */}
            <div className="bg-gradient-to-r from-[#25bcc0]/10 to-[#25bcc0]/5 border border-[#25bcc0]/20 rounded-lg p-4 text-sm text-[#25bcc0]">
              ✓ Um email com os detalhes foi enviado para seu endereço de email. Verifique sua caixa de entrada ou pasta de spam.
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#d71919] to-[#f98f21] text-white font-bold rounded-xl hover:from-[#b71515] hover:to-[#d97a1c] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Baixar Voucher em PDF
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25bcc0] text-black font-bold rounded-xl hover:bg-[#1aa7ab] transition-all shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar
          </button>
        </div>

        {/* Próximos passos */}
        <div className="glass-strong rounded-2xl p-8 mb-8">
          <h3 className="font-bold text-2xl mb-6 text-[#f98f21]">Próximos Passos</h3>
          <div className="space-y-4 text-sm text-white/70">
            <div className="flex gap-4">
              <span className="text-[#f98f21] font-bold min-w-fit">1.</span>
              <p>Salve seu código de voucher em um local seguro</p>
            </div>
            <div className="flex gap-4">
              <span className="text-[#f98f21] font-bold min-w-fit">2.</span>
              <p>Apresente o QR code ou código na entrada no dia da reserva</p>
            </div>
            <div className="flex gap-4">
              <span className="text-[#f98f21] font-bold min-w-fit">3.</span>
              <p>Aproveite sua experiência no Rosa Mexicano com 100% de crédito!</p>
            </div>
          </div>
        </div>

        {/* Links de navegação */}
        <div className="text-center space-y-3">
          <button
            onClick={() => {
              localStorage.removeItem('reservaAtual');
              navigate('/');
            }}
            className="block w-full text-[#f98f21] hover:text-[#ffc95b] font-semibold transition"
          >
            ← Fazer outra reserva
          </button>
          <p className="text-white/40 text-sm">
            Dúvidas? Contate nosso suporte em contato@rosamexicano.com
          </p>
        </div>
      </div>
    </div>
  );
}
