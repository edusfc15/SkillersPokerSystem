# ⚙️ Setup Local - Guia Passo a Passo

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** >= 18 (recomendado 20+)
- **Bun** >= 1.2.11 (package manager alternativo a npm/yarn)
- **PostgreSQL** >= 14 (banco de dados)
- **Git** (controle de versão)

### Instalar Bun (se não tiver)
```bash
# Windows (PowerShell)
powershell -c "irm https://bun.sh/install.ps1 | iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

Verificar instalação:
```bash
bun --version  # Deve retornar v1.2.11 ou maior
```

---

## 🚀 Setup Inicial

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/skillers-poker-system.git
cd skillers-poker-system
```

### 2. Instalar Dependências
```bash
bun install
```

Isso instala dependências de:
- Workspace root
- `apps/api`
- `apps/web`
- `packages/*`

### 3. Configurar Variáveis de Ambiente

#### Backend (API) - `apps/api/.env`

Crie arquivo `apps/api/.env`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillers_poker"

# JWT
JWT_SECRET="seu_secret_super_seguro_aqui"
JWT_EXPIRATION="24h"

# Environment
NODE_ENV="development"
APP_PORT=3000
```

**Gerar um bom JWT_SECRET:**
```bash
bun run -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend (Web) - `apps/web/.env` (opcional)

```bash
# API URL
VITE_API_URL=http://localhost:3000/api
```

### 4. Configurar PostgreSQL

#### Contexto: Port de Projeto Legado

⚠️ **Importante**: Este projeto é um **port de um sistema já existente** em ASP.NET Core + Angular. Se você já tem o banco de dados da versão anterior:

1. **O BD será importado com todas as tabelas existentes**
2. **Todos os dados históricos serão preservados**
3. **Não é necessário criar database do zero**
4. **Não execute `prisma migrate reset`** (vai perder dados!)

#### Opção A: PostgreSQL Local (Recomendado)

**Windows (via chocolatey ou installer)**
```bash
# Se usar chocolatey
choco install postgresql

# Ou baixe do: https://www.postgresql.org/download/windows/
```

**macOS**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Opção B: PostgreSQL via Docker

```bash
docker run --name skillers-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=skillers_poker \
  -p 5432:5432 \
  -d postgres:14-alpine
```

#### Criar Banco de Dados

```bash
# Via psql
psql -U postgres
CREATE DATABASE skillers_poker;
\q

# Ou via aplicação gráfica (DBeaver, pgAdmin)
```

### 5. Executar Migrations

```bash
cd apps/api

# ✅ RECOMENDADO: Push seguro (não deleta dados)
bun run prisma:push

# ⚠️ Só se criando do zero:
npx prisma migrate dev --name init

# ❌ NUNCA USE (vai dropar tabelas):
# bun run prisma migrate reset
```

**⚠️ Aviso de Segurança**: Se você tem dados existentes do projeto ASP.NET Core original, use `prisma:push` (seguro) em vez de `migrate reset` (destrutivo).

#### Nota v1.1
A migration `20260311000000_move_isadmin_to_users` move o campo `isadmin` de Player para User (refatoração de design).

### 6. Seed Database (Popular dados iniciais)

```bash
cd apps/api

# Popular dados iniciais
bun run prisma:seed
```

Isso vai:
- Criar player admin com ID 1
- Inicializar dados básicos necessários

### 7. Verificar Setup

```bash
# A partir da raiz do projeto

# Verificar tipos TypeScript
bun check-types

# Verificar linting
cd apps/api && bun lint

# Voltar à raiz
cd ../..
```

---

## 🎮 Executar o Projeto

### Opção 1: Ambos Backend e Frontend (Recomendado)

```bash
# Raiz do projeto
bun dev
```

Acesso:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/api/docs

### Opção 2: Apenas Backend

```bash
cd apps/api
bun dev
```

Backend roda em: http://localhost:3000

### Opção 3: Apenas Frontend

```bash
cd apps/web
bun dev
```

Frontend roda em: http://localhost:5173

### Opção 4: Build para Produção

```bash
# Build ambos
bun build

# Build individual
cd apps/api && bun build    # Gera dist/
cd apps/web && bun build    # Gera dist/
```

---

## 📊 Acessar o Banco de Dados

### Via Prisma Studio (Recomendado)

```bash
cd apps/api
bun prisma studio
```

Abre em: http://localhost:5555

Você pode:
- Visualizar todos os modelos
- Adicionar/editar/deletar registros
- Explorar relacionamentos

### Via pgAdmin (Interface Gráfica)

Instalar pgAdmin:
```bash
# Docker (mais fácil)
docker run --name pgadmin \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -p 5050:80 \
  -d dpage/pgadmin4
```

Acesso: http://localhost:5050

### Via CLI (psql)

```bash
psql -U user -d skillers_poker -h localhost

# Alguns comandos úteis
\dt                      # Listar todas as tabelas
SELECT * FROM "Player";  # Ver todos os players
\q                       # Sair
```

---

## 🧪 Executar Testes

### Unit Tests (API)

```bash
cd apps/api
bun test
```

### Watch Mode (desenvolvimento)

