# 🗄️ Banco de Dados - Schema e Migrations

## Overview

O projeto usa **PostgreSQL** como banco de dados e **Prisma** como ORM.

### 🔄 Contexto: Port de ASP.NET Core + Entity Framework

Este é um **port de um projeto existente** que anteriormente rodava com:
- **Backend Original**: ASP.NET Core 6+
- **ORM Original**: Entity Framework Core  
- **Frontend Original**: Angular

#### ⚠️ Importante ao Trabalhar com Migrations

A estrutura PostgreSQL foi **importada do EF Core** com todas as tabelas e relacionamentos originais. Ao executar migrations:

1. **NÃO use `prisma migrate reset`** - Isso vai dropar TODAS as tabelas e perder dados!
2. **Use `prisma db push`** - Mais seguro, faz push incremental das mudanças
3. **Sempre backup** do BD antes de migrations críticas
4. **Teste em dev primeiro** antes de aplicar em produção

#### Estrutura do Schema

O arquivo `schema.prisma` contém modelos legados do EF Core (ex: aspnetusers, aspnetroles, etc). Isso é **proposital e esperado**. Estes modelos:
- Mantêm compatibilidade com dados históricos
- Preservam relacionamentos existentes  
- Permitem migração gradual do código

### Arquivos Importantes
- **Schema**: `apps/api/prisma/schema.prisma`
- **Migrations**: `apps/api/prisma/migrations/`
- **Seed**: `apps/api/prisma/seed.ts`

---

## 📊 Schema Prisma (v1.0)

### Identificadores de Dados

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 👤 Modelos Principais

### 1. User (Usuário/Autenticação)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // Hash com bcryptjs
  displayname   String?
  isadmin       Boolean   @default(false)  // ✨ Privilégios administrativos
  
  player        Player?   // Relação 1:1 opcional com Player
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Conceito**: 
- Usuário é a credencial de autenticação
- `isadmin` define privilégios administrativos
- Um user pode ter no máximo 1 player associado

**Campos**:
- `id`: UUID/CUID único
- `email`: Email único para login
- `password`: Hash da senha (nunca armazenar plaintext!)
- `displayname`: Nome do usuário
- `isadmin`: Se tem privilégios de admin ✨ IMPORTANTE
- `createdAt`/`updatedAt`: Auditoria

---

### 2. Player (Jogador)

