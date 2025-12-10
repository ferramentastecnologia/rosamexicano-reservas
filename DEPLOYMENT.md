# Guia de Deployment

Instruções completas para fazer deploy da aplicação em produção.

---

## 📋 Checklist Pré-Deployment

- [ ] Todos os testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Database backup realizado
- [ ] SSL/TLS configurado
- [ ] Rate limiting testado
- [ ] Webhooks configurados
- [ ] Email verificado
- [ ] CORS configurado

---

## 🚀 Deployment da Aplicação Completa

### Opção 1: Railway.app (Recomendado - Full Stack)

Railway oferece PostgreSQL, Go backend, e React frontend em um único lugar.

#### Passo 1: Preparar Repositório

```bash
# 1. Criar arquivo docker-compose.yml na raiz
# 2. Adicionar .railwayignore se necessário
# 3. Commit no Git
git add .
git commit -m "Prepare for Railway deployment"
git push
```

#### Passo 2: Configurar Backend em Railway

```bash
# 1. Acessar https://railway.app
# 2. Click "New Project"
# 3. Selecionar "Deploy from GitHub"
# 4. Escolher repositório

# 5. Adicionar variáveis de ambiente:
# Variables > Add Variables
PORT=8080
GIN_MODE=release
DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
JWT_ACCESS_SECRET=<gerar_novo>
JWT_REFRESH_SECRET=<gerar_novo>
ENCRYPTION_KEY=<gerar_novo>
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=<copiar_chave_asaas>
ASAAS_WEBHOOK_SECRET=<copiar_secret_asaas>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<seu_email>
EMAIL_PASS=<app_password_gmail>
FRONTEND_URL=https://rosamexicano.netlify.app
ENVIRONMENT=production

# 6. Configurar Build Command:
# Settings > Build Settings
# Build Command: go build -o bin/server cmd/server/main.go
# Start Command: ./bin/server

# 7. Deploy
```

#### Passo 3: Configurar PostgreSQL em Railway

```bash
# 1. No dashboard do Railway
# 2. Click "New" > "Database" > "PostgreSQL"
# 3. Railway criará variáveis de ambiente automaticamente
# 4. Copiar DATABASE_URL
```

#### Passo 4: Configurar Frontend em Railway

```bash
# 1. Click "New Service" > "GitHub"
# 2. Selecionar mesmo repositório
# 3. Settings:
#    Build Command: npm run build --prefix frontend
#    Start Command: npm run preview --prefix frontend
#    Root Directory: frontend

# 4. Variáveis de ambiente:
VITE_API_URL=https://<railway-api-domain>/api

# 5. Deploy
```

#### Passo 5: Configurar Domínio

```bash
# Backend:
# 1. Settings > Domains
# 2. Click "Generate Domain"
# 3. Adicionar domínio customizado (CNAME):
#    api.rosamexicano.com → railway-domain

# Frontend:
# 1. Igual ao backend
# 2. Domínio: rosamexicano.com
```

---

### Opção 2: Docker + Docker Compose (Self-Hosted)

Para deployment em VPS próprio.

#### Passo 1: Criar Dockerfile (Backend)

**Arquivo:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o bin/server cmd/server/main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/bin/server .

EXPOSE 8080

CMD ["./server"]
```

#### Passo 2: Criar Dockerfile (Frontend)

**Arquivo:** `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Passo 3: Docker Compose

**Arquivo:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: rosamexicano
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      PORT: 8080
      GIN_MODE: release
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/rosamexicano
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      ASAAS_API_URL: ${ASAAS_API_URL}
      ASAAS_API_KEY: ${ASAAS_API_KEY}
      ASAAS_WEBHOOK_SECRET: ${ASAAS_WEBHOOK_SECRET}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
      FRONTEND_URL: ${FRONTEND_URL}
      ENVIRONMENT: production
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

#### Passo 4: Nginx Config

**Arquivo:** `nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # GZIP compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json;

    # Backend API
    upstream backend {
        server backend:8080;
    }

    # Frontend
    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name api.rosamexicano.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }
    }

    server {
        listen 80;
        server_name rosamexicano.com;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Passo 5: Fazer Deploy

```bash
# 1. SSH no servidor
ssh user@server.com

# 2. Clonar repositório
git clone https://github.com/seu-repo/rosamexicano-reservas.git
cd rosamexicano-reservas

# 3. Criar .env
cp .env.example .env
nano .env  # Editar com variáveis de produção

