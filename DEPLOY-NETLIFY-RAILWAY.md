# 🚀 Deploy Mortadella - Netlify + Railway

## Arquitetura

```
Netlify (Frontend + API Routes)
    ↓
Railway (PostgreSQL Database)
    ↓
Asaas (Payment Gateway)
```

## Passo 1: Criar Banco PostgreSQL no Railway

### 1.1 Acessar Railway

1. Acesse: **https://railway.app**
2. Login com: **ferramentas.starken@gmail.com**
3. Clique em: **"New Project"**

### 1.2 Criar Database

1. Selecione: **"Provision PostgreSQL"**
2. Nome do projeto: `mortadella-reservas-db`
3. Aguarde a criação (30 segundos)

### 1.3 Copiar Connection String

1. Clique no database criado
2. Vá em: **"Connect"**
3. Copie a **"Postgres Connection URL"**

Formato:
```
postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway
```

### 1.4 Executar Migrations

No seu terminal local:

```bash
cd mortadella-reservas-final-ano

# Cole a URL do Railway
export DATABASE_URL="postgresql://postgres:..."

# Execute as migrations
npx prisma migrate deploy

# Verifique se funcionou
npx prisma studio
```

## Passo 2: Deploy no Netlify

### 2.1 Acessar Netlify

1. Acesse: **https://app.netlify.com**
2. Login com: **ferramentas.starken@gmail.com**
3. Clique em: **"Add new site" → "Deploy manually"**

### 2.2 Fazer Upload

**Opção A: Drag & Drop**
1. Comprima a pasta: `tar -czf mortadella.tar.gz mortadella-reservas-final-ano/`
2. Extraia e arraste a pasta para o Netlify

**Opção B: Git (Recomendado)**
1. Crie repositório no GitHub
2. Faça push do código
3. No Netlify: "Import from Git" → Selecione o repositório

### 2.3 Configurar Build

**Build command:**
```
prisma generate && npm run build
```

**Publish directory:**
```
.next
```

**Node version:**
```
20
```

### 2.4 Instalar Plugin Next.js

1. No projeto Netlify, vá em: **"Plugins"**
2. Procure: **"Essential Next.js"**
3. Clique em: **"Install"**

Ou adicione ao `netlify.toml` (já está configurado):
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Passo 3: Configurar Variáveis de Ambiente no Netlify

Vá em: **Site settings → Environment variables**

Adicione as seguintes variáveis:

### 1. DATABASE_URL
```
postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway
```
*Cole a URL copiada do Railway*

### 2. ASAAS_API_URL
```
https://api.asaas.com/v3
```
*(Produção - sem sandbox)*

### 3. ASAAS_API_KEY
```
[SUA_CHAVE_ASAAS_PRODUCAO]
```

**Como obter:**
1. Acesse: https://www.asaas.com
2. Login → Integrações → API
3. Copie a API Key de produção

### 4. NEXT_PUBLIC_SITE_URL
```
https://seu-site.netlify.app
```
*(Será atualizado após primeiro deploy)*

### 5. EMAIL_HOST
```
smtp.gmail.com
```

### 6. EMAIL_PORT
```
587
```

### 7. EMAIL_USER
```
ferramentas.starken@gmail.com
```

### 8. EMAIL_PASS
```
[SENHA_APP_GMAIL]
```

**Como gerar senha de app do Gmail:**
1. https://myaccount.google.com/security
2. Ative "Verificação em 2 etapas"
3. Procure "Senhas de app"
4. Crie senha para "Email"
5. Copie a senha gerada

## Passo 4: Deploy

### 4.1 Primeiro Deploy

1. No Netlify, clique em: **"Deploy site"**
2. Aguarde o build (3-5 minutos)
3. Anote a URL gerada: `https://nome-aleatorio.netlify.app`

### 4.2 Atualizar NEXT_PUBLIC_SITE_URL

1. Copie a URL gerada
2. Vá em: **Environment variables**
3. Edite: `NEXT_PUBLIC_SITE_URL`
4. Cole a URL: `https://nome-aleatorio.netlify.app`
5. Clique em: **"Trigger deploy"** para rebuild

### 4.3 Configurar Domínio Personalizado (Opcional)

1. No Netlify: **Domain settings**
2. Adicione: `reservas.mortadella.com.br`
3. Configure DNS:
   ```
   CNAME reservas → nome-aleatorio.netlify.app
   ```

## Passo 5: Configurar Webhook no Asaas