```bash
cd apps/api
bun test:watch
```

### Tests com Cobertura

```bash
cd apps/api
bun test:cov
```

### E2E Tests

```bash
cd apps/api
bun test:e2e
```

---

## 🔍 Verificação e Linting

### TypeScript Type Check

```bash
bun check-types
```

### Formatar Código

```bash
bun format
```

### Linting

```bash
# API (Biome)
cd apps/api && bun lint

# Corrigir automaticamente
cd apps/api && bun lint:fix

# Frontend (ESLint)
cd apps/web && bun lint
```

---

## 🛠️ Troubleshooting

### Problema: "bun: command not found"

**Solução**: Reinstalar Bun
```bash
curl -fsSL https://bun.sh/install | bash
# Reiniciar terminal
```

### Problema: Database connection error

**Verificar**:
```bash
# PostgreSQL está rodando?
psql -U postgres -c "SELECT version();"

# Verificar variável DATABASE_URL em apps/api/.env
# Formato correto: postgresql://user:password@localhost:5432/dbname
```

**Solução**:
```bash
# Se banco não existe, criar:
psql -U postgres
CREATE DATABASE skillers_poker;
\q

# Aplicar migrations
cd apps/api && bun run prisma:push
```

### Problema: "Port 3000 already in use"

**Para Backend**:
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Para Frontend**:
```bash
# Mesmos comandos, trocar porta 3000 por 5173
```

### Problema: "Cannot find module '@skillers/ui'"

**Verificar**:
```bash
# Estar na raiz do projeto
cd skillers-poker-system

# Reinstalar
bun install

# Regenerar symlinks de workspaces
bun run topo
```

### Problema: TypeScript errors em componentes

**Solução**:
```bash
# Regenerar tipos
bun check-types

# Se persistir, limpar cache
rm -rf node_modules/.vite
bun install
```

### Problema: Migrations não aplicam

**Solução**:
```bash
cd apps/api

# ✅ Seguro: Push incremental (NÃO deleta dados)
bun run prisma:push

# ❌ NÃO use se tem dados:
# bun run prisma migrate reset
```

### Problema: "Prisma migrate reset - mas tenho dados"

**Solução**: NUNCA use `migrate reset` em produção ou com dados importantes!

Se realmente precisa fazer reset (dev only):
```bash
cd apps/api

# Backup primeiro!
pg_dump -U user skillers_poker > backup.sql

# Depois reset (vai deletar TUDO!)
bun run prisma migrate reset
```

### Problema: Migrations conflitam com schema legado

**Solução**: O schema `prisma/schema.prisma` contém modelos legados do EF Core. Isso é normal e esperado. Ao adicionar novos modelos:

1. Não delete os modelos legados (começam com `aspnet`, `efmigrations`, etc)
2. Novos modelos vão coexistir com os antigos
3. Use `prisma db push` para aplicar mudanças

### Problema: "ENOENT: no such file or directory"

**Solução**:
```bash
# Limpar tudo e reinstalar
rm -rf node_modules bun.lock
bun install
bun run prisma:generate
```

---

## 📝 Variáveis de Ambiente Completas

### API (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillers_poker"

# Secret para JWT
JWT_SECRET="uma-chave-super-segura-com-muitos-caracteres"

# Tempo de expiração do token
JWT_EXPIRATION="24h"

# Environment
NODE_ENV="development"

# Servidor
APP_PORT=3000
APP_HOST="0.0.0.0"

# CORS (se necessário)
CORS_ORIGIN="http://localhost:5173"
```

### Web (.env)

```bash
# API endpoint
VITE_API_URL=http://localhost:3000/api

# Debug mode
VITE_DEBUG=true
```

---

## 📚 Referências Rápidas

| Tarefa | Comando |
|--------|---------|
| Instalar deps | `bun install` |
| Dev (tudo) | `bun dev` |
| Build (tudo) | `bun build` |
| Type-check | `bun check-types` |
| Formatar | `bun format` |
| Ver banco (UI) | `cd apps/api && bun prisma studio` |
| Popular dados | `cd apps/api && bun run prisma:seed` |
| Rodar testes | `cd apps/api && bun test` |
| Migrations | `cd apps/api && npx prisma migrate dev` |

---

## 🎯 Próximas Etapas

Após setup bem-sucedido:

1. ✅ Setup concluído
2. 📖 Leia [PROJETO.md](./PROJETO.md) para entender a visão geral
3. 🔌 Leia [API_ENDPOINTS.md](./API_ENDPOINTS.md) para conhecer os endpoints
4. 🏗️ Leia [ARQUITETURA.md](./ARQUITETURA.md) antes de começar a codificar

---

## 💡 Dicas

- **Setup rápido**: Use `bun dev` e acesse http://localhost:5173
- **Desenvolvimento iterativo**: Use watch mode (`bun dev`) e salve arquivos para hot reload
- **Debug backend**: Use `nest start --debug` para debug com Node inspector
- **Debug frontend**: Use DevTools do navegador (F12)
- **Resetar banco**: `cd apps/api && bun run prisma migrate reset` (perderá dados!)

---

**Setup concluído? Comece a codificar! 🚀**
