# Sistema de Vouchers - Mortadella Ristorante

## ✅ Sistema Completo Implementado

### Arquitetura

```
Cliente → ReservaForm → API create-payment → Asaas
                                ↓
                         Salva no Banco (SQLite)
                                ↓
                          Redireciona para Asaas
                                ↓
                       Cliente faz pagamento
                                ↓
                        Asaas envia Webhook
                                ↓
                        API webhook processa
                                ↓
                    Gera Voucher + QR Code + PDF
                                ↓
                        Envia Email com PDF
                                ↓
                    Cliente vê voucher em /sucesso
```

### Arquivos Criados

#### 1. Banco de Dados (Prisma + SQLite)
- `prisma/schema.prisma` - Schema com tabelas Reservation e Voucher
- `prisma/migrations/` - Migrações do banco
- `prisma/dev.db` - Banco SQLite local

#### 2. Libraries e Helpers
- `lib/prisma.ts` - Cliente Prisma singleton
- `lib/voucher-helpers.ts` - Geração de códigos e QR Code
- `lib/pdf-generator.ts` - Geração de PDF com QR Code
- `lib/email-sender.ts` - Envio de email com Nodemailer

#### 3. APIs
- `app/api/create-payment/route.ts` - Cria cliente e cobrança no Asaas, salva reserva
- `app/api/webhook/route.ts` - Recebe notificação do Asaas, gera voucher, envia email
- `app/api/get-voucher/route.ts` - Retorna voucher gerado por paymentId

#### 4. Componentes Atualizados
- `app/components/ReservaForm.tsx` - Agora chama `/api/create-payment`
- `app/sucesso/page.tsx` - Busca e exibe voucher gerado

### Fluxo Completo

1. **Cliente preenche formulário**
   - Nome, email, telefone
   - Data, horário, número de pessoas

2. **API create-payment**
   - Cria cliente no Asaas
   - Cria cobrança de R$ 50,00
   - Salva reserva no banco com status "pending"
   - Retorna URL de pagamento

3. **Cliente é redirecionado para Asaas**
   - Pode pagar via PIX, Boleto ou Cartão

4. **Asaas envia webhook após pagamento**
   - Evento: PAYMENT_RECEIVED ou PAYMENT_CONFIRMED

5. **API webhook processa**
   - Busca reserva no banco
   - Gera código único: `MOR-XXXXXXXX-XXXXXXXX`
   - Cria dados do QR Code (JSON com info da reserva)
   - Salva voucher no banco
   - Atualiza status da reserva para "confirmed"
   - Gera PDF profissional com voucher e QR Code
   - Envia email com PDF anexo

6. **Cliente vê voucher na página de sucesso**
   - Código do voucher destacado
   - Detalhes da reserva
   - Instruções de uso

### Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL="file:./dev.db"

# Asaas API Configuration
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=sua_api_key_aqui

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app_gmail
```

### Configuração do Email (Gmail)

1. Acesse https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Vá em "Senhas de app"
4. Crie uma nova senha de app para "Email"
5. Use essa senha no `EMAIL_PASS`

### Configuração do Webhook no Asaas

1. Acesse https://sandbox.asaas.com (ou https://www.asaas.com em produção)
2. Vá em Configurações → Webhooks
3. Adicione a URL: `https://seu-dominio.com/api/webhook`
4. Marque os eventos:
   - PAYMENT_RECEIVED
   - PAYMENT_CONFIRMED
   - PAYMENT_OVERDUE
   - PAYMENT_DELETED

### Comandos

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Criar migração
npx prisma migrate dev --name init

# Rodar em desenvolvimento
npm run dev

# Ver banco de dados
npx prisma studio
```

### Estrutura do Banco de Dados

#### Tabela: Reservation
- `id` - ID único
- `paymentId` - ID do pagamento no Asaas (único)
- `externalRef` - Referência externa (RESERVA-timestamp)
- `nome` - Nome do cliente
- `email` - Email do cliente
- `telefone` - Telefone do cliente
- `data` - Data da reserva (YYYY-MM-DD)
- `horario` - Horário (HH:MM)
- `numeroPessoas` - Número de pessoas
- `valor` - Valor (50.00)
- `status` - Status (pending, confirmed, cancelled)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

#### Tabela: Voucher
- `id` - ID único
- `reservationId` - ID da reserva (FK, único)
- `codigo` - Código do voucher (único, MOR-XXXXXXXX-XXXXXXXX)
- `valor` - Valor (50.00)
- `qrCodeData` - Dados do QR Code (JSON)
- `utilizado` - Se foi utilizado (boolean)
- `dataUtilizacao` - Data de utilização
- `dataValidade` - Data de validade (2025-12-31)
- `pdfUrl` - URL do PDF (opcional)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Formato do Código do Voucher

```
MOR-K7X9M2Q5-M7XQ9Z8W
 │   │        │
 │   │        └─ Timestamp em base-36
 │   └─ 8 caracteres aleatórios
 └─ Prefixo Mortadella
```

Caracteres usados: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem I, O, 0, 1)

### Formato do QR Code

```json
{
  "codigo": "MOR-K7X9M2Q5-M7XQ9Z8W",
  "restaurante": "Mortadella Ristorante",
  "valor": 50.00,
  "data": "2024-12-25",
  "horario": "20:00",
  "pessoas": 4,
  "nome": "João Silva",
  "validade": "2025-12-31"
}
```

### PDF Gerado

O PDF inclui:
- Header verde com logo
- Código do voucher grande e destacado
- QR Code (300x300px)
- Detalhes da reserva
- Informações importantes
- Endereço e contato do restaurante

### Email Enviado

- Assunto: `✅ Reserva Confirmada - [data] às [horário]`
- HTML formatado com design profissional
- Código do voucher destacado
- Detalhes da reserva
- Próximos passos
- PDF anexo

### Próximos Passos (Opcional)

- [ ] Implementar dashboard admin para visualizar reservas
- [ ] Adicionar validação de voucher (verificar se já foi usado)
- [ ] Implementar cancelamento de reserva
- [ ] Adicionar notificações WhatsApp via Evolution API
- [ ] Migrar de SQLite para PostgreSQL em produção
- [ ] Implementar rate limiting nas APIs
- [ ] Adicionar testes automatizados

### Produção

Para deploy em produção:

1. Atualizar `.env.local` com credenciais de produção
2. Mudar `ASAAS_API_URL` para `https://api.asaas.com/v3`
3. Configurar banco PostgreSQL
4. Atualizar webhook URL no Asaas
5. Deploy no Vercel ou servidor Node.js

---

**Sistema 100% funcional e pronto para uso!** 🎉