```prisma
model Player {
  id            BigInt    @id @default(autoincrement())
  name          String
  userid        String?   @unique  // ✨ AGORA OPCIONAL
  isactive      Boolean   @default(false)
  
  user          User?     @relation(fields: [userid], references: [id], onDelete: SetNull)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Conceito Importante**:
- **Todo usuário é um player**, mas **nem todo player tem usuário**
- Razão: Permitir criar players sem login (ex: players convidados)
- Privilégios administrativos estão no User, não no Player
- Player herda privilégios via seu `user` associado

**Campos**:
- `id`: BigInt autoincrement (pode haver muitos players)
- `name`: Nome do jogador
- `userid`: FK para User (OPCIONAL - permite orphaned players)
- `isactive`: Status ativo/inativo
- `user`: Relação na direction de Player → User

**Relacionamento**:
```
User 1 ←→ 1 Player (opcional)
User.isadmin determina privilégios do Player
```

---

### 3. Game (Partida) - [Em Desenvolvimento]

```prisma
model Game {
  id            BigInt    @id @default(autoincrement())
  name          String
  description   String?
  status        String    @default("created") // created, in_progress, finished
  startedAt     DateTime?
  finishedAt    DateTime?
  
  // Participantes
  players       GamePlayer[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model GamePlayer {
  id            BigInt    @id @default(autoincrement())
  gameId        BigInt
  playerId      BigInt
  position      Int?      // Posição na mesa
  result        String?   // 1º, 2º, 3º, etc
  
  game          Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  player        Player    @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  @@unique([gameId, playerId])  // Cada player só pode estar 1x em um game
}
```

---

## 🔄 Migrações

### Histórico

#### Migration 1: `20240301000000_baseline`
- ✅ Criada schema inicial
- ✅ Modelos: User, Player, Games (incompleto)
- ✅ Relacionamentos básicos

#### Migration 2: `20260311000000_move_isadmin_to_users` ⭐ (Refatorado)
- ✅ Move `isadmin` de Player para User
- ✅ Torna `userid` em Player opcional (String → String?)
- ✅ Centraliza privilégios administrativos no User
- ✅ Muda FK para `onDelete: SetNull` para permitir players órfãos
- **Status**: Aplicada em desenvolvimento v1.1

---

## 🛠️ Executar Migrations

### ⚠️ AVISO CRÍTICO: Segurança de Dados

**Este projeto contém dados históricos de um banco de produção**. Ao executar migrations:

```bash
# ❌ NUNCA USE:
bun run prisma migrate reset
# Isso vai DROPAR todas as tabelas e perder todos os dados!

# ✅ USE SEMPRE:
bun run prisma:push
# Faz push seguro e incremental das mudanças
```

### Backup Recomendado

Antes de executar qualquer migration em dados sensíveis:
```bash
# Fazer backup do BD PostgreSQL
pg_dump -U user -h localhost skillers_poker > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Ver Status

```bash
cd apps/api

# Listar todas as migrations
npx prisma migrate status

# Output típico:
# Following migration have not yet been applied:
# - 20240301000000_baseline
# - 20250306100000_add_isadmin_field
```

### Aplicar Todas

```bash
# Método 1: Push (mais rápido, sem arquivo sql)
bun run prisma:push

# Método 2: Deploy (usando arquivos sql)
bun run prisma:migrate
# ou
bun run migrate
```

### Criar Nova Migration

```bash
cd apps/api

# Detectar mudanças no schema.prisma e criar migration
npx prisma migrate dev --name descricao_sua_migracao

# Exemplo:
npx prisma migrate dev --name add_game_status_field
```

Isso:
1. Cria arquivo em `prisma/migrations/[timestamp]_add_game_status_field/`
2. Gera SQL
3. Aplica ao banco
4. Atualiza `prisma/schema.prisma`

### Resetar Banco ⚠️

```bash
cd apps/api

# ATENÇÃO: Deleta TODOS os dados!
bun run prisma migrate reset

# Isso:
# 1. Droppa todas as tabelas
# 2. Reaplicaaplica todas as migrations
# 3. Executa seed.ts
```

---

## 🌱 Seeder - Dados Iniciais

### Arquivo: `apps/api/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar admin user
  const adminUser = await prisma.user.upsert({
    where: { id: '1' },
    update: { isadmin: true },
    create: {
      id: '1',
      email: 'admin@skillers.com',
      password: 'hashed_password_here',
      displayname: 'Admin',
      isadmin: true,
    },
  });

  // Criar admin player
  const adminPlayer = await prisma.player.upsert({
    where: { id: 1n },
    update: { userid: adminUser.id, isactive: true },
    create: {
      id: 1n,
      name: 'Admin Player',
      userid: adminUser.id,
      isactive: true,
    },
  });
  
  console.log('Admin user and player ensured:', { adminUser, adminPlayer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Executar Seed

```bash
cd apps/api

# Executar uma vez
bun run prisma:seed

# Ou durante desenvolvimento:
bun run prisma migrate dev
# (isso automaticamente roda seed ao final)
```

---

## 🔌 Gerar Prisma Client

```bash
cd apps/api

# Gerar tipos e cliente
bun run prisma:generate

# Ou automático quando fazer:
bun run prisma:push
bun run prisma migrate dev
```

Isso regenera:
- `apps/api/generated/prisma/client.d.ts` (tipos)
- `apps/api/generated/prisma/index.js` (runtime)

---

## 📝 Usar Prisma no Código

### Serviço Prisma (Backend)

```typescript
// apps/api/src/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}
```

### Em um Módulo

```typescript
// apps/api/src/players/players.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.player.findMany();
  }

  async findOne(id: bigint) {
    return this.prisma.player.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePlayerDto) {
    return this.prisma.player.create({
      data: {
        name: data.name,
        isactive: data.isactive || false,
      },
    });
  }

  async makeAdmin(id: bigint) {
    return this.prisma.player.update({
      where: { id },
      data: { isadmin: true },
    });
  }
}
```

---

## 🧪 Visualizar Dados

### Prisma Studio (Recomendado)

```bash
cd apps/api
bun prisma studio
```

Abre http://localhost:5555 com interface visual

### pgAdmin

```bash
# Rodar pgAdmin via Docker
docker run --name pgadmin \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -p 5050:80 \
  -d dpage/pgadmin4
```

Acesso: http://localhost:5050

### CLI (psql)

```bash
psql -U user -d skillers_poker -h localhost

-- Ver estrutura da tabela
\d "Player"

-- Ver dados
SELECT * FROM "Player" LIMIT 10;

-- Query específica
SELECT id, name, isadmin FROM "Player" WHERE isadmin = true;

-- Sair
\q
```

---

## 📋 Checklist para Nova Migration

Quando precisar adicionar um novo campo/modelo:

- [ ] Modificar `apps/api/prisma/schema.prisma`
- [ ] Executar: `npx prisma migrate dev --name descricao`
- [ ] Revisar SQL gerado em `prisma/migrations/[timestamp]/migration.sql`
- [ ] Testar localmente
- [ ] Atualizar seed.ts se necessário
- [ ] Executar `bun check-types` para garantir tipos
- [ ] Fazer commit com a nova migration
- [ ] Documentar em `skills/BANCO_DADOS.md`

---

## ⚠️ Melhorias Futuras

- [ ] Implementar `GamePlayer` junction table
- [ ] Adicionar índices de performance
- [ ] Soft deletes (isDeleted boolean)
- [ ] Audit logging (quem criou/modificou)
- [ ] Constraints de business logic no BD

---

## 🔐 Segurança no Banco

### Boas Práticas Implementadas
✅ Senhas com hash (bcryptjs)  
✅ Unique constraints em emails  
✅ Soft relationships com `onDelete: SetNull`  
✅ Definição clara de permissões (isadmin)  

### A Implementar
⏳ Trigger de auditoria  
⏳ Backup automático  
⏳ Encriptação de campos sensíveis  
⏳ Rate limiting em queries  

---

## 📚 Referências

- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Migrations Guide**: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

**Última atualização**: Março 2026  
**Schema Version**: 1.0  
**Migrations**: 2 aplicadas
