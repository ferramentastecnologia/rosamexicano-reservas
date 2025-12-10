# Quick Start Guide

Comece em 5 minutos! 🚀

---

## ⚡ Setup Local (5 minutos)

### Prerequisites

- Go 1.22+: https://go.dev/dl
- Node.js 18+: https://nodejs.org
- PostgreSQL 12+: https://www.postgresql.org/download

**macOS:**
```bash
brew install go node postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install golang-go nodejs postgresql
```

---

## 🔧 Instalação

### 1. Clone Repository

```bash
git clone https://github.com/seu-repo/rosamexicano-reservas.git
cd rosamexicano-reservas
```

### 2. Setup Backend (3 min)

```bash
cd backend

# Copy env template
cp .env.example .env

# Edit .env (minimal for local dev)
cat > .env << EOF
PORT=8080
GIN_MODE=debug
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rosamexicano
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=test_key
ASAAS_WEBHOOK_SECRET=test_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@gmail.com
EMAIL_PASS=test_password
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
EOF

# Download dependencies
go mod download

# Run server
make run
```

✅ Backend rodando em: http://localhost:8080

**Health Check:**
```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

### 3. Setup Frontend (2 min)

```bash
cd ../frontend

# Copy env template
cp .env.example .env

# Edit .env
cat > .env << EOF
VITE_API_URL=http://localhost:8080/api
EOF

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend rodando em: http://localhost:3000

---

## 📊 Setup Database

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE rosamexicano;
CREATE USER rosamexicano_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE rosamexicano TO rosamexicano_user;
\q
```

**Tabelas são criadas automaticamente** pelo GORM na primeira execução do servidor.

---

## 🧪 Testar Fluxo Completo

### 1. Create Reservation

```bash
curl -X POST http://localhost:8080/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11987654321",
    "data": "2024-12-31",
    "horario": "19:00",
    "numero_pessoas": 4,
    "mesas_selecionadas": "1,2"
  }'

# Response:
# {
#   "success": true,
#   "reservation_id": "res_abc123",
#   "payment_id": "pay_123456",
#   "pix_qr_code": "iVBORw0KGg..."
# }
```

### 2. Login as Admin

```bash
# Create admin user first
cd backend
go run cmd/server/main.go

# In another terminal (database must be running):
psql rosamexicano << EOF
INSERT INTO admins (id, email, password, name, role, permissions, active)
VALUES (
  'admin_1',
  'admin@rosamexicano.com',
  '\$2a\$12\$...',  -- bcrypt of "Password123!@"
  'Admin User',
  'admin',
  '["dashboard","reservations","vouchers","users","reports"]',
  true
);
EOF

# Login
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rosamexicano.com",
    "password": "Password123!@"
  }'

# Response:
# {
#   "success": true,
#   "access_token": "eyJhbGc...",
#   "refresh_token": "eyJhbGc..."
# }
```

### 3. List Reservations

```bash
TOKEN="seu_access_token_aqui"

curl -X GET "http://localhost:8080/api/admin/reservations?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true,
#   "reservations": [ ... ]
# }
```

---

## 📝 Development Workflow

### Backend Development

```bash
cd backend

# Hot reload (requires 'air' installed)
# Install: go install github.com/cosmtrek/air@latest
make dev

# Or manual:
go run cmd/server/main.go

# Run tests
go test ./...

# Run linter
golangci-lint run
```

**Structure:**
```
cmd/server/           # Entry point
internal/
  ├── config/         # Configuration
  ├── models/         # Database models
  ├── repository/     # Data access
  ├── service/        # Business logic
  ├── handler/        # HTTP handlers
  └── middleware/     # HTTP middleware
pkg/utils/           # Utilities
api/routes.go        # Route definitions
```

---

### Frontend Development

```bash
cd frontend

# Dev server with hot module reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint
npm run lint
```

**Structure:**
```
src/
  ├── pages/         # Page components
  ├── components/    # Reusable components
  ├── services/      # API client
  ├── context/       # State management
  ├── hooks/         # Custom hooks
  ├── types/         # TypeScript types
  └── lib/           # Utilities
```

---

## 🐛 Common Issues & Fixes

### "connection refused" - Database not running

```bash
# Start PostgreSQL
# macOS
brew services start postgresql

# Ubuntu
sudo systemctl start postgresql

