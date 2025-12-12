# 📋 PLANO DE CONFORMIDADE LEGAL - ROSA MEXICANO

**Status:** ⏸️ EM STANDBY (Aguardando ajustes técnicos e Asaas)
**Data de Criação:** 2025-12-12
**Próximo Passo:** Implementar após resolver integração Asaas

---

## 📋 RESUMO EXECUTIVO

Este documento contém o plano completo para garantir conformidade legal do sistema de reservas com:
- ✅ Código de Defesa do Consumidor (CDC)
- ✅ LGPD (Lei Geral de Proteção de Dados)
- ✅ Direito de Arrependimento (7 dias)
- ✅ Política de Cancelamento e Reembolso

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: Páginas Legais (Privacy Policy + Terms)

**Arquivos a CRIAR:**
```
/app/privacy-policy/page.tsx
/app/terms-and-conditions/page.tsx
```

**Privacy Policy (/app/privacy-policy/page.tsx):**
- O que coletamos: nome, email, telefone, data, horário, número de pessoas
- Por que coletamos: para processar reservas
- Como armazenamos: Prisma ORM + PostgreSQL
- Quem acessa: Asaas (pagamentos), Email service (confirmações)
- Direitos do cliente: acessar dados, deletar, corrigir (LGPD)
- Data Retention: dados mantidos por 24 meses após reserva
- Contato DPO: (a definir com a empresa)
- Links para LGPD explicativo

**Terms & Conditions (/app/terms-and-conditions/page.tsx):**
- Direito de Arrependimento (7 dias CDC)
- Condições especiais para reservas próximas (<7 dias)
- Política de Cancelamento:
  - Mais de 48h antes: reembolso 100%
  - Menos de 48h antes: crédito/voucher (sem reembolso)
  - Após horário: sem reembolso
- Política de No-Show: valor retido se não comparecer
- Consumação Mínima: R$ 50 vira 100% em consumação
- Responsabilidades do cliente e restaurante

---

### FASE 2: Lógica de Cancelamento (CRÍTICA - COM VALIDAÇÕES)

**Arquivo a CRIAR:**
```
/app/api/cancel-reservation/route.ts
```

**Novo Endpoint:**
```typescript
POST /api/cancel-reservation
{
  token: string,              // Token seguro de uma única vez
  reservationId: string,
  reason?: string
}

Resposta:
{
  success: boolean,
  refundable: boolean,        // Se elegível para reembolso
  amount: number,             // Valor (sempre 50.00)
  refundPercentage: number,   // 0 ou 100
  reason: string,             // Por que aceitou/negou
  asaasRefundId?: string,     // ID do refund se foi reembolsado
  voucherCode?: string        // Código de voucher se criou crédito
}
```

**Validações Críticas (NÃO PODEM FALHAR):**

1. **Token válido?**
   - ✅ Gera token único por reserva
   - ✅ Token expira em 24h
   - ✅ Pode ser usado só 1 vez
   - ❌ Se inválido → erro 401

2. **Reserva existe?**
   - ✅ Busca no DB por ID
   - ❌ Se não existe → erro 404

3. **Status permite cancelamento?**
   - ✅ Status: pending, confirmed, approved
   - ❌ Status: cancelled, rejected → erro (já foi processado)

4. **Já passou da hora da reserva?** (CRÍTICO)
   ```typescript
   const reservationDateTime = new Date(`${data}T${horario}`);
   if (now > reservationDateTime) {
     return { refundable: false, reason: "Reservation time already passed" };
   }
   ```

5. **Quanto tempo até a reserva?** (CRÍTICO)
   ```typescript
   const hoursUntil = (reservationDateTime - now) / (1000 * 60 * 60);

   if (hoursUntil >= 48) {
     refundable = true;   // Reembolso 100%
   } else {
     refundable = false;  // Voucher/crédito
   }
   ```

6. **Já foi cancelada?** (Idempotência)
   - ✅ Se já cancelou → retorna erro: "Already cancelled"
   - ❌ Nunca faz refund 2x

7. **Asaas consegue fazer refund?**
   - ✅ Tenta 3x se falhar
   - ⏳ Se continuar falhando → marca como "refund_pending"
   - 🔔 Notifica admin para revisar

---

### FASE 3: Endpoint de Cancelamento com Token

**Arquivo a MODIFICAR:**
```
/app/api/reservations/[id]/cancel-token/route.ts  (CRIAR)
```

**GET /api/reservations/{reservationId}/cancel-token**
- Gera token único
- Token válido por 24h
- Retorna URL com token: `/cancelar?token=xyz&id=abc`

**POST /api/cancel-reservation**
- Recebe token
- Valida token (não expirado, não usado antes)
- Executa cancelamento
- Retorna resultado (reembolso sim/não, voucher criado, etc)

---

### FASE 4: Email Melhorado com Botão Cancelar

**Arquivo a MODIFICAR:**
```
/lib/email-sender.ts
```

**Adicionar ao email de aprovação:**
```html
<div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3>Mudou de ideia?</h3>
  <p>Cancele sua reserva sem problemas:</p>
  <a href="https://seusite.com/cancelar?token=SECURE_TOKEN_HERE"
     style="display: inline-block; padding: 12px 24px; background: #d71919; color: white; text-decoration: none; border-radius: 5px;">
    CANCELAR RESERVA
  </a>
  <p style="color: #666; font-size: 12px; margin-top: 10px;">
    <strong>Prazos de Cancelamento:</strong><br/>
    • Mais de 48h antes: Reembolso 100% ✅<br/>
    • Menos de 48h: Crédito para próxima reserva<br/>
    • Após horário: Sem reembolso
  </p>
</div>
```

