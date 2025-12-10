# API Reference Guide

Documentação completa de todos os endpoints da API.

---

## 📋 Índice

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Payments](#payments)
  - [Reservations](#reservations)
  - [Vouchers](#vouchers)
  - [Admin](#admin)
- [Examples](#examples)

---

## 🌐 Base URLs

| Environment | URL |
|---|---|
| **Development** | `http://localhost:8080/api` |
| **Production** | `https://api.rosamexicano.com/api` |

---

## 🔐 Authentication

### Bearer Token

Todos os endpoints protegidos requerem um JWT Bearer Token no header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Structure

```json
{
  "sub": "user_id",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["dashboard", "reservations", "vouchers"],
  "iat": 1702224000,
  "exp": 1702224900
}
```

### Token Refresh

Tokens expiram a cada 15 minutos. Use o refresh token para obter novo access token:

```http
POST /admin/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional details"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| `200` | OK | Sucesso |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Validação falhou |
| `401` | Unauthorized | Token inválido/expirado |
| `403` | Forbidden | Permissão insuficiente |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Email/código já existe |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Server Error | Erro interno |

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_TOKEN` | 401 | Token inválido ou expirado |
| `MISSING_TOKEN` | 401 | Token não fornecido |
| `INSUFFICIENT_PERMISSION` | 403 | Usuário sem permissão |
| `INVALID_EMAIL` | 400 | Email inválido |
| `WEAK_PASSWORD` | 400 | Senha não atende requisitos |
| `EMAIL_EXISTS` | 409 | Email já cadastrado |
| `RESERVATION_NOT_FOUND` | 404 | Reserva não encontrada |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requisições excedido |

---

## 📡 Endpoints

### AUTH

#### Login

Autentica um usuário admin.

```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@rosamexicano.com",
  "password": "SenhaForte123!@#"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "id": "user_123",
    "email": "admin@rosamexicano.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["dashboard", "reservations", "vouchers", "users", "reports"]
  }
}
```

**Errors:**
- `400` - Email ou senha inválidos
- `429` - Muitas tentativas de login

---

#### Refresh Token

Gera novo access token.

```http
POST /admin/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

---

#### Get Profile

Retorna dados do usuário autenticado.

```http
GET /admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "admin@rosamexicano.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["dashboard", "reservations", "vouchers", "users", "reports"],
    "active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### PAYMENTS

#### Create Payment

Cria um pagamento PIX via Asaas.

```http
POST /payments/create
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11987654321",
  "data": "2024-12-31",
  "horario": "19:00",
  "numero_pessoas": 4,
  "mesas_selecionadas": "1,2"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "reservation_id": "res_abc123",
  "payment_id": "pay_123456",
  "external_ref": "ext_ref_789",
  "pix_qr_code": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "pix_copy_paste": "00020126580014br.gov.bcb.pix0136...",
  "expiration_date": "2024-12-13T19:00:00Z",
  "amount": 50.00
}
```

**Errors:**
- `400` - Dados inválidos
- `409` - Email já tem reserva pendente
- `500` - Erro ao criar pagamento com Asaas

---

#### Check Payment Status

Verifica status de um pagamento.

```http
GET /payments/:id/status
```

**Response (200 OK):**
```json
{
  "success": true,
  "payment_id": "pay_123456",
  "status": "CONFIRMED",
  "is_confirmed": true,
  "amount": 50.00,
  "confirmed_at": "2024-12-12T15:30:00Z"
}
```

**Status Possible Values:**
- `PENDING` - Aguardando pagamento
- `RECEIVED` - Pagamento recebido
- `CONFIRMED` - Confirmado
- `EXPIRED` - Expirado
- `CANCELLED` - Cancelado

---

### RESERVATIONS

#### List Reservations

Retorna lista de reservas com filtros.

```http
GET /admin/reservations?status=confirmed&limit=20&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` (optional): `pending`, `confirmed`, `approved`, `rejected`
- `limit` (optional, default: 20): Itens por página
- `offset` (optional, default: 0): Deslocamento

**Response (200 OK):**
```json
{
  "success": true,
  "reservations": [
    {
      "id": "res_123",
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "11987654321",
      "data": "2024-12-31",
      "horario": "19:00",
      "numero_pessoas": 4,
      "valor": 50.00,
      "status": "confirmed",
      "mesas_selecionadas": "1,2",
      "created_at": "2024-12-10T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

#### Get Reservation

Retorna detalhes de uma reserva específica.

```http
GET /admin/reservations/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "reservation": {
    "id": "res_123",
    "payment_id": "pay_456",
    "external_ref": "ext_123",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11987654321",
    "data": "2024-12-31",
    "horario": "19:00",
    "numero_pessoas": 4,
    "valor": 50.00,
    "status": "confirmed",
    "mesas_selecionadas": "1,2",
    "observacoes": "Cliente vegetariano",
    "created_at": "2024-12-10T10:00:00Z",
    "updated_at": "2024-12-10T10:05:00Z",
    "voucher": {
      "id": "vouch_789",
      "codigo": "RM-ABC123-DEF456",
      "valor": 50.00,
      "utilizado": false,
      "data_validade": "2024-12-31"
    }
  }
}
```

---

#### Approve Reservation

Aprova uma reserva.

```http
POST /admin/reservations/:id/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "Reserva aprovada com sucesso"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reservation approved"
}
```

**Errors:**
- `404` - Reserva não encontrada
- `400` - Status inválido para aprovação

---

#### Reject Reservation

Rejeita uma reserva.

```http
POST /admin/reservations/:id/reject
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Capacidade insuficiente para horário solicitado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reservation rejected"
}
```

---

### VOUCHERS

#### List Vouchers

Retorna lista de vouchers.

```http
GET /admin/vouchers?utilizado=false&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "vouchers": [
    {
      "id": "vouch_123",
      "codigo": "RM-ABC123-DEF456",
      "valor": 50.00,
      "utilizado": false,
      "data_validade": "2024-12-31",
      "reservation": {
        "id": "res_123",
        "nome": "João Silva",
        "data": "2024-12-31",
        "horario": "19:00"
      }
    }
  ],
  "total": 100
}
```

---

#### Get Voucher

Retorna detalhes de um voucher.

```http
GET /admin/vouchers/:codigo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "voucher": {
    "id": "vouch_123",
    "codigo": "RM-ABC123-DEF456",
    "valor": 50.00,
    "utilizado": false,
    "data_validade": "2024-12-31",
    "data_utilizacao": null,
    "qr_code_data": "RM-ABC123-DEF456",
    "pdf_url": "https://cdn.example.com/vouchers/vouch_123.pdf",
    "reservation": {
      "id": "res_123",
      "nome": "João Silva",
      "email": "joao@example.com",
      "data": "2024-12-31",
      "horario": "19:00",
      "numero_pessoas": 4,
      "mesas_selecionadas": "1,2"
    }
  }
}
```

---

#### Validate Voucher

Valida e marca voucher como utilizado.

```http
POST /admin/vouchers/:codigo/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Voucher validated successfully",
  "voucher": {
    "id": "vouch_123",
    "codigo": "RM-ABC123-DEF456",
    "utilizado": true,
    "data_utilizacao": "2024-12-31T19:00:00Z"
  }
}
```

**Errors:**
- `404` - Voucher não encontrado
- `400` - Voucher expirado ou já utilizado

---

### ADMIN

#### Get Dashboard Stats

Retorna estatísticas do dashboard.

```http
GET /admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "total_reservations": 250,
    "confirmed_count": 180,
    "pending_count": 50,
    "approved_count": 150,
    "total_revenue": 9000.00,
    "total_people": 720,
    "todays_reservations": 12
  }
}
```

---

#### List Admin Users

Retorna lista de usuários admin.

```http
GET /admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "admins": [
    {
      "id": "admin_1",
      "email": "admin@rosamexicano.com",
      "name": "Admin Principal",
      "role": "admin",
      "permissions": ["dashboard", "reservations", "vouchers", "users", "reports"],
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Create Admin User

Cria novo usuário admin.

```http
POST /admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "novo@rosamexicano.com",
  "password": "SenhaForte123!@#",
  "name": "Novo Admin",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "admin_2",
    "email": "novo@rosamexicano.com",
    "name": "Novo Admin",
    "role": "user",
    "permissions": ["reservations", "vouchers"],
    "active": true
  }
}
```

**Errors:**
- `400` - Dados inválidos
- `409` - Email já existe

---

#### Get Reports

Gera relatórios em diferentes formatos.

```http
GET /admin/reports?type=summary
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `type` (optional): `summary`, `detailed`, `pdf`

**Response (200 OK - Summary):**
```json
{
  "success": true,
  "report": {
    "period": "2024-12",
    "total_reservations": 250,
    "confirmed": 180,
    "total_revenue": 9000.00,
    "average_party_size": 4.2,
    "peak_times": ["19:00", "20:00"],
    "table_usage": 85.5
  }
}
```

**Response (200 OK - PDF):**
```
[PDF file in bytes]
Content-Type: application/pdf
```

---

## 💡 Examples

### Complete Flow: Create Reservation

```bash
# 1. Create payment
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

# 2. Get PIX QR Code (from response)
# Display QR code to customer

# 3. Customer pays (Asaas webhook will be sent)

# 4. Admin logs in
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rosamexicano.com",
    "password": "SenhaForte123!@#"
  }'

# 5. Get all reservations
curl -X GET "http://localhost:8080/api/admin/reservations?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 6. Approve reservation
curl -X POST http://localhost:8080/api/admin/reservations/res_123/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "Approved"}'

# 7. Validate voucher at entrance
curl -X POST http://localhost:8080/api/admin/vouchers/RM-ABC123-DEF456/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Rate Limiting

Endpoints têm limite de requisições por IP:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/admin/login` | 5 req | 1 min |
| Públicos | 30 req | 1 min |
| Autenticados | 300 req | 1 min |
| Webhooks | 100 req | 1 min |

Exceder limite retorna `HTTP 429`:
```json
{
  "success": false,
  "error": "Too many requests. Try again later."
}
```

---

**Última atualização:** Dezembro 2024
