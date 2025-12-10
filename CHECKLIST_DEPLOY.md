# Checklist de Deploy - Mortadella Reservas

Use este checklist para garantir que tudo está configurado antes de colocar o projeto em produção.

## Pré-Deploy

### 1. Conta Asaas
- [ ] Conta criada no Asaas
- [ ] Dados da empresa completos
- [ ] Conta aprovada (aguardar até 24h)
- [ ] Métodos de pagamento habilitados:
  - [ ] PIX configurado
  - [ ] Boleto habilitado
  - [ ] Cartão aprovado (requer documentação)

### 2. API Key
- [ ] API Key de produção gerada
- [ ] API Key testada no Postman/Insomnia
- [ ] API Key guardada em local seguro

### 3. Configuração Local
- [ ] Projeto clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` configurado com sandbox
- [ ] Teste local realizado (http://localhost:3001)
- [ ] Fluxo completo testado no sandbox

### 4. Código
- [ ] Código revisado
- [ ] Textos personalizados (se necessário)
- [ ] Cores ajustadas (se necessário)
- [ ] Datas configuradas corretamente
- [ ] Horários ajustados
- [ ] Valor da reserva correto (R$ 50,00)

## Deploy

### 1. Escolher Plataforma
Recomendado: **Vercel** (gratuito para Next.js)

Outras opções:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean

### 2. Deploy na Vercel

#### Opção A: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Configurar domínio (opcional)
vercel --prod
```

#### Opção B: Via Interface Web
1. Acesse https://vercel.com
2. Conecte seu GitHub/GitLab
3. Importe o repositório
4. Configure variáveis de ambiente
5. Deploy automático

### 3. Configurar Variáveis de Ambiente

Na plataforma escolhida, adicione:

```env
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=sua_api_key_de_producao
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

**IMPORTANTE**: Use a API Key de **produção**, não a de sandbox!

### 4. Configurar Webhook no Asaas

1. Acesse https://www.asaas.com/app
2. Vá em **Configurações** > **Integrações** > **Webhooks**
3. Adicione webhook:
   - Nome: Mortadella Reservas Produção
   - URL: `https://seu-dominio.com/api/webhook`
   - Eventos:
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_DELETED
4. Salve

### 5. Domínio Personalizado (Opcional)

Se tiver domínio próprio:

#### Na Vercel
1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

#### DNS Records
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

## Pós-Deploy

### 1. Testes em Produção

- [ ] Acesse o site em produção
- [ ] Teste formulário de reserva
- [ ] **Faça um pagamento REAL de teste** (R$ 50,00)
- [ ] Verifique se webhook foi chamado
- [ ] Confirme recebimento no painel do Asaas
- [ ] Teste redirecionamento para página de sucesso
- [ ] Verifique responsividade (mobile/desktop)

### 2. Monitoramento

#### Logs da Aplicação
- [ ] Configure logs na plataforma de deploy
- [ ] Monitore erros iniciais

#### Painel do Asaas
- [ ] Verifique cobranças sendo criadas
- [ ] Monitore webhook sendo chamado
- [ ] Configure notificações de pagamento

### 3. Marketing e Divulgação

- [ ] Teste links de compartilhamento
- [ ] Crie QR Code para o site (opcional)
- [ ] Prepare posts para redes sociais
- [ ] Configure Google Analytics (opcional)
- [ ] Configure Facebook Pixel (opcional)

## Segurança

### Checklist de Segurança

- [ ] `.env.local` está no `.gitignore`
- [ ] API Key não está exposta no código
- [ ] HTTPS está ativo
- [ ] Webhook valida origem (recomendado)
- [ ] Rate limiting configurado (recomendado)

### Validação de Webhook (Recomendado)

Adicione em `app/api/webhook/route.ts`:

```typescript
const asaasToken = req.headers.get('asaas-access-token');
if (asaasToken !== process.env.ASAAS_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Backup e Recuperação

### Antes de ir para produção

- [ ] Faça commit de todas as alterações
- [ ] Push para repositório Git
- [ ] Crie tag de versão (`v1.0.0`)
- [ ] Documente configurações especiais

```bash
git add .
git commit -m "Deploy: versão 1.0.0 - sistema de reservas completo"
git tag v1.0.0
git push origin main --tags
```

## Troubleshooting

### Problema: Erro 500 na API

**Solução**:
1. Verifique logs da plataforma
2. Confirme variáveis de ambiente
3. Teste API Key no Postman

### Problema: Webhook não é chamado

**Solução**:
1. Verifique URL no painel Asaas
2. Teste endpoint manualmente
3. Verifique logs do webhook no Asaas
4. Confirme que HTTPS está ativo

### Problema: Pagamento não aparece

**Solução**:
1. Verifique se está usando ambiente correto
2. Confirme API Key de produção
3. Aguarde alguns minutos (delay normal)

### Problema: Build falha

**Solução**:
1. Rode `npm run build` localmente
2. Corrija erros de TypeScript
3. Verifique dependências

## Manutenção Contínua

### Semanal
- [ ] Revisar logs de erro
- [ ] Verificar reservas pendentes
- [ ] Monitorar taxa de conversão

### Mensal
- [ ] Analisar métricas de pagamento
- [ ] Revisar feedback dos clientes
- [ ] Atualizar dependências (`npm update`)

### Trimestral
- [ ] Rotacionar API Keys
- [ ] Revisar segurança
- [ ] Avaliar novas features

## Contatos de Emergência

### Suporte Técnico
- **Asaas**: suporte@asaas.com
- **Status Asaas**: https://status.asaas.com
- **Vercel Support**: https://vercel.com/support

### Documentação
- Asaas: https://docs.asaas.com
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

## Próximos Passos

Após deploy bem-sucedido:

1. **Implementar Banco de Dados**
   - PostgreSQL (Vercel Postgres)
   - MongoDB (MongoDB Atlas)
   - Supabase

2. **Sistema de E-mails**
   - Resend
   - SendGrid
   - Postmark

3. **WhatsApp**
   - Twilio
   - Evolution API
   - Baileys

4. **Painel Admin**
   - Next.js Admin
   - React Admin
   - Custom dashboard

## Checklist Final

Antes de divulgar:

- [ ] Todos os testes passaram
- [ ] Pagamento real de teste funcionou
- [ ] Webhook está respondendo
- [ ] Links estão corretos
- [ ] Responsividade OK
- [ ] Performance OK (Lighthouse)
- [ ] SEO básico configurado
- [ ] Favicon adicionado
- [ ] Texto revisado
- [ ] Números de contato corretos

---

## Deploy Concluído? 🎉

Parabéns! Seu sistema de reservas está no ar!

**Compartilhe seu link**: ____________________________

**Data de deploy**: ____________________________

**Próxima revisão**: ____________________________
