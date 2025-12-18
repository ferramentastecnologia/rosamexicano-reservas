'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermosServico() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#C2185B] hover:text-[#AD1457] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Serviço</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> Dezembro de 2024
          </p>

          <p className="text-gray-700 mb-6">
            Ao utilizar o sistema de reservas do Rosa Mexicano Restaurante, você concorda com os
            termos e condições descritos abaixo.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Objeto</h2>
          <p className="text-gray-700 mb-6">
            Este termo regula a utilização do sistema de reservas online do Rosa Mexicano Restaurante,
            localizado na Rua Paul Hering, 61 - Centro, Blumenau/SC.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Taxa de Reserva</h2>
          <p className="text-gray-700 mb-4">
            Para confirmar sua reserva, é cobrada uma taxa de <strong>R$ 50,00</strong> (cinquenta reais)
            por reserva.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Este valor <strong>não é perdido</strong> - ele se converte em crédito de consumação
            no restaurante.</li>
            <li>O crédito será descontado automaticamente da sua conta no dia da reserva.</li>
            <li>O crédito é válido apenas para a data da reserva confirmada.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Confirmação da Reserva</h2>
          <p className="text-gray-700 mb-6">
            Sua reserva só será considerada confirmada após a confirmação do pagamento via PIX.
            Você receberá um e-mail com o voucher de confirmação contendo um código único.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Política de Cancelamento</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">Cancelamento pelo Cliente</h3>
            <ul className="list-disc pl-6 text-amber-900 space-y-2">
              <li><strong>Com 48 horas ou mais de antecedência:</strong> Reembolso integral de R$ 50,00</li>
              <li><strong>Com menos de 48 horas:</strong> Valor retido como taxa administrativa</li>
              <li><strong>Não comparecimento (no-show):</strong> Valor retido integralmente</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Cancelamento pelo Restaurante</h3>
            <p className="text-blue-900">
              Caso o restaurante precise cancelar sua reserva por motivo de força maior,
              você será notificado e receberá reembolso integral em até 5 dias úteis.
            </p>
          </div>

          <p className="text-gray-700 mb-6">
            Para solicitar cancelamento, entre em contato pelo telefone (47) 3288-3096 ou
            e-mail contato@rosamexicanoblumenau.com.br informando o código do voucher.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Utilização do Voucher</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Apresente o voucher (impresso ou no celular) ao chegar no restaurante</li>
            <li>Informe ao caixa sobre a reserva no momento de pagar a conta</li>
            <li>O valor de R$ 50,00 será descontado do total consumido</li>
            <li>Caso o consumo seja inferior a R$ 50,00, não haverá devolução da diferença</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Tolerância de Horário</h2>
          <p className="text-gray-700 mb-6">
            A reserva será mantida por até <strong>15 minutos</strong> após o horário agendado.
            Após esse período, a mesa poderá ser liberada para outros clientes e a reserva
            será considerada como não comparecimento.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Alteração de Reserva</h2>
          <p className="text-gray-700 mb-6">
            Para alterar data, horário ou número de pessoas, entre em contato com pelo menos
            24 horas de antecedência. Alterações estão sujeitas à disponibilidade.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Responsabilidades</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>O cliente é responsável por fornecer dados corretos no momento da reserva</li>
            <li>O restaurante não se responsabiliza por e-mails não recebidos devido a
            endereços incorretos ou filtros de spam</li>
            <li>É responsabilidade do cliente verificar a confirmação da reserva</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contato</h2>
          <ul className="list-none text-gray-700 mb-6 space-y-2">
            <li><strong>Telefone:</strong> (47) 3288-3096</li>
            <li><strong>E-mail:</strong> contato@rosamexicanoblumenau.com.br</li>
            <li><strong>Endereço:</strong> Rua Paul Hering, 61 - Centro, Blumenau/SC</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Foro</h2>
          <p className="text-gray-700 mb-6">
            Fica eleito o foro da comarca de Blumenau/SC para dirimir quaisquer questões
            decorrentes destes termos.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#C2185B] hover:text-[#AD1457]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
