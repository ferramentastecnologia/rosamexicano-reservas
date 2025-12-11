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
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!voucher) {
    return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>;
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
    // Implementar download do PDF se disponível
    alert('Download do PDF em breve');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Sucesso */}
        <div className="text-center mb-12">
          <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 style={{fontFamily: 'var(--font-playfair)'}} className="text-5xl font-bold text-green-600 mb-2">Reserva Confirmada!</h1>
          <p className="text-gray-600 text-lg">
            Seu pagamento foi processado com sucesso
          </p>
        </div>

        {/* Voucher Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mb-8 border border-gray-100">
          {/* Header com gradiente vermelho */}
          <div style={{background: 'linear-gradient(135deg, var(--rosa-red), var(--rosa-orange))'}} className="text-white p-8 text-center">
            <h2 style={{fontFamily: 'var(--font-playfair)'}} className="text-4xl font-bold mb-2">ROSA MEXICANO</h2>
            <p className="text-sm opacity-90">Celebração de Fim de Ano 2024/2025</p>
          </div>

          {/* Conteúdo */}
          <div className="p-8 space-y-6">
            {/* Código do Voucher */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">SEU CÓDIGO DE VOUCHER</p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-2xl font-bold text-red-600 break-all">
                {voucher.voucher_code || 'RM-XXXXXXXX-XXXXXXXX'}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(voucher.voucher_code || '');
                  alert('Código copiado!');
                }}
                className="mt-3 flex items-center justify-center gap-2 text-red-500 hover:text-red-700 font-semibold"
              >
                <Copy className="w-4 h-4" />
                Copiar Código
              </button>
            </div>

            {/* QR Code */}
            {voucher.pix_qr_code && (
              <div className="border-t border-b border-gray-200 py-6">
                <p className="text-gray-600 text-sm text-center mb-4">QR CODE DA SUA RESERVA</p>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${voucher.pix_qr_code}`}
                    alt="QR Code Voucher"
                    className="w-48 h-48 border border-gray-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Detalhes da Reserva */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Detalhes da Reserva</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Reserva ID</p>
                  <p className="font-mono text-sm">{voucher.reservation_id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Valor</p>
                  <p className="font-bold">R$ {(voucher.amount || 50).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Validade</p>
                  <p className="text-sm">31/12/2025</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-sm font-bold text-green-600">Ativo</p>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-3">Como usar seu voucher:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                <li>Apresente este código QR na entrada do Rosa Mexicano</li>
                <li>Nossos funcionários validarão sua reserva</li>
                <li>Aproveite sua celebração de fim de ano!</li>
              </ol>
            </div>

            {/* Confirmação por email */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              ✓ Um email com os detalhes foi enviado para seu endereço de email. Verifique sua caixa de entrada ou pasta de spam.
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={handleDownloadPDF}
            style={{background: 'linear-gradient(135deg, var(--rosa-red), var(--rosa-orange))'}}
            className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Baixar Voucher em PDF
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar
          </button>
        </div>

        {/* Próximos passos */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
          <h3 style={{fontFamily: 'var(--font-playfair)', color: 'var(--rosa-red)'}} className="font-bold text-2xl mb-6">Próximos Passos</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-red-500 font-bold">1.</span>
              <p>Salve seu código de voucher em um local seguro</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold">2.</span>
              <p>Apresente o QR code ou código na entrada no dia da reserva</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 font-bold">3.</span>
              <p>Aproveite sua experiência no Rosa Mexicano!</p>
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
            className="block w-full text-red-500 hover:underline font-semibold"
          >
            ← Fazer outra reserva
          </button>
          <p className="text-gray-500 text-sm">
            Dúvidas? Contate nosso suporte em contato@rosamexicano.com
          </p>
        </div>
      </div>
    </div>
  );
}
