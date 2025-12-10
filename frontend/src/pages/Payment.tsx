import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentData = location.state?.paymentData;
  const { status, isPolling, error } = usePaymentPolling(paymentData?.payment_id);

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
    return <div>Redirecionando...</div>;
  }

  const isConfirmed = status?.is_confirmed;
  const isExpired = status?.status === 'EXPIRED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Status */}
          <div className="text-center mb-8">
            {isConfirmed ? (
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            ) : isExpired ? (
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <Clock className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
            )}

            <h1 className="text-3xl font-bold mb-2">
              {isConfirmed ? 'Pagamento Confirmado!' : isExpired ? 'QR Expirado' : 'Aguardando Pagamento'}
            </h1>
            <p className="text-gray-600">
              {isConfirmed
                ? 'Seu pagamento foi confirmado com sucesso!'
                : isExpired
                ? 'O código PIX expirou. Por favor, faça uma nova reserva.'
                : 'Escaneie o código QR abaixo para pagar'}
            </p>
          </div>

          {/* QR Code */}
          {!isConfirmed && !isExpired && (
            <div className="bg-white rounded-lg p-4 mb-6 flex justify-center border-2 border-gray-200">
              <img
                src={`data:image/png;base64,${paymentData.pix_qr_code}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
          )}

          {/* Detalhes */}
          <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-bold">R$ {paymentData.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID da Reserva:</span>
              <span className="font-mono text-sm">{paymentData.reservation_id}</span>
            </div>
            {paymentData.expiration_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vencimento:</span>
                <span className="text-sm">
                  {new Date(paymentData.expiration_date).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Código Copia e Cola */}
          {!isConfirmed && !isExpired && (
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-600 block mb-2">
                Ou copie o código PIX:
              </label>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 font-mono text-xs break-all">
                {paymentData.pix_copy_paste}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentData.pix_copy_paste);
                  alert('Código copiado!');
                }}
                className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm"
              >
                Copiar Código
              </button>
            </div>
          )}

          {/* Mensagens */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4">
              {error}
            </div>
          )}

          {isConfirmed && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-4">
              Redirecionando para seu voucher...
            </div>
          )}

          {isExpired && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4">
              Por favor, faça uma nova reserva para gerar um novo código PIX.
            </div>
          )}

          {/* Instruções */}
          {!isConfirmed && !isExpired && (
            <div className="space-y-3 text-sm text-gray-600">
              <h3 className="font-bold text-gray-900">Como pagar:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra seu banco ou app de pagamento</li>
                <li>Selecione PIX</li>
                <li>Escaneie o código QR ou copie o código</li>
                <li>Confirme o pagamento</li>
                <li>Receba seu voucher por email</li>
              </ol>
            </div>
          )}

          {/* Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
            <button
              onClick={() => navigate('/')}
              className="block w-full text-red-500 hover:underline font-semibold"
            >
              ← Voltar para reservas
            </button>
            {isConfirmed && (
              <button
                onClick={() => navigate('/sucesso', { state: { paymentData } })}
                className="block w-full text-green-500 hover:underline font-semibold"
              >
                Ver Voucher →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
