# Architecture Guide

Documentação das decisões arquiteturais e padrões de design utilizados no projeto.

---

## 🎯 Decisões Arquiteturais

### 1. Monorepo vs Polyrepo

**Decisão:** Monorepo (Backend + Frontend no mesmo repositório)

**Justificativa:**
- ✅ Deployment sincronizado (mesma versão)
- ✅ Facilita refatorações cross-layer
- ✅ CI/CD simplificado
- ✅ Documentação centralizada
- ✅ Versionamento único

**Estrutura:**
```
rosamexicano-reservas/
├── backend/     # Go API
├── frontend/    # React SPA
└── docs/        # Documentação
```

---

### 2. Backend: Go + Gin vs Node.js/Express

**Decisão:** Go + Gin

**Justificativa:**
- ✅ Performance (10-50x mais rápido que Node.js)
- ✅ HTTP client nativo superior (Asaas integration)
- ✅ Concorrência nativa (goroutines vs async/await)
- ✅ Binário único (fácil deploy)
- ✅ Tipagem estática (menos bugs)
- ✅ Imagem Docker menor (30MB vs 150MB)

**Comparação:**

| Aspecto | Go | Node.js |
|--------|----|---------|
| Performance | ⚡⚡⚡ | ⚡ |
| Concorrência | Goroutines | Callbacks/Async |
| Startup | <100ms | 1-2s |
| Memory | 20-50MB | 100-200MB |
| Docker Image | 30MB | 150MB |

---

### 3. Frontend: React + Vite vs Next.js

**Decisão:** React + Vite (SPA)

**Justificativa:**
- ✅ Separação clara (backend/frontend independentes)
- ✅ Deploy simplificado (static files em CDN)
- ✅ Melhor performance (Vite vs webpack)
- ✅ API agnóstica (qualquer backend)
- ✅ Client-side rendering suficiente para este caso

**Trade-offs Considerados:**

| Aspecto | Next.js | React + Vite |
|--------|---------|--------------|
| SSR/SSG | ✅ | ❌ |
| SEO | ✅ | ⚠️ (React Helmet) |
| Build Time | ⚠️ | ✅ |
| Bundle Size | ⚠️ | ✅ |
| Deployment | Simples | Simples |
| API Agnóstica | ❌ | ✅ |

**Decisão Final:** React + Vite melhor para este projeto (API agnóstica é crítica).

---

### 4. Database: PostgreSQL vs MongoDB

**Decisão:** PostgreSQL

**Justificativa:**
- ✅ ACID transactions (pagamentos)
- ✅ Relações estruturadas (Reservation ↔ Voucher)
- ✅ Queries complexas (analytics)
- ✅ Backup/Recovery confiável
- ✅ GORM suporta nativamente

---

### 5. Authentication: JWT vs Session

**Decisão:** JWT com Refresh Tokens

**Justificativa:**
- ✅ Stateless (escalável horizontalmente)
- ✅ Funciona em múltiplos servidores
- ✅ Mobile-friendly
- ✅ CORS amigável
- ⚠️ Sem revogação imediata (refresh token mitiga)

**Token Strategy:**
```
Access Token (15 min)  → Curta vida, não revogável
    ↓
   Refresh Token (7 dias) → Revogável via blacklist/logout
```

---

### 6. ORM: GORM vs Raw SQL

**Decisão:** GORM

**Justificativa:**
- ✅ Type-safe queries
- ✅ Migrations automáticas
- ✅ Query builder elegante
- ✅ Hooks para lógica (encryption, timestamps)
- ✅ Previne SQL injection

**Exemplo:**
```go
// GORM
db.Where("email = ?", email).First(&user)

// vs Raw SQL (vulnerável!)
db.Raw("SELECT * FROM users WHERE email = '" + email + "'")
```

---

### 7. Payment Gateway: Asaas vs Stripe

**Decisão:** Asaas

**Justificativa:**
- ✅ PIX nativo (brasileiro)
- ✅ Sem gateway fee adicional
- ✅ Webhook confiável
- ✅ Dashboard completo
- ✅ Taxa competitiva (~2.99%)

---

## 🏛️ Padrões de Design

### Repository Pattern

Abstrai acesso a dados:

