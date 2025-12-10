import { useEffect, useState, useCallback } from 'react';
import { paymentAPI } from '../services/api';
import { PaymentStatus } from '../types';

export function usePaymentPolling(paymentId: string | null, interval: number = 3000) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isPolling, setIsPolling] = useState(!!paymentId);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!paymentId) return;

    try {
      const response = await paymentAPI.checkStatus(paymentId);
      setStatus(response.data);

      // Para de fazer polling se pagamento foi confirmado
      if (response.data.is_confirmed) {
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Erro ao verificar status do pagamento:', err);
      setError('Erro ao verificar status do pagamento');
    }
  }, [paymentId]);

  useEffect(() => {
    if (!isPolling || !paymentId) return;

    // Fazer check imediato
    checkStatus();

    // Depois fazer polling
    const timer = setInterval(checkStatus, interval);

    return () => clearInterval(timer);
  }, [paymentId, isPolling, interval, checkStatus]);

  return { status, isPolling, error, stopPolling: () => setIsPolling(false) };
}
