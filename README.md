# Rosa Mexicano - Sistema de Reservas

Plataforma completa de reservas para o restaurante Rosa Mexicano, com integração de pagamentos PIX via Asaas, sistema de vouchers, painel admin, e geração de PDFs.

**Stack:** Go + React | **Deploy:** Railway + Netlify | **Database:** PostgreSQL

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tech Stack](#tech-stack)
- [Requisitos](#requisitos)
- [Guia de Instalação](#guia-de-instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Documentation](#api-documentation)
- [Frontend](#frontend)
- [Segurança](#segurança)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contribuição](#contribuição)

---

## 🎯 Visão Geral

Sistema de reservas para o evento de celebração de fim de ano do Rosa Mexicano com:

✅ **Funcionalidades:**
- Formulário de reserva com seleção de data, hora e mesas
- Integração PIX (QR Code) via Asaas
- Sistema de vouchers com QR Code
- Painel administrativo completo
- Validação de vouchers na entrada
- Geração de relatórios em PDF
- Notificações por email
- Dashboard com estatísticas

---

## 🏗️ Arquitetura

### Arquitetura em Camadas (Backend)

```
┌─────────────────────────────────────┐
│         HTTP Requests (React)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         API Gateway (Gin)           │
│  (Middlewares: Auth, CORS, Rate)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Handlers (Business Logic)    │
│  ├─ PaymentHandler                  │
│  ├─ ReservationHandler              │
│  ├─ AdminHandler                    │
│  └─ WebhookHandler                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Services (Use Cases)         │
│  ├─ AuthService                     │
│  ├─ PaymentService                  │
│  ├─ ReservationService              │
│  ├─ EmailService                    │
│  └─ PDFService                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Repositories (Data Access)   │
│  ├─ AdminRepository                 │
│  ├─ ReservationRepository           │
│  └─ VoucherRepository               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Database (PostgreSQL)        │
│  ├─ admins                          │
│  ├─ reservations                    │
│  └─ vouchers                        │
└─────────────────────────────────────┘
```

### Fluxo de Reserva

```
1. Cliente preenche formulário
   ├─ Nome, email, telefone
   ├─ Data, hora, quantidade de pessoas
   └─ Mesas selecionadas

2. Sistema cria pagamento
   ├─ Create customer em Asaas
   ├─ Create payment (PIX)
   ├─ Get PIX QR Code
   └─ Salva reserva com status PENDING

3. Cliente escaneia QR ou usa código PIX

4. Asaas confirma pagamento
   ├─ Envia webhook para aplicação
   ├─ Sistema valida assinatura
   └─ Atualiza status para CONFIRMED

5. Sistema gera voucher
   ├─ Cria código único
   ├─ Gera PDF com QR Code
   └─ Envia email com voucher

6. Admin aprova reserva
   ├─ Status muda para APPROVED
   └─ Envia email de confirmação

7. Cliente apresenta voucher no dia
   ├─ Admin escaneia/valida
   └─ Marca como USADO
```

---

## 💻 Tech Stack

### Backend
| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Language** | Go | 1.22+ |
| **Web Framework** | Gin | v1.10.0 |
| **ORM** | GORM | v1.25.7 |
| **Database** | PostgreSQL | 12+ |
| **Authentication** | JWT (golang-jwt) | v5.2.0 |
| **Password Hash** | bcrypt (golang.org/x/crypto) | v0.19.0 |
| **Email** | Gomail | v2.0.0 |
| **PDF** | gofpdf | v1.16.2 |
| **QR Code** | go-qrcode | v0.0.0 |
| **HTTP Client** | net/http | Native |
| **Logging** | standard log | Native |

### Frontend
| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | v6.0.3 |
| **Routing** | React Router | v6.22.0 |
| **HTTP Client** | Axios | v1.6.7 |
| **Forms** | React Hook Form | v7.66.0 |
| **Validation** | Zod | v4.1.12 |
| **Styling** | Tailwind CSS | v4.0.0 |
| **Animations** | Framer Motion | v11.15.0 |
| **Icons** | Lucide React | v0.553.0 |
| **Shaders** | @paper-design/shaders-react | v0.0.37 |

### Integrações Externas
| Serviço | Uso |
|--------|-----|
| **Asaas** | Payment gateway (PIX, Boleto, Card) |
| **Gmail SMTP** | Envio de emails |

---

## 📦 Requisitos

### Sistema
- **Go:** 1.22 ou superior
- **Node.js:** 18+ (para frontend)
- **PostgreSQL:** 12 ou superior
- **Docker** (opcional, para containerização)

### Contas/APIs
- **Asaas:** Account para integração de pagamentos
- **Gmail:** App password para envio de emails

---

## 🚀 Guia de Instalação

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-repo/rosamexicano-reservas.git
cd rosamexicano-reservas
```

### 2. Setup Backend

```bash
cd backend

# Instalar dependências
go mod download
go mod tidy

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

### 3. Setup Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com URL da API
nano .env
```

### 4. Setup Database

```bash
# Criar banco de dados
createdb rosamexicano

# As tabelas serão criadas automaticamente pelo GORM na primeira execução
```

---

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

**Arquivo:** `backend/.env`

```bash
# Server
PORT=8080
GIN_MODE=debug  # Mudar para "release" em produção

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rosamexicano

# JWT (Gerar com: openssl rand -hex 32)
JWT_ACCESS_SECRET=seu-secret-aqui
JWT_REFRESH_SECRET=seu-refresh-secret-aqui

# Encryption
ENCRYPTION_KEY=sua-encryption-key-aqui

# Asaas (https://asaas.com)
ASAAS_API_URL=https://api.asaas.com/v3  # Ou sandbox para testes
ASAAS_API_KEY=sua-api-key-asaas
ASAAS_WEBHOOK_SECRET=seu-webhook-secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-app-password  # Gerar em https://myaccount.google.com/apppasswords

# CORS
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
```

### Variáveis de Ambiente (Frontend)

**Arquivo:** `frontend/.env`

```bash
VITE_API_URL=http://localhost:8080/api
```

---

## 🏃 Execução

### Backend

```bash
cd backend

# Modo desenvolvimento com hot reload
make dev

# Ou manualmente
go run cmd/server/main.go
```

Server estará disponível em: **http://localhost:8080**

Health check: `GET http://localhost:8080/health`

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Pré-visualizar build
npm run preview
```

Frontend estará disponível em: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
rosamexicano-reservas/
├── backend/                      # Go API
│   ├── cmd/
│   │   └── server/main.go       # Entry point
│   ├── internal/
│   │   ├── config/              # Configuração
│   │   ├── database/            # Conexão DB + migrations
│   │   ├── domain/
│   │   │   ├── models/          # Entidades (Reservation, Voucher, Admin)
│   │   │   └── errors/          # Error types
│   │   ├── repository/          # Data access layer
│   │   ├── service/             # Business logic
│   │   ├── handler/             # HTTP handlers
│   │   └── middleware/          # Auth, CORS, rate limiting
│   ├── pkg/
│   │   └── utils/               # Utility functions
│   ├── api/
│   │   └── routes.go            # Route definitions
│   ├── go.mod / go.sum
│   └── Makefile
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API client
│   │   ├── context/             # State management
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                  # Static assets
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:8080/api`
- **Production:** `https://api.rosamexicano.com/api`

### Authentication
Todos os endpoints da API usam **JWT Bearer Token**:

```http
Authorization: Bearer <seu_token_aqui>
```

### Endpoints Principais

#### Auth
```
POST   /admin/login          - Login com email/password
POST   /admin/refresh        - Refresh token
GET    /admin/profile        - Get user profile
```

#### Payments
```
POST   /payments/create      - Criar pagamento + PIX QR Code
GET    /payments/:id/status  - Verificar status do pagamento
POST   /webhooks/asaas       - Webhook do Asaas
```

#### Reservations
```
GET    /reservations                 - Listar todas
GET    /reservations/:id             - Obter uma
POST   /reservations                 - Criar nova
PUT    /reservations/:id             - Atualizar
DELETE /reservations/:id             - Deletar
POST   /admin/reservations/:id/approve   - Aprovar
POST   /admin/reservations/:id/reject    - Rejeitar
```

#### Vouchers
```
GET    /vouchers            - Listar todos
GET    /vouchers/:codigo    - Obter por código
POST   /vouchers/:codigo/validate  - Validar
```

#### Admin
```
GET    /admin/stats         - Dashboard stats
GET    /admin/users         - Listar admins
POST   /admin/users         - Criar admin
GET    /admin/reports       - Gerar relatórios
```

### Exemplo de Request

```bash
# 1. Login
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rosamexicano.com",
    "password": "senha123"
  }'

# Response:
# {
#   "success": true,
#   "access_token": "eyJhbG...",
#   "refresh_token": "eyJhbG...",
#   "user": { ... }
# }

# 2. Usar token em próximas requisições
curl -X GET http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer eyJhbG..."
```

---

## 🎨 Frontend

### Páginas Principais

| Rota | Descrição | Autenticação |
|------|-----------|--------------|
| `/` | Landing page + formulário de reserva | Não |
| `/pagamento` | Página de pagamento (QR Code PIX) | Não |
| `/sucesso` | Confirmação de reserva + voucher | Não |
| `/admin` | Login | Não |
| `/admin/dashboard` | Dashboard com stats | Sim |
| `/admin/reservations` | Lista de reservas | Sim |
| `/admin/validar-voucher` | Validação de vouchers | Sim |
| `/admin/tables` | Ocupação de mesas | Sim |
| `/admin/users` | Gerenciamento de usuários | Sim |
| `/admin/reports` | Relatórios | Sim |

### Componentes Principais

- **ReservaForm**: Formulário de reserva com validação
- **CalendarioReserva**: Seletor de data com disponibilidade
- **MapaMesas**: Mapa interativo de mesas
- **ShaderBackground**: Background com shader animado
- **AuthContext**: Gerenciamento de autenticação

---

## 🔐 Segurança

### Implementações

✅ **JWT Authentication**
- Access tokens (15 min)
- Refresh tokens (7 dias)
- HMAC-SHA256 signing

✅ **Password Security**
- bcrypt hashing (cost 12)
- Password strength validation

✅ **API Security**
- Rate limiting (30 req/min - public, 5 req/min - auth)
- CORS restritivo
- Security headers (CSP, HSTS, X-Frame-Options)

✅ **Payment Security**
- Webhook signature verification (HMAC-SHA256)
- Payment idempotency (prevent duplicates)
- Database transactions com row locking

✅ **Input Validation**
- Backend validation com go-playground/validator
- XSS protection (DOMPurify no frontend)
- SQL injection prevention (GORM parameterized queries)

✅ **Data Protection**
- TLS 1.3 em produção
- Encryption at rest (AES-256-GCM para PII)
- No sensitive data em logs

### OWASP Top 10

- ✅ A01: Access Control (JWT + RBAC)
- ✅ A02: Cryptographic Failures (TLS + encryption)
- ✅ A03: Injection (parameterized queries)
- ✅ A05: Security Misconfiguration (security headers)
- ✅ A07: Authentication Failures (JWT + password policy)
- ✅ A08: Software Integrity (webhook signature)
- ✅ A10: SSRF (URL whitelist)

---

## 🚀 Deployment

### Backend (Railway)

```bash
# 1. Criar conta em railway.app
# 2. Conectar repositório
# 3. Adicionar variáveis de ambiente
# 4. Deploy automático

# URL: https://rosamexicano-api.up.railway.app
```

### Frontend (Netlify)

```bash
# 1. Criar conta em netlify.com
# 2. Conectar repositório
# 3. Build command: npm run build
# 4. Publish directory: dist
# 5. Deploy automático

# URL: https://rosamexicano.netlify.app
```

### Database (Railway PostgreSQL)

```bash
# Railway oferece PostgreSQL gerenciado
# Copiar DATABASE_URL para ambiente
```

---

## 🐛 Troubleshooting

### Backend não conecta no BD

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão manualmente
psql postgresql://user:password@host:5432/rosamexicano

# Verificar logs do GORM
GIN_MODE=debug go run cmd/server/main.go
```

### Email não está sendo enviado

```bash
# Verificar credenciais Gmail
# 1. Habilitar 2FA em https://myaccount.google.com/security
# 2. Gerar App Password em https://myaccount.google.com/apppasswords
# 3. Copiar password para EMAIL_PASS
# 4. Testar SMTP: telnet smtp.gmail.com 587
```

### Webhook do Asaas não chega

```bash
# 1. Verificar ASAAS_WEBHOOK_SECRET correto
# 2. Verificar se aplicação está rodando
# 3. Usar ngrok para testar localmente:
   ngrok http 8080
#  4. Adicionar URL do ngrok em https://asaas.com/webhooks
```

### CORS error no frontend

```bash
# Verificar FRONTEND_URL em backend .env
# Deve estar exatamente igual ao domínio do frontend
# Ex: http://localhost:3000 (com protocolo)
```

---

## 🤝 Contribuição

1. Create feature branch: `git checkout -b feature/AmazingFeature`
2. Commit changes: `git commit -m 'Add AmazingFeature'`
3. Push to branch: `git push origin feature/AmazingFeature`
4. Open Pull Request

---

## 📝 License

Este projeto é propriedade do Rosa Mexicano.

---

## 📞 Suporte

Para suporte, entre em contato:
- Email: contato@rosamexicano.com
- Telefone: (11) 3000-0000
- WhatsApp: (11) 99999-9999

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