1. Acesse: **https://www.asaas.com**
2. Vá em: **Configurações → Integrações → Webhooks**
3. Clique em: **"Novo Webhook"**
4. URL: `https://seu-site.netlify.app/api/webhook`
5. Marque os eventos:
   - ✅ Pagamento recebido (PAYMENT_RECEIVED)
   - ✅ Pagamento confirmado (PAYMENT_CONFIRMED)
   - ✅ Pagamento vencido (PAYMENT_OVERDUE)
   - ✅ Pagamento deletado (PAYMENT_DELETED)
6. Salve

## Passo 6: Testar o Sistema

### 6.1 Teste de Reserva

1. Acesse: `https://seu-site.netlify.app`
2. Preencha o formulário
3. Escolha data, horário e número de pessoas
4. Clique em "Continuar para Pagamento"

### 6.2 Teste de Pagamento

1. Você será redirecionado para o Asaas
2. Use dados de teste ou reais
3. Pague via PIX, Boleto ou Cartão

### 6.3 Verificar Voucher

1. Após pagamento confirmado
2. Cheque seu email (ferramentas.starken@gmail.com)
3. Você deve receber:
   - Email com código do voucher
   - PDF anexo com QR Code

## 🔍 Monitoramento

### Netlify Logs

```
Site settings → Functions → View logs
```

### Railway Database

```bash
# Conectar ao banco
psql "postgresql://postgres:senha@containers-us-west-123.railway.app:5432/railway"

# Ver reservas
SELECT * FROM "Reservation" ORDER BY "createdAt" DESC LIMIT 10;

# Ver vouchers
SELECT v.codigo, r.nome, r.email, r.data
FROM "Voucher" v
JOIN "Reservation" r ON v."reservationId" = r.id
ORDER BY v."createdAt" DESC;
```

Ou use o Prisma Studio:
```bash
DATABASE_URL="..." npx prisma studio
```

### Railway Dashboard

1. Acesse: https://railway.app
2. Selecione o projeto
3. Veja métricas:
   - CPU usage
   - Memory usage
   - Database connections

## 📊 Custos Estimados

### Railway (PostgreSQL)
- **Grátis**: $5/mês de crédito
- **Pro**: $20/mês (se precisar mais)

### Netlify
- **Grátis**: 100GB bandwidth/mês
- **Pro**: $19/mês (se precisar mais)

**Total estimado**: $0-39/mês

## ⚙️ Configurações Avançadas

### Backup do Banco (Railway)

1. No Railway, vá em: **Database → Backups**
2. Ative: **"Automatic backups"**
3. Frequência: Diária

### Custom Domain SSL

Netlify configura HTTPS automaticamente!

### Rate Limiting

Adicione em `middleware.ts` (criar se não existir):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add rate limiting here
  return NextResponse.next();
}
```

## 🐛 Troubleshooting

### Erro: "Database connection failed"

1. Verifique a `DATABASE_URL` no Netlify
2. Teste conexão localmente:
   ```bash
   psql "sua_database_url"
   ```
3. Verifique se o Railway database está online

### Erro: "Prisma Client not generated"

1. Adicione ao build command: `prisma generate &&`
2. Ou adicione `postinstall` no package.json:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

### Webhook não dispara

1. Verifique URL no Asaas (deve ser HTTPS)
2. Teste manualmente:
   ```bash
   curl -X POST https://seu-site.netlify.app/api/webhook \
     -H "Content-Type: application/json" \
     -d '{"event":"PAYMENT_RECEIVED","payment":{"id":"test123"}}'
   ```
3. Veja logs no Netlify

### Email não envia

1. Verifique senha de app do Gmail
2. Confirme que verificação em 2 etapas está ativa
3. Teste com `nodemailer` localmente

## ✅ Checklist Final

- [ ] Banco PostgreSQL criado no Railway
- [ ] Migrations executadas
- [ ] Site deployado no Netlify
- [ ] Plugin Next.js instalado
- [ ] Todas variáveis de ambiente configuradas
- [ ] Webhook configurado no Asaas
- [ ] Teste de reserva realizado
- [ ] Email recebido com voucher
- [ ] PDF com QR Code gerado

## 🎯 Próximos Passos

- [ ] Configurar domínio personalizado
- [ ] Ativar backups automáticos
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Implementar analytics
- [ ] Criar dashboard admin

---

**Sistema em Produção!** 🎉

- **Frontend**: https://seu-site.netlify.app
- **Database**: Railway PostgreSQL
- **Email**: ferramentas.starken@gmail.com
