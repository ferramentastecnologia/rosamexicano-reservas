# Rosa Mexicano - Sistema de Reservas Final de Ano

Landing page para reservas de confraternização de final de ano do Rosa Mexicano Restaurante com integração de pagamento via Asaas.

## Funcionalidades

- ✅ Landing page responsiva com design dark inspirado no site oficial
- ✅ Sistema de reservas com seleção de:
  - Data (sextas, sábados e domingos de dezembro)
  - Horário (18:00 às 22:00)
  - Número de pessoas (2 a 12 pessoas)
- ✅ Integração com Asaas para pagamento de R$ 50,00
- ✅ Valor retorna 100% em consumação
- ✅ Webhook para confirmação de pagamento
- ✅ Validação de formulário com React Hook Form

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones
- **Asaas API** - Gateway de pagamento

## Instalação

1. Clone o repositório:
```bash
cd meu-repositorio/rosamexicano-reservas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Adicione sua chave da API do Asaas

```env
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=sua_chave_api_aqui
```

4. Execute o projeto em modo desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3000

## Configuração do Asaas

### 1. Criar conta no Asaas

- Acesse: https://www.asaas.com
- Crie uma conta gratuita
- Acesse o painel: https://www.asaas.com/app

### 2. Obter API Key

1. No painel do Asaas, vá em **Integrações > API**
2. Clique em **Gerar nova chave**
3. Copie a chave gerada
4. Cole no arquivo `.env.local` na variável `ASAAS_API_KEY`

### 3. Modo Sandbox (Testes)

Para testes, use o ambiente sandbox:
- URL: https://sandbox.asaas.com
- API: https://sandbox.asaas.com/api/v3

### 4. Configurar Webhook

1. No painel do Asaas, vá em **Integrações > Webhooks**
2. Adicione uma nova URL de webhook:
   ```
   https://seu-dominio.com/api/webhook
   ```
3. Selecione os eventos:
   - PAYMENT_RECEIVED
   - PAYMENT_CONFIRMED
   - PAYMENT_OVERDUE

### 5. Modo Produção

Quando estiver pronto para produção:
1. Altere a URL no `.env.local`:
   ```env
   ASAAS_API_URL=https://api.asaas.com/v3
   ```
2. Gere uma nova API Key no ambiente de produção
3. Configure o webhook com a URL de produção

## Estrutura do Projeto

```
rosamexicano-reservas/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts          # Endpoint para criar pagamento
│   │   └── webhook/
│   │       └── route.ts          # Endpoint para receber notificações
│   ├── components/
│   │   └── ReservaForm.tsx       # Formulário de reserva
│   ├── lib/                      # Utilitários
│   ├── layout.tsx                # Layout global
│   └── page.tsx                  # Página principal
├── public/                       # Arquivos estáticos
├── .env.local                    # Variáveis de ambiente (não comitar)
├── .env.example                  # Exemplo de variáveis
├── tailwind.config.ts            # Configuração Tailwind
└── package.json                  # Dependências
```

## Fluxo de Reserva

1. **Cliente preenche formulário**
   - Dados pessoais (nome, e-mail, telefone)
   - Data, horário e número de pessoas

2. **Sistema cria cobrança no Asaas**
   - Valor: R$ 50,00
   - Descrição: Detalhes da reserva
   - Métodos: PIX, Boleto ou Cartão

3. **Cliente realiza pagamento**
   - Redirecionado para página do Asaas
   - Escolhe método de pagamento
   - Efetua o pagamento

4. **Webhook confirma pagamento**
   - Asaas envia notificação
   - Sistema registra confirmação
   - Cliente recebe confirmação por e-mail/WhatsApp

## Personalizações

### Alterar datas disponíveis

Edite o arquivo `app/components/ReservaForm.tsx`:

```typescript
// Linha ~80
for (let dia = 15; dia <= 31; dia++) {
  // Altere o range de dias
}
```

### Alterar horários

```typescript
// Linha ~14
const horarios = [
  '18:00', '18:30', '19:00', // Adicione ou remova horários
];
```

### Alterar opções de pessoas

```typescript
// Linha ~17
const opcoesPessoas = [
  { value: 2, label: '2 pessoas' },
  // Adicione mais opções
];
```

### Alterar valor da reserva

Edite a lógica de valor no formulário e na API.

## Deploy

### Vercel (Recomendado)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Execute o deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel

### Outros provedores

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean

## Próximos Passos

- [ ] Implementar banco de dados (PostgreSQL/MongoDB)
- [ ] Sistema de envio de e-mails (Resend/SendGrid)
- [ ] Integração com WhatsApp (Twilio/Evolution API)
- [ ] Painel administrativo para gerenciar reservas
- [ ] Sistema de disponibilidade de mesas
- [ ] Confirmação automática 24h antes
- [ ] Sistema de avaliação pós-evento

## Suporte

Para dúvidas ou problemas:
- Documentação Asaas: https://docs.asaas.com
- Documentação Next.js: https://nextjs.org/docs

## Licença

MIT