# 4. Build e rodar com Docker Compose
docker-compose up -d

# 5. Verificar status
docker-compose ps
docker-compose logs -f backend
```

---

## 🔐 Segurança em Produção

### SSL/TLS com Let's Encrypt

```bash
# 1. Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Gerar certificado
sudo certbot certonly --standalone -d api.rosamexicano.com -d rosamexicano.com

# 3. Renovar automaticamente
sudo certbot renew --quiet --no-eff-email --pre-hook "docker-compose down" --post-hook "docker-compose up -d"

# 4. Adicionar certificado ao Nginx
# No nginx.conf:
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/rosamexicano.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/rosamexicano.com/privkey.pem;
```

### Secrets Management

```bash
# NÃO commitar .env em Git!
echo ".env" >> .gitignore

# Usar Railway secrets ou Docker secrets:
# Docker secrets (para Swarm):
docker secret create jwt_secret -
docker secret create encryption_key -

# Passar para container:
# secrets:
#   - jwt_secret
# environment:
#   JWT_ACCESS_SECRET_FILE: /run/secrets/jwt_secret
```

### Backup Automático

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rosamexicano_$DATE.sql.gz"

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U rosamexicano rosamexicano | gzip > $BACKUP_FILE

# Manter últimos 7 backups
find $BACKUP_DIR -name "rosamexicano_*.sql.gz" -mtime +7 -delete

# Enviar para S3 (opcional)
# aws s3 cp $BACKUP_FILE s3://seu-bucket/backups/
```

Agendar com cron:
```bash
0 2 * * * /home/user/rosamexicano/backup.sh
```

---

## 📊 Monitoramento

### Health Checks

```bash
# Backend
curl -X GET http://localhost:8080/health

# Response:
# {"status":"ok","timestamp":"2024-12-10T10:00:00Z"}
```

### Logging

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Filtrar por erro
docker-compose logs backend | grep ERROR

# Salvar logs
docker-compose logs backend > logs/backend.log
```

### Performance

```bash
# Monitorar uso de recursos
docker stats

# Testar carga
ab -n 1000 -c 10 http://localhost:8080/health

# Teste de stress
siege -u http://localhost:8080/health -c 10 -r 100
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: test

    steps:
      - uses: actions/checkout@v3

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: 1.22

      - name: Run tests
        run: cd backend && go test ./...

      - name: Build
        run: cd backend && go build -o bin/server cmd/server/main.go

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g railway
          railway up
```

---

## 🚨 Troubleshooting Deployment

### Container não inicia

```bash
docker-compose logs backend

# Se DATABASE_URL inválido:
docker-compose exec backend printenv DATABASE_URL

# Se conexão recusada:
docker-compose exec postgres psql -U rosamexicano -c "SELECT 1"
```

### Webhook não chega após deploy

```bash
# 1. Verificar se aplicação está rodando
docker-compose ps

# 2. Testar endpoint diretamente
curl -X GET https://api.rosamexicano.com/health

# 3. Verificar logs
docker-compose logs backend | grep webhook

# 4. Atualizar URL do webhook em Asaas dashboard
```

### Email não funciona em produção

```bash
# 1. Verificar credenciais no .env
docker-compose exec backend printenv EMAIL_USER

# 2. Testar SMTP manualmente
docker run -it --rm telnet:latest telnet smtp.gmail.com 587

# 3. Habilitar "Less secure app" se Gmail (descontinuado)
# Usar App Password em vez disso
```

---

## 📦 Rolling Updates (Zero Downtime)

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Update feature"
git push

# 2. Railway faz deploy automático
# Ou manualmente:
docker-compose up -d backend  # Cria novo container
docker-compose exec -d backend sleep 30  # Aguarda
docker-compose up -d  # Completa swap

# 3. Verificar saúde
curl https://api.rosamexicano.com/health
```

---

## 🎯 Checklist Pós-Deployment

- [ ] Frontend acessível em domínio
- [ ] Backend respondendo em domínio
- [ ] Login funcionando
- [ ] Payments funcionando (Asaas)
- [ ] Emails sendo enviados
- [ ] Webhooks recebidos
- [ ] Rates limitada funcionando
- [ ] SSL válido e renovando
- [ ] Backups automáticos rodando
- [ ] Logs sendo coletados
- [ ] Alertas configurados

---

**Última atualização:** Dezembro 2024
