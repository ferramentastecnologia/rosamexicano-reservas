# Deploy no Vercel - Mortadella Reservas

## 📋 Pré-requisitos

- Conta Vercel (usar ferramentas.starken@gmail.com)
- Conta Asaas (produção ou sandbox)
- Conta Gmail para envio de emails
- Banco de dados PostgreSQL (Vercel Postgres ou externo)

## 🚀 Passo a Passo

### 1. Preparar Repositório Git

```bash
cd mortadella-reservas-final-ano
git init
git add .
git commit -m "Initial commit - Sistema de reservas Mortadella"
```

### 2. Criar Projeto no Vercel

1. Acesse: https://vercel.com
2. Login com: ferramentas.starken@gmail.com
3. Clique em "Add New Project"
4. Importe o repositório ou faça upload da pasta

### 3. Configurar Banco de Dados PostgreSQL

**Opção A: Usar Vercel Postgres (Recomendado)**

1. No projeto Vercel, vá em "Storage"
2. Clique em "Create Database"
3. Selecione "Postgres"
4. Escolha a região mais próxima
5. Copie a `DATABASE_URL` gerada

**Opção B: Usar Neon, Supabase ou outro**

1. Crie conta em https://neon.tech ou https://supabase.com
2. Crie um novo projeto PostgreSQL
3. Copie a connection string

### 4. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Asaas API (PRODUÇÃO)
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=sua_chave_de_producao_aqui

# URLs
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ferramentas.starken@gmail.com
EMAIL_PASS=senha_app_gmail_aqui
```

**⚠️ IMPORTANTE:**
- Use `ASAAS_API_URL=https://api.asaas.com/v3` (SEM sandbox)
- Gere uma senha de app do Gmail:
  1. https://myaccount.google.com/security
  2. Ative verificação em 2 etapas
  3. Vá em "Senhas de app"
  4. Crie senha para "Email"

### 5. Adicionar Build Script

Verifique se o `package.json` tem:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### 6. Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Ou simplesmente faça push para o repositório Git conectado ao Vercel.

### 7. Executar Migrations do Prisma

Após o primeiro deploy:

```bash
# Localmente, com DATABASE_URL de produção
DATABASE_URL="sua_url_postgres" npx prisma migrate deploy
```

Ou use o painel do Vercel:
1. Vá em "Settings → Functions"
2. Ative "Enable Prisma Accelerate" (se disponível)

### 8. Configurar Webhook no Asaas

1. Acesse: https://www.asaas.com
2. Vá em **Configurações → Webhooks**
3. Adicione a URL: `https://seu-dominio.vercel.app/api/webhook`
4. Marque os eventos:
   - ✅ PAYMENT_RECEIVED
   - ✅ PAYMENT_CONFIRMED
   - ✅ PAYMENT_OVERDUE
   - ✅ PAYMENT_DELETED
5. Salve

### 9. Testar o Sistema

1. Acesse: `https://seu-dominio.vercel.app`
2. Faça uma reserva teste
3. Pague via PIX/Boleto/Cartão
4. Verifique:
   - Voucher gerado no banco
   - Email recebido
   - Página de sucesso exibindo código

## 🔍 Verificações Pós-Deploy

### Checar Logs

```bash
vercel logs --follow
```

Ou no painel: **Deployments → View Function Logs**

### Testar APIs

```bash
# Testar criação de pagamento
curl -X POST https://seu-dominio.vercel.app/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@email.com",
    "telefone": "47999999999",
    "data": "2024-12-25",
    "horario": "20:00",
    "numeroPessoas": 2
  }'

# Testar webhook (simulação)
curl -X POST https://seu-dominio.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test123"
    }
  }'
```

### Verificar Banco de Dados

```bash
# Localmente
DATABASE_URL="sua_url_postgres" npx prisma studio
```

## 🛠️ Troubleshooting

### Erro: "Module not found: @prisma/client"

```bash
# No Vercel, adicione em vercel.json:
{
  "buildCommand": "prisma generate && next build"
}
```

### Erro: "Database connection failed"

- Verifique se `DATABASE_URL` está correta
- Certifique-se que tem `?sslmode=require` no final
- Teste conexão localmente primeiro

### Webhook não dispara

- Verifique URL no painel do Asaas
- Confirme que a URL é HTTPS (não HTTP)
- Veja logs do Vercel para erros

### Email não envia

- Verifique senha de app do Gmail
- Confirme que verificação em 2 etapas está ativa
- Teste com outro email temporariamente

## 📊 Monitoramento

### Vercel Analytics

1. Ative em: **Analytics → Enable**
2. Monitore:
   - Pageviews
   - Conversion rate
   - Performance

### Banco de Dados

```sql
-- Ver todas as reservas
SELECT * FROM "Reservation" ORDER BY "createdAt" DESC LIMIT 10;

-- Ver vouchers gerados
SELECT
  v.codigo,
  r.nome,
  r.email,
  r.data,
  r.status
FROM "Voucher" v
JOIN "Reservation" r ON v."reservationId" = r.id
ORDER BY v."createdAt" DESC;

-- Estatísticas
SELECT
  status,
  COUNT(*) as total,
  SUM(valor) as valor_total
FROM "Reservation"
GROUP BY status;
```

## 🔐 Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ Banco PostgreSQL com SSL
- ✅ HTTPS obrigatório
- ✅ Validação de webhooks (implementar token se necessário)

## 📱 Domínio Personalizado (Opcional)

1. No Vercel: **Settings → Domains**
2. Adicione: `reservas.mortadella.com.br`
3. Configure DNS:
   ```
   CNAME reservas.mortadella.com.br -> cname.vercel-dns.com
   ```

## 🎯 Próximos Passos

- [ ] Configurar domínio personalizado
- [ ] Ativar Vercel Analytics
- [ ] Configurar alertas de erro
- [ ] Implementar dashboard admin
- [ ] Adicionar rate limiting
- [ ] Configurar backup do banco

---

**Deploy completo!** 🎉

Site: https://seu-dominio.vercel.app
