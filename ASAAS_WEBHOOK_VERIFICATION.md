# ✅ Checklist de Verificação - Webhooks Asaas

**Status:** ⏳ Aguardando verificação no dashboard Asaas

Este documento serve como guia para verificar e testar os webhooks do Asaas configurados no sistema de reservas.

---

## 📋 Sumário Executivo

| Item | Status | Ação |
|------|--------|------|
| API Key configurada | ✅ Implementado | Use `.env.local` |
| Webhook Payment Refunded | ✅ **AGORA IMPLEMENTADO** | Verificar no dashboard |
| Webhook Payment Received | ✅ Implementado | Verificar no dashboard |
| Webhook Payment Confirmed | ✅ Implementado | Verificar no dashboard |
| Webhook Payment Overdue | ✅ Implementado | Verificar no dashboard |
| Webhook Payment Deleted | ✅ Implementado | Verificar no dashboard |
| Manipulação de cliente genérico | ✅ Implementado | Usar reservarosamexicano@gmail.com |

---

## 🔧 Passo 1: Acessar o Painel Asaas

### Ambiente Sandbox (Testes)
1. Acesse: **https://sandbox.asaas.com**
2. Faça login com suas credenciais
3. Vá até: **Configurações** → **Integrações** → **Webhooks**

### Ambiente Produção
1. Acesse: **https://www.asaas.com/app**
2. Faça login com suas credenciais
3. Vá até: **Configurações** → **Integrações** → **Webhooks**

---

## ✨ Passo 2: Verificar Webhook Existente

Você deve ver um webhook configurado chamado **"Rosa Mexicano - Reservas"** (ou similar).

### Dados Esperados:

```
Nome: Rosa Mexicano - Reservas
URL: https://seu-dominio.com/api/webhooks/asaas
   OU
       https://seu-dominio.com/api/webhook (legacy)
```

### ✅ Verificar Eventos Habilitados (CRÍTICO)

Clique no webhook para expandir e verificar os eventos habilitados. Todos estes devem estar **ATIVADOS (✓)**:

- [ ] **PAYMENT_RECEIVED** - Pagamento recebido (PIX instantâneo)
- [ ] **PAYMENT_CONFIRMED** - Pagamento confirmado
- [ ] **PAYMENT_RECEIVED_IN_CASH** - Pagamento em dinheiro
- [ ] **PAYMENT_REFUNDED** ⚠️ **NOVO - VERIFICAR SE ESTÁ ATIVADO**
- [ ] **PAYMENT_OVERDUE** - Pagamento vencido
- [ ] **PAYMENT_DELETED** - Pagamento deletado/cancelado

> ⚠️ **IMPORTANTE:** Se algum evento estiver **desativado (☐)**, você precisa ativá-lo clicando no checkbox correspondente.

---

## 🧪 Passo 3: Testar Webhook

### Via Painel Asaas

1. No painel de webhooks, localize seu webhook configurado
2. Clique em **"Testes"** ou **"Enviar Teste"**
3. Escolha o evento de teste:
   - [ ] Teste com PAYMENT_CONFIRMED
   - [ ] Teste com PAYMENT_REFUNDED ⚠️ **NOVO**
   - [ ] Teste com PAYMENT_OVERDUE
   - [ ] Teste com PAYMENT_DELETED

4. Envie o webhook de teste
5. Você deve ver um status ✅ **200 OK** se tudo está funcionando

### Verificar Resposta

O webhook deve retornar:
```json
{
  "success": true,
  "reservationId": "uuid-aqui",
  "message": "Reserva confirmada com sucesso"
}
```

---

## 📊 Passo 4: Verificar Histórico de Webhooks

1. No painel, vá em: **Configurações** → **Integrações** → **Webhooks**
2. Clique no seu webhook
3. Procure pela seção **"Histórico de Chamadas"** ou **"Logs"**

Você deve ver um registro de cada vez que:
- Um cliente fez um pagamento
- Um pagamento foi reembolsado
- Um pagamento expirou
- Um webhook de teste foi enviado

### Cada Entrada Deve Mostrar:
- ✅ Timestamp (data/hora)
- ✅ Status HTTP (200 = sucesso, 4xx/5xx = erro)
- ✅ Evento enviado (PAYMENT_CONFIRMED, PAYMENT_REFUNDED, etc)
- ✅ Resposta do servidor

---

## 🔄 Passo 5: Testar Fluxo Completo End-to-End

### Cenário 1: Reserva Confirmada (Pagamento Pago)

1. **Criar reserva** via site:
   - Preencha o formulário
   - Clique em "Continuar para Pagamento"

2. **Simular pagamento** (Sandbox):
   - Use um cartão de teste: `5162306219378829`
   - Qualquer CVV e data futura
   - Confirme o pagamento

3. **Verificar**:
   - Status da reserva mudou para **"confirmed"** no banco de dados?
   - Webhook foi chamado (verifique logs)?
   - Cliente viu mensagem de sucesso?

### Cenário 2: Reembolso (NOVO ⚠️)

1. **No painel Asaas**:
   - Vá até **Cobranças**
   - Encontre um pagamento confirmado
   - Clique em **"Reembolsar"**

2. **Sistema deve**:
   - Webhook PAYMENT_REFUNDED será enviado
   - Status da reserva mudará para **"refunded"**
   - Log mostrará: `💰 Pagamento reembolsado! Reserva [ID]`

