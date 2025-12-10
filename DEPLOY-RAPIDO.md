# 🚀 Deploy Rápido - Vercel (Interface Web)

## Passo 1: Comprimir o Projeto

```bash
cd /Users/juanminni/meu-repositorio
tar -czf mortadella-reservas.tar.gz mortadella-reservas-final-ano/
```

## Passo 2: Fazer Upload no Vercel

1. Acesse: **https://vercel.com**
2. Login com: **ferramentas.starken@gmail.com**
3. Clique em: **"Add New" → "Project"**
4. Escolha: **"Import Project"**
5. Faça upload da pasta `mortadella-reservas-final-ano`

## Passo 3: Configurar Projeto

### Nome do Projeto
```
mortadella-reservas
```

### Framework Preset
```
Next.js
```

### Build Command
```
prisma generate && next build
```

### Install Command (deixe padrão)
```
npm install
```

## Passo 4: Criar Banco PostgreSQL

### Opção Recomendada: Vercel Postgres

1. No painel do projeto, clique em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"Postgres"**
4. Nome: `mortadella-db`
5. Região: **US East (Washington, D.C.)** ou mais próxima
6. Clique em **"Create"**

**A variável `DATABASE_URL` será adicionada automaticamente!**

### Alternativa: Neon (Grátis)

1. Acesse: https://console.neon.tech
2. Crie conta com Google (ferramentas.starken@gmail.com)
3. Crie novo projeto: `mortadella-reservas`
4. Copie a **Connection String**

## Passo 5: Configurar Variáveis de Ambiente

No Vercel, vá em: **Settings → Environment Variables**

Adicione as seguintes variáveis:

### 1. DATABASE_URL (se não usar Vercel Postgres)
```
postgresql://user:password@host.region.neon.tech:5432/mortadella?sslmode=require
```

### 2. ASAAS_API_URL
```
https://api.asaas.com/v3
```

### 3. ASAAS_API_KEY
```
[SUA_CHAVE_ASAAS_PRODUCAO]
```

**Como obter:**
1. Acesse: https://www.asaas.com
2. Faça login
3. Vá em: **Integrações → API**
4. Copie sua **API Key** de produção

### 4. NEXT_PUBLIC_SITE_URL
```
https://mortadella-reservas.vercel.app
```
(Será atualizado após deploy)

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

**Como gerar senha de app:**
1. Acesse: https://myaccount.google.com/security
2. Ative **"Verificação em duas etapas"**
3. Procure **"Senhas de app"**
4. Gere senha para: **"Email"**
5. Copie a senha de 16 caracteres

## Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Anote a URL gerada: `https://mortadella-reservas-xxx.vercel.app`

## Passo 7: Executar Migrations

### Opção A: Terminal Local

```bash
# Copie o DATABASE_URL do Vercel
# Cole no comando abaixo:

DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Opção B: Vercel CLI (se estiver instalado)

```bash
vercel env pull
npx prisma migrate deploy
```

## Passo 8: Configurar Webhook no Asaas

1. Acesse: **https://www.asaas.com**
2. Vá em: **Configurações → Integrações → Webhooks**
3. Clique em: **"Novo Webhook"**
4. URL: `https://mortadella-reservas-xxx.vercel.app/api/webhook`
5. Marque os eventos:
   - ✅ **Pagamento recebido** (PAYMENT_RECEIVED)
   - ✅ **Pagamento confirmado** (PAYMENT_CONFIRMED)
   - ✅ **Pagamento vencido** (PAYMENT_OVERDUE)
   - ✅ **Pagamento deletado** (PAYMENT_DELETED)
6. Salve

## Passo 9: Testar

1. Acesse: `https://mortadella-reservas-xxx.vercel.app`
2. Faça uma reserva teste
3. Use dados reais ou de teste do Asaas
4. Verifique email recebido com voucher

## ✅ Checklist Final

- [ ] Projeto implantado no Vercel
- [ ] Banco PostgreSQL criado
- [ ] Todas variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Webhook configurado no Asaas
- [ ] Teste de reserva realizado
- [ ] Email recebido com voucher
- [ ] Página de sucesso exibindo código

## 🔍 Verificar Logs

No painel do Vercel:
1. Vá em: **Deployments**
2. Clique no deployment mais recente
3. Vá em: **"Function Logs"**
4. Acompanhe as requisições

## 🎯 Domínio Personalizado (Opcional)

1. No Vercel: **Settings → Domains**
2. Adicione: `reservas.mortadella.com.br`
3. Configure DNS apontando para Vercel

## 📞 Suporte

Se encontrar erros:
1. Verifique os logs no Vercel
2. Teste cada variável de ambiente
3. Confirme que o banco está acessível
4. Teste o webhook manualmente

---

**Deploy Completo!** 🎉

URL: https://mortadella-reservas.vercel.app