# Verify
psql -U postgres -c "SELECT 1"
```

### "JWT secret not configured"

```bash
# Generate new secrets
openssl rand -hex 32  # Copy to JWT_ACCESS_SECRET
openssl rand -hex 32  # Copy to JWT_REFRESH_SECRET

# Update .env
nano .env
```

### Port 8080 already in use

```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>

# Or use different port
PORT=8081 go run cmd/server/main.go
```

### Frontend can't connect to backend

```bash
# Check VITE_API_URL in frontend/.env
cat frontend/.env

# Should be: http://localhost:8080/api
# Or for production: https://api.rosamexicano.com/api

# Verify backend is running
curl http://localhost:8080/health
```

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `backend/cmd/server/main.go` | Application entry point |
| `backend/internal/config/config.go` | Configuration loader |
| `backend/internal/models/*.go` | Database models |
| `backend/api/routes.go` | API route definitions |
| `backend/internal/handler/*.go` | HTTP request handlers |
| `backend/internal/service/*.go` | Business logic |
| `frontend/src/App.tsx` | React router setup |
| `frontend/src/services/api.ts` | Axios API client |
| `frontend/src/context/AuthContext.tsx` | Auth state |

---

## 🚀 Next Steps

1. **Read Documentation:**
   - `README.md` - Overview
   - `API.md` - API endpoints
   - `ARCHITECTURE.md` - Design decisions
   - `DEPLOYMENT.md` - Production deployment

2. **Explore Code:**
   ```bash
   # Backend structure
   tree backend -L 2 -I "bin|vendor"

   # Frontend structure
   tree frontend/src -L 2
   ```

3. **Run Tests:**
   ```bash
   cd backend
   go test ./...

   cd ../frontend
   npm test
   ```

4. **Deploy:**
   - See `DEPLOYMENT.md` for Railway, Docker, VPS options

---

## 🆘 Getting Help

**Documentation:**
- API docs: `API.md`
- Architecture: `ARCHITECTURE.md`
- Deployment: `DEPLOYMENT.md`

**Code Examples:**
```bash
# Backend example: Create reservation
grep -r "CreatePaymentRequest" backend/

# Frontend example: Auth context
grep -r "useAuth" frontend/src/

# Database schema
grep -r "type Reservation struct" backend/
```

**Debugging:**

```bash
# Backend: Enable debug logging
GIN_MODE=debug go run cmd/server/main.go

# Backend: SQL query logging
LOG_LEVEL=debug go run cmd/server/main.go

# Frontend: React DevTools (browser extension)

# Postman Collection: (create .postman_collection.json)
# See examples in API.md
```

---

## 💡 Development Tips

### Use Makefile shortcuts

```bash
make help          # Show all commands
make install-deps  # Install dependencies
make dev          # Start with hot reload
make build        # Build binary
make test         # Run tests
make lint         # Lint code
```

### Useful curl commands

```bash
# Health check
curl http://localhost:8080/health

# Login (save token)
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass"}' \
  | jq -r '.access_token')

# Use token
curl http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# Pretty print JSON
curl http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Browser DevTools

```javascript
// Frontend console debugging
// Get auth token
localStorage.getItem('authToken')

// Make API call
fetch('http://localhost:8080/api/admin/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
}).then(r => r.json()).then(console.log)
```

---

## ✅ Checklist: Ready to Code

- [ ] Go 1.22+ installed (`go version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`psql -U postgres -c "SELECT 1"`)
- [ ] Backend running (`curl http://localhost:8080/health`)
- [ ] Frontend running (`curl http://localhost:3000`)
- [ ] Database connected (no errors in logs)
- [ ] Admin user created
- [ ] Can login to admin panel
- [ ] Read README.md
- [ ] Familiar with `/backend` and `/frontend` structure

---

## 🎯 Common Tasks

### Add New Endpoint

1. Create handler in `internal/handler/`
2. Add route in `api/routes.go`
3. Create service method if needed
4. Test with curl
5. Document in `API.md`

### Add Middleware

1. Create in `internal/middleware/`
2. Register in `main.go` or `api/routes.go`
3. Test protected routes

### Modify Database Model

1. Update struct in `internal/models/`
2. GORM auto-migration handles schema
3. Test with `go test ./...`

### Deploy Changes

1. Commit to `main` branch
2. Push to GitHub
3. GitHub Actions runs tests
4. Railway auto-deploys on success

---

**Ready to build? Start with:** `cd backend && make dev` 🎉

---

**Last updated:** December 2024
