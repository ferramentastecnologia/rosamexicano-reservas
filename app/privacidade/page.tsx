'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaPrivacidade() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> Dezembro de 2024
          </p>

          <p className="text-gray-700 mb-6">
            O Rosa Mexicano Restaurante ("nós", "nosso" ou "Restaurante") está comprometido com a proteção
            dos seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos e
            protegemos suas informações quando você utiliza nosso sistema de reservas.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Dados que Coletamos</h2>
          <p className="text-gray-700 mb-4">
            Para processar sua reserva, coletamos os seguintes dados pessoais:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone/WhatsApp</li>
            <li>Data e horário da reserva</li>
            <li>Número de pessoas</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Finalidade do Tratamento</h2>
          <p className="text-gray-700 mb-4">
            Seus dados são utilizados exclusivamente para:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Processar e confirmar sua reserva</li>
            <li>Enviar confirmação e voucher por e-mail</li>
            <li>Entrar em contato sobre sua reserva, se necessário</li>
            <li>Processar o pagamento da taxa de reserva</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Base Legal</h2>
          <p className="text-gray-700 mb-6">
            O tratamento dos seus dados é realizado com base no seu consentimento (LGPD, Art. 7º, I)
            e para execução do contrato de reserva (LGPD, Art. 7º, V).
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Compartilhamento de Dados</h2>
          <p className="text-gray-700 mb-4">
            Seus dados pessoais <strong>não são compartilhados</strong> com terceiros para fins de marketing.
            Utilizamos apenas:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Asaas (processador de pagamentos):</strong> Recebe apenas dados necessários para
            gerar a cobrança PIX. Seus dados pessoais (nome, email, telefone) não são enviados ao Asaas.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Retenção de Dados</h2>
          <p className="text-gray-700 mb-4">
            Seus dados serão mantidos pelos seguintes períodos:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Dados da reserva: 12 meses após a data da reserva</li>
            <li>Registros de pagamento: 5 anos (conforme legislação fiscal)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Seus Direitos (LGPD)</h2>
          <p className="text-gray-700 mb-4">
            Você tem direito a:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Segurança</h2>
          <p className="text-gray-700 mb-6">
            Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
            <li>Banco de dados seguro com acesso restrito</li>
            <li>Senhas criptografadas</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Contato</h2>
          <p className="text-gray-700 mb-6">
            Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
          </p>
          <ul className="list-none text-gray-700 mb-6 space-y-2">
            <li><strong>E-mail:</strong> contato@rosamexicanoblumenau.com.br</li>
            <li><strong>Telefone:</strong> (47) 3288-3096</li>
            <li><strong>Endereço:</strong> Rua Paul Hering, 61 - Centro, Blumenau/SC</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Alterações</h2>
          <p className="text-gray-700 mb-6">
            Esta política pode ser atualizada periodicamente. A versão mais recente estará sempre
            disponível nesta página.
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
