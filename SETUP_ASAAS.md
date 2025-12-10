# Configuração Asaas - Guia Completo

Este guia detalha como configurar o Asaas para receber pagamentos no sistema de reservas.

## Passo 1: Criar Conta no Asaas

1. Acesse https://www.asaas.com
2. Clique em "Criar conta grátis"
3. Preencha seus dados:
   - Nome completo
   - E-mail
   - Telefone
   - CPF/CNPJ
4. Confirme seu e-mail

## Passo 2: Acessar o Painel

1. Faça login em https://www.asaas.com/login
2. Complete o cadastro da sua empresa
3. Aguarde a aprovação da conta (pode levar até 24h)

## Passo 3: Obter API Key

### Ambiente Sandbox (Testes)

1. Acesse https://sandbox.asaas.com
2. Faça login com suas credenciais
3. Vá em **Configurações** > **Integrações** > **API**
4. Clique em **Gerar nova chave de API**
5. Copie a chave gerada (formato: `$aact_...`)

### Ambiente Produção

1. Acesse https://www.asaas.com/app
2. Vá em **Configurações** > **Integrações** > **API**
3. Clique em **Gerar nova chave de API**
4. **IMPORTANTE:** Guarde esta chave em local seguro
5. Copie a chave (formato: `$aact_...`)

## Passo 4: Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local`:

```env
# Para testes (Sandbox)
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNDc2Mzg6OiRhYWNoXzI1NzIyNWU3LWZmYjAtNDVjYy1hZTI1LTJmNTQwZTUxMjg0MQ==

# Para produção (altere quando estiver pronto)
# ASAAS_API_URL=https://api.asaas.com/v3
# ASAAS_API_KEY=sua_chave_producao
```

## Passo 5: Configurar Webhook

### O que é Webhook?

Webhook é uma URL que o Asaas chama automaticamente quando um evento acontece (ex: pagamento confirmado).

### Configurar no Painel

1. No painel do Asaas, vá em **Configurações** > **Integrações** > **Webhooks**
2. Clique em **Adicionar Webhook**
3. Preencha:
   - **Nome**: Mortadella Reservas
   - **URL**: `https://seu-dominio.com/api/webhook`
   - **Eventos**:
     - ✅ PAYMENT_RECEIVED (Pagamento recebido)
     - ✅ PAYMENT_CONFIRMED (Pagamento confirmado)
     - ✅ PAYMENT_OVERDUE (Pagamento vencido)
     - ✅ PAYMENT_DELETED (Pagamento deletado)
4. Clique em **Salvar**

### Testar Webhook Localmente

Para testar webhooks em desenvolvimento local, use o **ngrok**:

1. Instale o ngrok: https://ngrok.com/download
2. Execute:
   ```bash
   ngrok http 3001
   ```
3. Copie a URL gerada (ex: `https://abcd-123.ngrok.io`)
4. Configure no Asaas: `https://abcd-123.ngrok.io/api/webhook`

## Passo 6: Configurar Métodos de Pagamento

### Habilitar PIX

1. No painel, vá em **Configurações** > **Formas de recebimento**
2. Ative **PIX**
3. Configure sua chave PIX (e-mail, telefone, CPF ou aleatória)

### Habilitar Boleto

1. Na mesma seção, ative **Boleto bancário**
2. Configure juros e multa (opcional)

### Habilitar Cartão de Crédito

1. Ative **Cartão de crédito**
2. Configure taxa de parcelamento
3. **IMPORTANTE:** Para ambiente de produção, você precisa:
   - Enviar documentos da empresa
   - Aguardar aprovação (pode levar alguns dias)

## Passo 7: Testar Pagamento

### No Sandbox

Use cartões de teste:
- **Aprovado**: `5162306219378829`
- **Negado**: `5105105105105100`
- **CVV**: qualquer 3 dígitos
- **Validade**: qualquer data futura

### Fluxo de Teste

1. Acesse http://localhost:3001
2. Preencha o formulário de reserva
3. Clique em "Continuar para Pagamento"
4. Você será redirecionado para a página de pagamento do Asaas
5. Escolha o método de pagamento
6. Complete o pagamento
7. Verifique o webhook sendo chamado

## Passo 8: Monitorar Transações

### No Painel do Asaas

1. Acesse **Vendas** > **Cobranças**
2. Veja todas as cobranças criadas
3. Clique em uma cobrança para ver detalhes

### Logs do Webhook

1. Vá em **Configurações** > **Integrações** > **Webhooks**
2. Clique no webhook configurado
3. Veja o histórico de chamadas

## Passo 9: Ir para Produção

Quando estiver pronto para produção:

1. **Alterar API Key**
   - Gere nova chave no ambiente de produção
   - Atualize `.env.local` com a nova chave

2. **Alterar URL da API**
   ```env
   ASAAS_API_URL=https://api.asaas.com/v3
   ```

3. **Atualizar Webhook**
   - Configure com a URL de produção
   - Remova a URL de desenvolvimento

4. **Testar Pagamento Real**
   - Faça um pagamento de teste real
   - Verifique se o webhook foi chamado
   - Confirme que a reserva foi registrada

## Passo 10: Segurança

### Proteger API Key

- ✅ Nunca commite `.env.local` no Git
- ✅ Use variáveis de ambiente no servidor de produção
- ✅ Rotacione as chaves periodicamente

### Validar Webhook

Para garantir que o webhook vem do Asaas, valide:

```typescript
// Em app/api/webhook/route.ts
const asaasToken = req.headers.get('asaas-access-token');
if (asaasToken !== process.env.ASAAS_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Problemas Comuns

### Erro: "API Key inválida"
- Verifique se copiou a chave completa
- Confirme se está usando o ambiente correto (sandbox vs produção)

### Erro: "Customer not found"
- O cliente pode já existir, tente buscar antes de criar

### Webhook não está sendo chamado
- Verifique se a URL está acessível publicamente
- Use ngrok para testes locais
- Verifique logs no painel do Asaas

### Pagamento não aparece no painel
- Confirme que está no ambiente correto
- Aguarde alguns segundos (pode ter delay)

## Recursos Úteis

- **Documentação Oficial**: https://docs.asaas.com
- **API Reference**: https://docs.asaas.com/reference
- **Suporte**: suporte@asaas.com
- **Status**: https://status.asaas.com

## Taxas do Asaas (valores aproximados)

- **PIX**: 0,99% por transação
- **Boleto**: R$ 3,49 por boleto
- **Cartão de Crédito**:
  - À vista: 3,99%
  - Parcelado: a partir de 5,99%

Valores podem variar conforme volume de transações e negociação.
