# 🔌 Referência de Endpoints da API

## Baseado em: `ADMIN_SYSTEM.md`

Todos os endpoints são acessíveis em `http://localhost:3000`

### Autenticação

Todos os endpoints (exceto `/auth/login`) requerem:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## � Sistema de Privilégios (v1.1)

A partir de v1.1, privilégios foram centralizados no modelo **User**:

- ✅ Campo `isadmin` está em User, não em Player
- ✅ Player herda privilégios via seu User associado
- ✅ Permite players sem usuário (sem privilégios administrativos)

**Autorização por AdminGuard**:
```
Request com token
    ↓
AuthGuard valida token
    ↓
AdminGuard busca User.isadmin
    ↓
User.isadmin = true → Permite
User.isadmin = false → 403 Forbidden
```

---

## �🔐 Auth Module (`/auth`)

### Login
**POST** `/auth/login`

Autentica usuário e retorna JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "sua_senha"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": "24h"
}
```

**Possíveis Erros:**
- `401 Unauthorized` - Credenciais inválidas
- `400 Bad Request` - Email/senha não fornecidos

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skillers.com",
    "password": "senha123"
  }'
```

### Registrar (se habilitado)
**POST** `/auth/register`

Cria nova conta de usuário

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "senha_segura_123",
  "name": "Novo Usuário"
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "email": "newuser@example.com",
  "name": "Novo Usuário",
  "created_at": "2026-03-11T10:00:00Z"
}
```

---

## 👥 Players Module (`/players`)

### Listar Todos os Jogadores
**GET** `/players`

Retorna lista de todos os players

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `isActive` (opcional): Filtrar por status (true/false)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin Player",
      "userid": "user-uuid-123",
      "isactive": true,
      "isadmin": true,
      "created_at": "2026-03-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Regular Player",
      "userid": null,
      "isactive": false,
      "isadmin": false,
      "created_at": "2026-03-02T00:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/players?isActive=true \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obter Jogador por ID
**GET** `/players/:playerId`

Retorna detalhes de um jogador específico

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin Player",
  "userid": "user-uuid-123",
  "isactive": true,
  "isadmin": true,
  "created_at": "2026-03-01T00:00:00Z"
}
```

**Possíveis Erros:**
- `404 Not Found` - Player não existe

---

## 👤 Admin Endpoints

### 1. Associar Usuário a Jogador
**POST** `/players/:playerId/associate-user`

Associa um usuário a um jogador. Apenas administradores podem fazer isso.

**Request:**
```json
{
  "userId": "user-uuid-here"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Regular Player",
  "userid": "user-uuid-here",
  "isactive": true,
  "isadmin": false,
  "message": "User associated successfully"
}
```

**Possíveis Erros:**
- `403 Forbidden` - Sem permissão (não é admin)
- `404 Not Found` - Player ou User não existe
- `400 Bad Request` - User já associado a outro player
- `409 Conflict` - Player já tem um user

**Restrições:**
- ✅ Apenas administradores
- ✅ Um usuário só pode estar associado a 1 player
- ✅ Um player só pode ter 1 usuário

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/players/2/associate-user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "abc-123-def-456"
  }'
```

---

### 2. Listar Administradores
**GET** `/players/admins`

Lista todos os players que são administradores

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin Player",
      "userid": "user-uuid-123",
      "isactive": true,
      "isadmin": true
    },
    {
      "id": 5,
      "name": "Super Admin",
      "userid": "user-uuid-456",
      "isactive": true,
      "isadmin": true
    }
  ],
  "total": 2
}
```

**Restrições:**
- ✅ Apenas administradores podem ver

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/players/admins \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 3. Promover Usuário a Administrador
**POST** `/users/:userId/make-admin`

Transforma um user em administrador. Apenas admins podem fazer isso.

**Request:** (sem body)
```bash
# Nenhum payload necessário
```

**Response (200):**
```json
{
  "id": "user-uuid-789",
  "email": "newadmin@skillers.com",
  "displayname": "New Admin",
  "isadmin": true,
  "message": "User promoted to admin"
}
```

**Possíveis Erros:**
- `403 Forbidden` - Sem permissão (não é admin)
- `404 Not Found` - User não existe
- `400 Bad Request` - User já é admin

**Restrições:**
- ✅ Apenas administradores
- ✅ User deve estar ativo

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/users/user-uuid-789/make-admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 4. Remover Status de Administrador
**DELETE** `/users/:userId/remove-admin`