---

### FASE 5: Atualização do Banco de Dados

**Arquivo a MODIFICAR:**
```
/prisma/schema.prisma
```

**Adicionar campos ao modelo Reservation:**
```prisma
model Reservation {
  // ... campos existentes ...

  // NOVOS CAMPOS PARA CANCELAMENTO:
  cancelledAt       DateTime?      // Quando foi cancelada
  cancelledBy       String?        // "customer" ou "admin"
  cancelReason      String?        // Motivo do cancelamento
  refundStatus      String?        // "pending" | "completed" | "failed"
  refundedAt        DateTime?      // Quando foi reembolsado
  asaasRefundId     String?        // ID do refund no Asaas
  refundPercentage  Int?           // 0 ou 100
  voucherCreated    Boolean?       // Se criou voucher ao invés
  cancelTokenUsed   Boolean?       // Token já foi usado

  @@index([cancelledAt])
  @@index([refundStatus])
}
```

---

## 🔐 FLUXO COMPLETO DE CANCELAMENTO

```
1. EMAIL CHEGOU COM BOTÃO
   └─ Cliente clica "CANCELAR RESERVA"

2. PÁGINA DE CANCELAMENTO
   └─ URL: /cancelar?token=xyz&id=abc
   └─ Valida token
   └─ Mostra dados da reserva
   └─ Botão: "Confirmar Cancelamento"

3. CONFIRMA CANCELAMENTO
   └─ POST /api/cancel-reservation
   └─ Token enviado
   └─ Sistema valida tudo

4. LÓGICA DE CANCELAMENTO
   ├─ Já passou da hora? (18:10)
   │  └─ SIM: sem reembolso
   │  └─ NÃO: continua
   ├─ Quanto tempo falta?
   │  ├─ >48h: reembolso 100%
   │  │  └─ Chama Asaas refund
   │  └─ <48h: voucher/crédito
   │     └─ Cria novo voucher
   └─ Marca como cancelada

5. CONFIRMAÇÃO
   ├─ Se reembolso: email "Dinheiro volta em 1-2 dias"
   └─ Se voucher: email "Seu crédito de R$ 50 está pronto"
```

---

## ⚠️ EDGE CASES CRÍTICOS (NÃO PODEM FALHAR)

| Cenário | Validação | Resultado |
|---------|-----------|-----------|
| Cliente cancela 2x | Idempotência no DB | Erro: "Já foi cancelada" |
| Cancela APÓS hora | Compara DateTime | Sem reembolso |
| Asaas refund falha | Retry 3x + fallback | Marca "pending", admin vê |
| Token expirado | Valida timestamp | Erro: "Token expirado" |
| Reserva não existe | Busca DB | Erro 404 |
| Status inválido | Whitelist | Erro: "Não pode cancelar" |
| Token já usado | Flag no DB | Erro: "Token já usado" |

---

## 🏦 INTEGRAÇÃO ASAAS

**Pré-requisitos:**
- ✅ API Key configurada
- ✅ Webhook `PAYMENT_CONFIRMED` habilitado
- ✅ Webhook `PAYMENT_REFUNDED` habilitado (opcional mas recomendado)
- ✅ Permissão de refund na API

**Chamada de Refund:**
```typescript
POST /payments/{paymentId}/refund
{
  amount: 50.00,
  description: "Customer cancellation - within refund window"
}

Resposta:
{
  id: "refund_abc123",
  status: "pending",
  amount: 50.00,
  refundedAt: "2025-12-23T15:30:00Z"
}
```

**Tratamento de Erros:**
- Retry automático 3x
- Se falhar: marca como "refund_pending"
- Admin vê em dashboard
- Fallback: manual refund

---

## 📝 PÁGINAS A CRIAR

### 1. `/app/privacy-policy/page.tsx`
- LGPD compliant
- Explicar coleta de dados
- Direitos do consumidor
- Links úteis

### 2. `/app/terms-and-conditions/page.tsx`
- Direito de arrependimento
- Políticas de cancelamento
- Políticas de reembolso
- No-show rules
- Consumação mínima

### 3. `/app/cancelar/page.tsx` (NOVO)
- Formulário de cancelamento
- Mostra dados da reserva
- Botão confirmar/desconfirmar
- Integração com API de cancelamento

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `/app/privacy-policy/page.tsx`
- [ ] Criar `/app/terms-and-conditions/page.tsx`
- [ ] Criar `/app/cancelar/page.tsx`
- [ ] Criar `/app/api/cancel-reservation/route.ts`
- [ ] Criar `/app/api/reservations/[id]/cancel-token/route.ts`
- [ ] Modificar `/lib/email-sender.ts` (adicionar botão)
- [ ] Modificar `/prisma/schema.prisma` (novos campos)
- [ ] Rodar `npx prisma migrate dev`
- [ ] Testes de cancelamento (todas as variações)
- [ ] Testes de refund (sucesso e falha)
- [ ] Testes de edge cases
- [ ] Validar Asaas webhook

---

## 🚀 PRÓXIMOS PASSOS

1. **Verificar Asaas:** Validar webhooks habilitados
2. **Ajustes Técnicos:** Implementar cancelamento + refund
3. **Testes:** Testar todos os cenários
4. **Asaas:** Integrar refund
5. **Legislação:** Implementar Privacy Policy + Terms

---

**Criado em:** 2025-12-12
**Status:** ⏸️ Em Standby
**Próxima Revisão:** Após resolver ajustes Asaas
