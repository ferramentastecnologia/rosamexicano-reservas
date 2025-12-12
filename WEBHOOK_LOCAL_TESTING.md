# 🧪 Guia de Testes Locais - Webhooks com Ngrok

Use este guia para testar webhooks localmente enquanto desenvolve.

---

## 🚀 Configuração Inicial

### 1. Instalar Ngrok

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin
```

**Windows:**
Baixe em: https://ngrok.com/download

### 2. Iniciar Servidor Local

```bash
cd rosamexicano-reservas
npm run dev
# Deve rodar em http://localhost:3001
```

### 3. Expor com Ngrok

```bash
ngrok http 3001
```

Você verá algo como:
```
Session Status                online
Account                       seu-email@example.com
Version                       3.0.0

Forwarding                    https://abc123-xyz789.ngrok.io -> http://localhost:3001

Web Interface                 http://127.0.0.1:4040
```

Copie a URL: `https://abc123-xyz789.ngrok.io`

---

## 🔧 Configurar no Asaas (Sandbox)

1. Acesse: https://sandbox.asaas.com
2. Vá em: **Configurações** → **Integrações** → **Webhooks**
3. Edite seu webhook
4. Altere a URL para: `https://abc123-xyz789.ngrok.io/api/webhooks/asaas`
5. Salve

---

## ✅ Testar Webhook

### Opção 1: Via Dashboard Asaas (Recomendado)

1. No painel de webhooks, clique em **"Testes"**
2. Escolha um evento de teste:
   ```
   - PAYMENT_CONFIRMED
   - PAYMENT_REFUNDED
   - PAYMENT_OVERDUE
   - PAYMENT_DELETED
   ```
3. Clique em **"Enviar"**

### Opção 2: Via Curl (Terminal)

```bash
curl -X POST https://abc123-xyz789.ngrok.io/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pag_ABC123XYZ789",
      "value": 50.00,
      "status": "RECEIVED"
    }
  }'
```

### Opção 3: Via Postman

1. Crie uma nova requisição POST
2. URL: `https://abc123-xyz789.ngrok-io/api/webhooks/asaas`
3. Body (JSON):
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pag_test_123456789",
    "value": 50.00,
    "status": "RECEIVED"
  }
}
```
4. Envie (Send)

---

## 📊 Monitorar Resposta

### 1. Verificar Console Local

No terminal onde rodou `npm run dev`, você deve ver:

**Para PAYMENT_CONFIRMED:**
```
✅ Reserva uuid-aqui confirmada! Payment ID: pag_test_123456789
   Cliente: João Silva
   Data: 2025-12-25 às 19:00
   Pessoas: 4
   Mesas: 1,2
```

**Para PAYMENT_REFUNDED:**
```
💰 Pagamento reembolsado! Reserva uuid-aqui
   Cliente: João Silva
   Valor reembolsado: R$ 50.00
   Motivo: Não especificado
```

### 2. Verificar Resposta HTTP

A resposta deve ser:
```json
{
  "success": true,
  "reservationId": "uuid-aqui",
  "message": "Reserva confirmada com sucesso"
}
```

Status: **200 OK**

### 3. Verificar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql postgresql://usuario:senha@localhost:5432/rosamexicano

# Listar últimas reservas
SELECT id, nome, status, paymentId FROM Reservation ORDER BY createdAt DESC LIMIT 5;
```

Esperado:
```
                   id                   |     nome     |  status   |         paymentId
----------------------------------------+--------------+-----------+---------------------------
 a1b2c3d4-e5f6-7890-abcd-ef1234567890 | João Silva   | confirmed | pag_test_123456789
```

---

## 🔍 Monitorar Ngrok

### Interface Web de Ngrok

1. Acesse: http://localhost:4040
2. Veja todas as requisições em tempo real
3. Clique em cada requisição para ver:
   - Request headers
   - Request body
   - Response status
   - Response body

Muito útil para debugar!

---

## 🧪 Casos de Teste Completos

### Teste 1: Pagamento Confirmado

```bash
# 1. Criar uma reserva via site
# http://localhost:3001
# Preencha e clique "Continuar para Pagamento"
# Você verá um payment_id na URL

# 2. Simular webhook
curl -X POST https://abc123-xyz789.ngrok.io/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pag_12345678901234567890",
      "value": 50.00,
      "status": "RECEIVED"
    }
  }'

# 3. Verificar no banco
# SELECT * FROM Reservation WHERE paymentId = 'pag_12345678901234567890';
# Status deve ser "confirmed"
```

### Teste 2: Reembolso (NOVO)

```bash
# 1. Usar um payment_id de uma reserva confirmada existente

# 2. Enviar webhook de reembolso
curl -X POST https://abc123-xyz789.ngrok.io/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_REFUNDED",
    "payment": {
      "id": "pag_12345678901234567890",
      "value": 50.00,
      "refundReason": "Cliente solicitou"
    }
  }'

# 3. Verificar status
# SELECT * FROM Reservation WHERE paymentId = 'pag_12345678901234567890';
# Status deve ser "refunded"
```

### Teste 3: Pagamento Vencido

```bash
curl -X POST https://abc123-xyz789.ngrok.io/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_OVERDUE",
    "payment": {
      "id": "pag_12345678901234567890",
      "value": 50.00,
      "status": "OVERDUE"
    }
  }'

# Status deve ser "cancelled"
```

---

## ⚠️ Problemas Comuns

### Ngrok para de funcionar após tempo

**Solução:** Sua sessão expirou, execute novamente:
```bash
ngrok http 3001
```

Copie a nova URL e atualize no painel Asaas.

### Erro 404 - Webhook não encontrado

**Causas:**
- URL no ngrok está diferente da salva no painel
- Caminho da API está errado
- Servidor não está rodando

**Verificar:**
```bash
# Verifique se está rodando em 3001
lsof -i :3001

# Verifique a URL correta
# Deve ser: https://abc123.ngrok.io/api/webhooks/asaas
```

### Erro 500 - Internal Server Error

**Causas:**
- Banco de dados offline
- `paymentId` não existe na reserva
- Erro no código do webhook

**Solução:**
1. Verifique logs em `npm run dev`
2. Verifique conexão com banco de dados
3. Verifique se o `paymentId` existe

### Webhook chega mas status não muda

**Verificar:**
1. Verifique logs (viu a mensagem de sucesso?)
2. Consulte banco de dados:
   ```sql
   SELECT * FROM Reservation WHERE paymentId = 'pag_xxx';
   ```
3. Verifique se há erros de transaction

---

## 📝 Checklist de Testes

Antes de ir para produção, verifique:

- [ ] Webhook PAYMENT_CONFIRMED funciona
- [ ] Webhook PAYMENT_REFUNDED funciona ✨ NOVO
- [ ] Webhook PAYMENT_OVERDUE funciona
- [ ] Webhook PAYMENT_DELETED funciona
- [ ] Status do banco muda corretamente
- [ ] Logs são registrados
- [ ] Resposta HTTP é 200 OK

---

## 🚀 Próximo Passo: Produção

Quando tudo estiver testado:

1. Configure webhook na produção (Asaas real):
   - URL: `https://seu-dominio.com/api/webhooks/asaas`
   - Eventos: todos habilitados

2. Atualize `.env.local`:
   ```env
   ASAAS_API_URL=https://api.asaas.com/v3
   ASAAS_API_KEY=sua_chave_producao
   ```

3. Deploy da aplicação com as alterações:
   - Handler PAYMENT_REFUNDED agora incluído
   - Código pronto para produção

---

**Dica:** Mantenha ngrok rodando enquanto desenvolve para testar webhooks instantaneamente!
