# Instruções para Configurar Variáveis de Ambiente no Netlify

## Acesse o painel do Netlify:

1. Vá para: https://app.netlify.com/sites/rosamexicano-reservas/configuration/env
2. Ou acesse: **Site Settings** → **Environment Variables**

## Configure as seguintes variáveis:

### 1. ASAAS_API_KEY
```
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjE5Y2Q5MDA1LTQ1OGQtNDQzMS1hYmNkLWY1ZGFmMzZjNzYwNzo6JGFhY2hfMDM5MzNkMDMtNTMyNi00YmRmLWI1NGYtMWNiMzU5YTk0MzU0
```

### 2. ASAAS_API_URL
```
https://api.asaas.com/v3
```

### 3. DATABASE_URL
```
postgresql://postgres:ftnMPtXJTtyhJxNTVFsbiumeUAHhgRjp@crossover.proxy.rlwy.net:32833/railway
```

### 4. NEXT_PUBLIC_SITE_URL
```
https://rosamexicano-reservas.netlify.app
```

## Importante:

- **Escopo**: Selecione "Same value for all deploy contexts" ou configure separadamente para Production/Preview/Branch
- **Após configurar**: Clique em "Save" e faça um novo deploy
- **Deploy**: Vá em "Deploys" → "Trigger deploy" → "Deploy site"

## Verificação:

Após o deploy, teste criando uma reserva. Se ainda houver erro, verifique os logs em:
https://app.netlify.com/sites/rosamexicano-reservas/logs/functions