Remove privilégios de administrador de um user. Apenas admins podem fazer isso.

**Response (200):**
```json
{
  "id": "user-uuid-789",
  "email": "newadmin@skillers.com",
  "displayname": "New Admin",
  "isadmin": false,
  "message": "Admin status removed"
}
```

**Possíveis Erros:**
- `403 Forbidden` - Sem permissão (não é admin)
- `404 Not Found` - User não existe
- `400 Bad Request` - User não é admin ou é o único admin

**Restrições:**
- ✅ Apenas administradores
- ✅ Não pode remover o último admin do sistema (proteção)

**Exemplo cURL:**
```bash
curl -X DELETE http://localhost:3000/users/user-uuid-789/remove-admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🎮 Games Module (`/games`)

🚧 Módulo em desenvolvimento

Será usado para:
- Criar/listar partidas
- Associar players às partidas
- Rastrear resultados
- Gerar estatísticas

---

## ❌ Respostas de Erro Padrão

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["campo: mensagem de erro"]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials or token expired"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Resource already exists or conflicts with current state"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 🧪 Testando Endpoints

### Com cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@skillers.com", "password": "senha123"}' \
  | jq -r '.access_token')

# 2. Listar admins
curl -X GET http://localhost:3000/players/admins \
  -H "Authorization: Bearer $TOKEN"

# 3. Ver um player
curl -X GET http://localhost:3000/players/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Com Postman

1. Criar coleção "Skillers Poker"
2. Definir variável: `{{base_url}}` = `http://localhost:3000`
3. Definir variável: `{{token}}` = (vazio inicialmente)
4. Fazer login (POST `/auth/login`) e usar token
5. Todos os endpoints herdam as variáveis

### Com Insomnia

1. Importar URL base: `http://localhost:3000`
2. Usar ambiente para armazenar `token`
3. Adicionar script para atualizar token após login

### Via Swagger UI

Acessar: `http://localhost:3000/api/docs`

Todos os endpoints documentados interativamente!

---

## 📊 Fluxo Típico

```
1. POST /auth/login
   ↓ Obtém token JWT
   
2. GET /players (com token)
   ↓ Vê lista de players
   
3. POST /players/:playerId/make-admin (com token admin)
   ↓ Promove player a admin
   
4. POST /players/:playerId/associate-user (com token admin)
   ↓ Associa usuário ao player
   
5. GET /players/admins (com token admin)
   ↓ Confirma novo admin
```

---

## 🔐 Segurança

### Tokens JWT

- **Expiração**: 24 horas (configurável)
- **Algoritmo**: HS256 (padrão)
- **Armazenamento**: localStorage (frontend) ou cookies seguros

### Proteção de Endpoints

- ✅ AuthGuard ativa em todos (exceto `/auth/login`)
- ✅ AdminGuard em endpoints sensíveis
- ✅ Rate limiting (implementar em produção)
- ✅ CORS configurado

### Boas Práticas

```javascript
// ❌ Não faça isso
const token = "seu_token"; // Hardcoded!

// ✅ Faça assim
const token = localStorage.getItem('auth_token');

// ❌ Não envie em URL
GET /api/data?token=123

// ✅ Envie no header
Authorization: Bearer 123
```

---

## 📝 Changelog de Endpoints

### v1.1 (Março 2026 - Refatorado)
- ✅ `/users/:id/make-admin` - Promover user a admin (refatorado)
- ✅ `/users/:id/remove-admin` - Remover admin do user (refatorado)
- ✨ Privilégios movidos de Player para User
- ✨ Schema refatorado para melhor design

### v1.0 (Março 2026)
- ✅ `/auth/login` - Login
- ✅ `/players` - Listar players
- ✅ `/players/:id` - Obter player
- ✅ `/players/:id/associate-user` - Associar usuário ao player
- ✅ `/players/admins` - Listar admins
- ⏳ `/players/:id/make-admin` - (Refatorado para `/users/:id/make-admin`)
- ⏳ `/players/:id/remove-admin` - (Refatorado para `/users/:id/remove-admin`)

### v1.2 (Planejado)
- ⏳ `/games` - CRUD de partidas
- ⏳ `/games/:id/players` - Adicionar players a partida
- ⏳ `/games/:id/results` - Registrar resultados
- ⏳ `/stats` - Estatísticas de players

---

**Última atualização**: Março 2026  
**Status API**: Operacional 🟢
