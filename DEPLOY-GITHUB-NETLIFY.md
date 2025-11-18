# 🚀 Deploy via GitHub → Netlify + Railway

## Passo 1: Criar Repositório no GitHub

### 1.1 Criar Repositório

1. Acesse: **https://github.com/new**
2. Login se necessário
3. Preencha:
   - **Repository name**: `mortadella-reservas`
   - **Description**: `Sistema de reservas Mortadella Ristorante com vouchers`
   - **Visibility**: Public ou Private
4. **NÃO** marque "Initialize with README"
5. Clique em: **"Create repository"**

### 1.2 Fazer Push do Código

Copie os comandos que aparecem na página e execute no terminal:

```bash
cd /Users/juanminni/meu-repositorio/mortadella-reservas-final-ano

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/mortadella-reservas.git

# Fazer push
git branch -M main
git push -u origin main
```

**Ou use HTTPS com token:**

```bash
git remote add origin https://SEU_TOKEN@github.com/SEU_USUARIO/mortadella-reservas.git
git push -u origin main
```

## Passo 2: Criar Banco PostgreSQL no Railway

### 2.1 Acessar Railway

1. Acesse: **https://railway.app**
2. Login com: **ferramentas.starken@gmail.com**
3. Clique em: **"New Project"**

### 2.2 Provisionar PostgreSQL

1. Selecione: **"Provision PostgreSQL"**
2. Aguarde criação (30 segundos)
3. Clique no card do PostgreSQL criado

### 2.3 Copiar Connection String

1. Vá na aba: **"Connect"**
2. Copie a **"Postgres Connection URL"**

Exemplo:
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

### 2.4 Executar Migrations

No terminal local:

```bash
cd /Users/juanminni/meu-repositorio/mortadella-reservas-final-ano

# Exportar a URL do banco
export DATABASE_URL="postgresql://postgres:abc123@..."

# Executar migrations
npx prisma migrate deploy

# Verificar (opcional)
npx prisma studio
```

## Passo 3: Conectar GitHub com Netlify

### 3.1 Acessar Netlify

1. Acesse: **https://app.netlify.com**
2. Login com: **ferramentas.starken@gmail.com**
3. Clique em: **"Add new site" → "Import an existing project"**

### 3.2 Conectar GitHub

1. Clique em: **"Deploy with GitHub"**
2. Autorize o Netlify no GitHub (se solicitado)
3. Selecione o repositório: **mortadella-reservas**

### 3.3 Configurar Build Settings

**Site name (opcional):**
```
mortadella-reservas
```

**Branch to deploy:**
```
main
```

**Build command:**
```
prisma generate && npm run build
```

**Publish directory:**
```
.next
```

**Deixe em branco "Base directory"**

### 3.4 Adicionar Variáveis de Ambiente

**ANTES** de clicar em "Deploy", role para baixo e clique em:
**"Show advanced" → "New variable"**

Adicione as seguintes variáveis:

#### DATABASE_URL
```
postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway
```
*(Cole a URL do Railway)*

#### ASAAS_API_URL
```
https://api.asaas.com/v3
```

#### ASAAS_API_KEY
```
[SUA_CHAVE_ASAAS]
```

#### NEXT_PUBLIC_SITE_URL
```
https://mortadella-reservas.netlify.app
```
*(Atualize depois com a URL real)*

#### EMAIL_HOST
```
smtp.gmail.com
```

#### EMAIL_PORT
```
587
```

#### EMAIL_USER
```
ferramentas.starken@gmail.com
```

#### EMAIL_PASS
```
[SENHA_APP_GMAIL]
```

**Como gerar senha de app:**
1. https://myaccount.google.com/security
2. Ative "Verificação em 2 etapas"
3. Procure "Senhas de app"
4. Crie para "Email"

### 3.5 Deploy!

Clique em: **"Deploy mortadella-reservas"**

Aguarde 3-5 minutos...

## Passo 4: Pós-Deploy

### 4.1 Copiar URL do Site

Após o deploy, copie a URL gerada, exemplo:
```
https://mortadella-reservas.netlify.app
```