3. **Verificar**:
   - Status no banco de dados é "refunded"?
   - Webhook logs mostram a chamada?

### Cenário 3: Pagamento Vencido (PIX)

Para PIX, após 10 minutos sem pagamento:

1. **Sistema automaticamente**:
   - Webhook PAYMENT_OVERDUE será enviado
   - Reserva será cancelada

2. **Verificar**:
   - Status mudou para "cancelled"?
   - Log mostra `⏰ Pagamento vencido!`?

---

## 🐛 Troubleshooting - Problemas Comuns

### Problema 1: Webhook não está sendo chamado

**Causas possíveis:**
- [ ] Webhook não configurado no painel
- [ ] Eventos não estão habilitados
- [ ] URL do webhook está incorreta
- [ ] Servidor está down/inacessível
- [ ] Usando URL localhost sem ngrok

**Solução:**
1. Verifique a URL no painel:
   - Deve ser HTTPS (não HTTP)
   - Deve estar acessível publicamente
   - Verifique se há typos

2. Ative os eventos necessários:
   - Marque todos os checkboxes de eventos

3. Teste com ngrok (local):
   ```bash
   ngrok http 3001
   # Use: https://abc123.ngrok.io/api/webhooks/asaas
   ```

---

### Problema 2: Webhook retorna erro 500

**Causas possíveis:**
- [ ] Banco de dados offline
- [ ] Variáveis de ambiente não configuradas
- [ ] Erro no código do webhook

**Solução:**
1. Verifique logs do servidor:
   ```bash
   npm run dev  # Veja erros em tempo real
   ```

2. Verifique se Prisma está funcionando:
   ```bash
   npx prisma db push
   ```

3. Verifique se o `paymentId` existe na reserva

---

### Problema 3: Pagamento confirmado mas reserva não aparece como "confirmed"

**Causas possíveis:**
- [ ] Webhook não foi chamado
- [ ] `paymentId` não foi salvo corretamente
- [ ] Erro na atualização do banco

**Solução:**
1. Verifique histórico de webhooks no painel
2. Procure pelo `paymentId` no banco de dados:
   ```sql
   SELECT * FROM Reservation WHERE paymentId = 'pag_xxx';
   ```

3. Verifique logs da aplicação para erros

---

### Problema 4: PAYMENT_REFUNDED não funciona

**Verificar:**
- [ ] Evento PAYMENT_REFUNDED está habilitado no webhook?
- [ ] Status "refunded" existe no schema Prisma?
- [ ] Você fez um reembolso real no painel?

**Solução:**
1. Ative o evento no painel do Asaas
2. Verifique schema:
   ```prisma
   status  String  // Deve aceitar "refunded"
   ```

3. Teste com webhook de teste

---

## 📱 Passo 6: Monitoramento em Produção

### Configurar Alertas

1. **No painel Asaas**, vá em:
   - **Configurações** → **Notificações**

2. Ative:
   - [ ] Email quando pagamento confirmado
   - [ ] Email quando pagamento reembolsado
   - [ ] Email quando webhook falha

### Verificar Regularmente

Verifique diariamente:
- Número de webhooks processados
- Taxa de erro dos webhooks
- Reservas com status pendente (podem indicar webhook falhando)

---

## 🎯 Checklist Final

Antes de considerar webhooks **PRONTOS PARA PRODUÇÃO**, verifique:

### Configuração (Dashboard Asaas)
- [ ] Webhook criado e ativo
- [ ] URL correta (HTTPS, publicamente acessível)
- [ ] Todos os eventos habilitados:
  - [ ] PAYMENT_RECEIVED
  - [ ] PAYMENT_CONFIRMED
  - [ ] PAYMENT_REFUNDED ✨ **NOVO**
  - [ ] PAYMENT_OVERDUE
  - [ ] PAYMENT_DELETED
  - [ ] (Opcional) PAYMENT_RECEIVED_IN_CASH

### Código (Backend)
- [ ] Handler implementado em `/api/webhooks/asaas/route.ts`
- [ ] PAYMENT_REFUNDED handler adicionado ✨ **NOVO**
- [ ] Banco de dados aceita status "refunded"
- [ ] Logs são registrados corretamente

### Testes
- [ ] Webhook de teste enviado com sucesso
- [ ] Resposta é 200 OK
- [ ] Fluxo completo testado (criar reserva → pagar → confirmar)
- [ ] Reembolso testado ✨ **NOVO**
- [ ] Vencimento testado

### Produção
- [ ] API Key de produção configurada
- [ ] URL correta no painel
- [ ] Notificações habilitadas
- [ ] Plano de monitoramento em vigor

---

## 📞 Próximos Passos

Quando terminar a verificação, você deve:

1. ✅ Confirmar que todos os eventos estão habilitados
2. ✅ Testar o novo PAYMENT_REFUNDED
3. ✅ Atualizar `.env.local` com credenciais de produção
4. ✅ Fazer deploy das alterações (webhook handler atualizado)
5. ✅ Testar em produção

---

## 📚 Referências

- **Documentação Asaas**: https://docs.asaas.com
- **Webhook Events**: https://docs.asaas.com/reference#webhooks
- **API Reference**: https://docs.asaas.com/reference
- **Dashboard**: https://www.asaas.com/app

---

**Última atualização:** Dezembro 2025
**Versão:** 2.0 (Com suporte a PAYMENT_REFUNDED)