```go
// Handler
func (h *Handler) GetReservation(id string) {
    reservation := h.repo.FindByID(id)
}

// Repository layer
func (r *Repository) FindByID(id string) {
    return db.First(&reservation)
}
```

**Benefícios:**
- Testável (mock repository)
- Desacoplado (trocar BD fácil)
- Centralizado (queries em um lugar)

---

### Service Layer

Encapsula lógica de negócio:

```go
// Handler (thin - só HTTP)
func (h *Handler) CreateReservation(req Request) {
    reservation := h.svc.CreateReservation(req)
}

// Service (thick - lógica)
func (s *Service) CreateReservation(req Request) {
    // Validação
    if !s.isAvailable(req.Data, req.Horario) {
        return error
    }
    // Chamadas ao Asaas
    payment := s.paymentSvc.Create(...)
    // Salva
    s.repo.Create(...)
}
```

**Benefícios:**
- Reutilizável (múltiplos handlers)
- Testável (lógica sem HTTP)
- Separação de responsabilidades

---

### Middleware Chain

Composição de middlewares:

```go
// Router setup
reservations := router.Group("/reservations")
reservations.Use(authMiddleware)
reservations.Use(validateJSON)
reservations.Use(rateLimitMiddleware)
reservations.GET("", handler.List)
```

**Ordem importa:**
1. CORS
2. Rate Limit
3. Auth
4. Validation
5. Handler

---

### Hooks para Lógica Cross-Cutting

GORM BeforeCreate para auto-ID:

```go
func (r *Reservation) BeforeCreate(tx *gorm.DB) error {
    r.ID = generateCUID()
    r.Email = encryptEmail(r.Email)
    return nil
}
```

**Usar para:**
- ✅ Auto-ID generation
- ✅ Encryption/decryption
- ✅ Timestamp management
- ❌ NÃO para lógica de negócio (usar service)

---

### Async Processing

Goroutines para operações demoradas:

```go
// Handler (retorna imediatamente)
webhook.HandlePayment(payment) {
    // Síncro: validação + DB update
    reservation.Status = "confirmed"
    db.Save(reservation)

    // Async: email + PDF geração
    go func() {
        pdf := pdfSvc.Generate(reservation)
        emailSvc.Send(pdf)
    }()

    return 200 OK
}
```

**Padrão:** Fire-and-forget com logging

---

## 📊 Data Flow

### Reservation Flow

```
┌─────────────┐
│   Frontend  │ User fills form
└──────┬──────┘
       │ POST /payments/create
       ▼
┌─────────────────┐
│   Backend       │
│ PaymentHandler  │ Validate input
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ PaymentService  │ Call Asaas API
└──────┬──────────┘
       │ Create customer + payment
       ▼
┌─────────────────┐
│    Asaas API    │ PIX QR Code
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Backend DB    │ Save reservation
└──────┬──────────┘
       │ Return QR Code
       ▼
┌─────────────┐
│   Frontend  │ Display QR
└─────────────┘
       │
       │ User pays (scans QR)
       ▼
┌─────────────────┐
│    Asaas API    │ Payment confirmed
└──────┬──────────┘
       │ POST /webhooks/asaas
       ▼
┌─────────────────┐
│ WebhookHandler  │ Verify signature
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ ReservationSvc  │ Update status
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ VoucherService  │ Generate (async)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  EmailService   │ Send email
└──────┬──────────┘
       │ Voucher + PDF
       ▼
┌─────────────┐
│   Customer  │ Receives voucher
└─────────────┘
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│    HTTPS/TLS Layer (Transport)      │ Encrypted in transit
├─────────────────────────────────────┤
│    CORS / Origin Validation         │ Browser protection
├─────────────────────────────────────┤
│    Rate Limiting (by IP)            │ DDoS protection
├─────────────────────────────────────┤
│    Input Validation                 │ Injection prevention
├─────────────────────────────────────┤
│    JWT Authentication               │ Identity verification
├─────────────────────────────────────┤
│    Role-Based Access Control        │ Authorization
├─────────────────────────────────────┤
│    Webhook Signature Verification   │ External API validation
├─────────────────────────────────────┤
│    Database Query Parameterization  │ SQL injection prevention
├─────────────────────────────────────┤
│    Encryption at Rest (AES-256)     │ Data protection
├─────────────────────────────────────┤
│    Audit Logging                    │ Forensics
├─────────────────────────────────────┤
│    Error Sanitization               │ Information leakage prevention
└─────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Architecture (Single Instance)

```
┌─────────────┐
│   Frontend  │ CDN-served (Netlify)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Backend (Go)    │ Single instance (Railway)
│  ├─ API routes   │
│  ├─ Webhooks     │
│  └─ Services     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  PostgreSQL      │ Managed (Railway)
└──────────────────┘
```

### Future Scalability (Multi-Instance)

```
┌─────────────┐
│   Frontend  │ CDN (static)
└──────┬──────┘
       │
       ▼