### 4.2 Atualizar NEXT_PUBLIC_SITE_URL

1. No Netlify, vá em: **Site settings → Environment variables**
2. Edite: `NEXT_PUBLIC_SITE_URL`
3. Cole a URL real: `https://mortadella-reservas.netlify.app`
4. Clique em: **"Save"**
5. Vá em: **Deploys → Trigger deploy → Deploy site**

### 4.3 Configurar Webhook no Asaas

1. Acesse: **https://www.asaas.com**
2. Login
3. Vá em: **Configurações → Integrações → Webhooks**
4. Clique em: **"Novo Webhook"**
5. **URL do Webhook:**
   ```
   https://mortadella-reservas.netlify.app/api/webhook
   ```
6. **Marque os eventos:**
   - ✅ Pagamento recebido (PAYMENT_RECEIVED)
   - ✅ Pagamento confirmado (PAYMENT_CONFIRMED)
   - ✅ Pagamento vencido (PAYMENT_OVERDUE)
   - ✅ Pagamento deletado (PAYMENT_DELETED)
7. Clique em: **"Salvar"**

## Passo 5: Testar

### 5.1 Acessar o Site

Abra: `https://mortadella-reservas.netlify.app`

### 5.2 Fazer Reserva Teste

1. Preencha o formulário
2. Escolha data, horário, número de pessoas
3. Clique em "Continuar para Pagamento"
4. Complete o pagamento no Asaas

### 5.3 Verificar Voucher

1. Cheque o email: ferramentas.starken@gmail.com
2. Você deve receber:
   - Email com código do voucher
   - PDF com QR Code anexo
3. A página de sucesso deve exibir o código

## 📊 Monitoramento

### Netlify

- **Logs**: Site settings → Functions → View logs
- **Deploy logs**: Deploys → Click no deploy → View logs

### Railway

- **Database**: https://railway.app → Selecione projeto
- **Métricas**: CPU, Memory, Connections

### Banco de Dados

```bash
# Via Prisma Studio (local)
export DATABASE_URL="postgresql://..."
npx prisma studio

# Via psql
psql "postgresql://postgres:abc123@..."

# Queries úteis
SELECT * FROM "Reservation" ORDER BY "createdAt" DESC LIMIT 10;
SELECT * FROM "Voucher" ORDER BY "createdAt" DESC LIMIT 10;
```

## 🔄 Atualizações Futuras

Sempre que modificar o código:

```bash
# Fazer commit
git add .
git commit -m "Descrição das mudanças"

# Push para GitHub
git push

# Netlify faz deploy automático!
```

## 🐛 Troubleshooting

### Build falha com erro Prisma

Solução: Verifique se `DATABASE_URL` está nas variáveis de ambiente

### Webhook não funciona

1. Teste manualmente:
```bash
curl -X POST https://mortadella-reservas.netlify.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_RECEIVED","payment":{"id":"test123"}}'
```
2. Veja logs no Netlify
3. Confirme URL no Asaas (deve ser HTTPS)

### Email não envia

1. Verifique senha de app do Gmail
2. Confirme que 2FA está ativo
3. Teste localmente primeiro

## ✅ Checklist

- [ ] Repositório criado no GitHub
- [ ] Código enviado (git push)
- [ ] PostgreSQL criado no Railway
- [ ] Migrations executadas
- [ ] Netlify conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build concluído com sucesso
- [ ] NEXT_PUBLIC_SITE_URL atualizado
- [ ] Webhook configurado no Asaas
- [ ] Teste de reserva realizado
- [ ] Email com voucher recebido

## 🎯 Domínio Personalizado (Opcional)

1. No Netlify: **Domain settings**
2. **Add custom domain**: `reservas.mortadella.com.br`
3. Configure DNS:
   ```
   CNAME reservas → mortadella-reservas.netlify.app
   ```
4. SSL automático em ~24h

---

**Sistema em Produção!** 🚀

- **Site**: https://mortadella-reservas.netlify.app
- **GitHub**: https://github.com/SEU_USUARIO/mortadella-reservas
- **Database**: Railway PostgreSQL
- **Conta**: ferramentas.starken@gmail.com