┌────────────────────────┐
│   Load Balancer        │
│   (Nginx / Railway)    │
└──────┬───────┬────┬────┘
       │       │    │
    ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
    │ Go  │ │ Go  │ │ Go  │ Stateless instances
    │ API │ │ API │ │ API │
    └──┬──┘ └──┬──┘ └──┬──┘
       │       │    │
       └───────┼────┘
               │
               ▼
        ┌──────────────────┐
        │  PostgreSQL      │ Connection pooling
        │  (Primary)       │ + Read replicas
        └──────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌───────┐   ┌────────┐
    │ Cache │   │ Queue  │ (Optional)
    │Redis  │   │ RabbitMQ│ for async tasks
    └───────┘   └────────┘
```

**Para escalar:**
1. ✅ Connection pooling (já em GORM)
2. ➕ Redis para caching
3. ➕ Message queue para async
4. ➕ Read replicas para PostgreSQL
5. ➕ Multiple backend instances com load balancer

---

## 🧪 Testing Strategy

### Unit Tests (Services)

```go
func TestReservationService_CheckAvailability(t *testing.T) {
    svc := &ReservationService{
        repo: mockRepository,
    }

    available, _ := svc.CheckAvailability("2024-12-31", "19:00")

    assert.True(t, available)
}
```

### Integration Tests (Handlers)

```go
func TestCreatePaymentEndpoint(t *testing.T) {
    router := setupRouter()

    req := httptest.NewRequest("POST", "/api/payments/create", payload)
    w := httptest.NewRecorder()

    router.ServeHTTP(w, req)

    assert.Equal(t, 201, w.Code)
}
```

### E2E Tests (Full Flow)

```bash
# Using Postman / REST Client
1. POST /payments/create
2. GET /payments/xxx/status
3. POST /admin/login
4. GET /admin/reservations
5. POST /admin/reservations/xxx/approve
6. POST /admin/vouchers/RM-xxx/validate
```

---

## 🔄 CI/CD Pipeline

```
Push to main
    ↓
GitHub Actions
    ├─ Go tests
    ├─ Linting
    ├─ Security scan
    └─ Build Docker image
        ↓
    Build succeeds?
        ├─ Yes → Deploy to Railway
        └─ No  → Notify developer
```

---

## 📚 Design Principles

### 1. SOLID Principles

- **S**ingle Responsibility: Repository handles DB, Service handles logic
- **O**pen/Closed: Middleware chain extensível
- **L**iskov Substitution: Services intercambiáveis
- **I**nterface Segregation: Handlers recebem só o que precisa
- **D**ependency Inversion: Injeta interfaces, não concretas

### 2. DRY (Don't Repeat Yourself)

- Validação centralizada em validators
- Middleware reutilizável
- Services compostos

### 3. KISS (Keep It Simple, Stupid)

- Sem over-engineering
- Uma forma de fazer cada coisa
- Código legível

### 4. YAGNI (You Aren't Gonna Need It)

- Sem funcionalidades speculative
- Feature flags apenas para big features
- Simplificar, não complexificar

---

## 🎓 Design Patterns Utilizados

| Pattern | Onde | Benefício |
|---------|------|----------|
| Repository | Data layer | Testabilidade |
| Service Locator | Handlers | Dependency injection |
| Middleware Chain | Router | Composição |
| Async/Await (Goroutines) | Webhooks | Non-blocking |
| Decorator | Middleware | Cross-cutting concerns |
| Factory | Model creation | Centralized creation |
| Singleton | Config, DB | Single instance |

---

**Última atualização:** Dezembro 2024
