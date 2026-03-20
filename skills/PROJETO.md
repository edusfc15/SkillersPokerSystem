# 🎰 Skillers Poker System - Visão Geral do Projeto

## 📋 Descrição Geral

**Skillers Poker System** é uma **migração/port** de um projeto já existente em **ASP.NET Core + Angular** para **Node.js + React**. A plataforma é completa para gerenciamento de sistemas de poker, construída com uma arquitetura moderna de monorepo. O projeto combina um backend robusto em NestJS com um frontend responsivo em React+Vite.

### 🔄 Contexto: Port de Projeto Legado
- ✅ **Projeto Original**: ASP.NET Core 6+ + Angular  
- ✅ **Nova Stack**: Node.js + NestJS + React + Vite  
- ✅ **Banco de Dados**: PostgreSQL (importado do EF Core com todas as tabelas e dados)  
- ⚠️ **Importante**: Schema Prisma inclui modelos legados do Entity Framework

### Objetivos Principais
- Gerenciar jogadores, usuários e administradores
- Controlar partidas de poker e seus resultados
- Autenticação segura com JWT
- Dashboard administrativo para gerenciamento do sistema
- Manter todas as tabelas e dados existentes durante o port
- Sistema escalável pronto para produção

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Monorepo

```
skillers-poker-system/
├── apps/
│   ├── api/          # Backend em NestJS
│   └── web/          # Frontend em React + Vite
├── packages/
│   ├── tsconfig/     # Configurações TypeScript compartilhadas
│   ├── types/        # Tipos TypeScript compartilhados
│   ├── ui/           # Componentes UI reutilizáveis
│   └── utils/        # Utilitários compartilhados
└── skills/           # Documentação e guias (este arquivo)
```

### Tech Stack

**Backend (API)**
- **Framework**: NestJS 11.x
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma 6.x
- **Autenticação**: JWT + Passport
- **Validação**: Zod com nestjs-zod
- **Formatação**: Biome

**Frontend (Web)**
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Roteamento**: React Router 7
- **Styling**: Tailwind CSS + PostCSS
- **Componentes**: shadcn/ui customizado
- **HTTP Client**: Ky
- **Icons**: Lucide React

**DevOps**
- **Monorepo**: Turbo
- **Package Manager**: Bun 1.2.11
- **TypeScript**: 5.8.3
- **Linting**: Biome + ESLint

---

## 📊 Modelos de Dados

### Entidades Principais

#### Player (Jogador)
```typescript
{
  id: BigInt (PK)
  name: String
  userid: String? (opcional - nem todo player tem user)
  isactive: Boolean (default: false)
  // ... outros campos
}
```

**Conceito Importante**: 
- **Todo usuário é um jogador**, mas **nem todo jogador tem um usuário**
- Apenas **administradores** podem associar usuários a jogadores

#### User (Usuário/Autenticação)
```typescript
{
  id: String (PK - UUID)
  email: String (unique)
  password: String (hashed)
  displayname: String?
  isadmin: Boolean (default: false) // ✨ Privilégios administrativos aqui!
}
```

**Relacionamento**:
- User 1 ←→ 1 Player (opcional)
- User tem privilégios `isadmin`
- O **administrador inicial** é o user com ID "1"

#### User (Autenticação)
- Relacionamento com Player (1:1 opcional)
- Autenticação via JWT
- Hashing de senhas com bcryptjs

#### Game (Partida)
- Rastreamento de partidas
- Associação com players
- Controle de estado da partida

---

## 🚀 Implementado até Agora

### ✅ Port de ASP.NET Core + Angular → NestJS + React
**Status**: Em Progresso (v1.1)

#### Contexto de Migração
- 📊 **Banco de Dados**: Importado com todas as tabelas EF Core originais  
- 🗄️ **Schema Prisma**: Reflete estrutura PostgreSQL existente  
- ⚠️ **Dados**: Todos os dados históricos dos players e games preservados  
- 🔄 **Migrations**: Cuidado necessário para não dropar tabelas/dados  

#### Features Implementadas
1. **Modelo de Dados Corrigido**
   - Campo `isadmin` movido para modelo User (onde deveria estar originalmente)
   - Campo `userid` em Player agora é opcional
   - Privilégios administrativos centralizados no User
   - Relacionamento com `onDelete: SetNull` (permite orphaned players)

2. **Novos Endpoints da API**
   ```
   POST   /players/:playerId/associate-user    # Associar usuário a jogador
   GET    /players/admins                       # Listar administradores
   POST   /players/:playerId/make-admin         # Promover a admin
   DELETE /players/:playerId/remove-admin       # Remover status admin
   ```

3. **Controle de Acesso (Guards)**
   - ✅ Guards de admin implementados
   - ✅ Validações de permissão nos endpoints
   - ✅ Proteção contra múltiplas associações de usuários

4. **Seed Database**
   - Script para inicializar dados
   - Player ID 1 marcado como admin
   - Executável via: `npm run prisma:seed`

#### Mudanças no Banco de Dados
- Migration: `20260311000000_move_isadmin_to_users` ✨ Nova
- Remove campo `isadmin` de Player
- Adiciona campo `isadmin` em User (default: false)
- Torna `userid` em Player opcional (String → String?)
- FK players.userid muda para `onDelete: SetNull`

### ✅ Estrutura Base do Projeto
**Status**: Concluído

#### API
- Autenticação JWT funcionando
- Guard de autenticação ativo
- Estratégia Passport-JWT configurada
- Validação com Zod
- Prisma integrado e configurado

#### Web
- React Router configurado
- Tailwind CSS integrado
- Componentes shadcn/ui prontos
- Cliente HTTP (Ky) configurado
- TypeScript com type-safety

#### Packages Compartilhados
- `@skillers/types` - Tipos TypeScript reutilizáveis
- `@skillers/ui` - Biblioteca de componentes
- `@skillers/utils` - Utilitários comuns
- `@skillers/tsconfig` - Configurações TypeScript

---

## 📚 Guias Rápidos

### Executar o Projeto

**Instalar dependências** (usando Bun)
```bash
bun install
```

**Desenvolvimento** (ambos backend e frontend)
```bash
bun dev
```

**Apenas Backend**
```bash
cd apps/api
bun dev
```

**Apenas Frontend**
```bash
cd apps/web
bun dev
```

### Banco de Dados

**Aplicar migrations**
```bash
cd apps/api
bun run prisma:migrate
```

**Popular dados iniciais**
```bash
cd apps/api
bun run prisma:seed
```

**Gerar Prisma Client**
```bash
cd apps/api
bun run prisma:generate
```

### Linting e Formatação

**Verificar tipos**
```bash
bun check-types
```

**Formatar código**
```bash
bun format
```

**Lint com Biome (API)**
```bash
cd apps/api
bun run lint:fix
```

---

## 🔐 Autenticação

### Fluxo de Login
1. Usuário faz POST `/auth/login` com credenciais
2. API valida e retorna JWT token
3. Frontend armazena token
4. Requisições futuras incluem `Authorization: Bearer <token>`
5. Guards verificam validade do token

### Proteção de Endpoints
Endpoints sensíveis utilizam `@UseGuards(AuthGuard)` ou `AdminGuard`

### Variáveis de Ambiente (API)
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=seu_secret_aqui
JWT_EXPIRATION=24h
```

---

## 📁 Organização de Código

### API (NestJS)
```
src/
├── auth/              # Autenticação e Guards
│   ├── strategies/    # Passport strategies
│   ├── guards/        # AuthGuard, AdminGuard
│   ├── decorators/    # @CurrentUser, etc
│   └── dto/           # DTOs de autenticação
├── games/             # Módulo de partidas
├── common/            # Filters, Interceptors, Pipes
├── app.module.ts      # Módulo raiz
└── main.ts            # Entry point
```

### Web (React)
```
src/
├── components/        # Componentes React
├── pages/             # Páginas da aplicação
├── hooks/             # Custom hooks
├── contexts/          # Context API
├── services/          # Serviços (API calls)
├── types/             # Types locais
├── router/            # Configuração de rotas
└── main.tsx           # Entry point
```

---

## 🧪 Testes

### Executar testes (API)
```bash
cd apps/api
bun test
```

### Testes E2E
```bash
cd apps/api
bun test:e2e
```

### Cobertura
```bash
cd apps/api
bun test:cov
```

---

## 📋 Migrations de Banco de Dados

### Migrations Realizadas
1. **20240301000000_baseline** - Schema inicial do sistema (original)
2. **20250306100000_add_isadmin_field** - Adiciona campo `isadmin` e torna `userid` opcional

### Executar Nova Migration
```bash
cd apps/api
# Criar nova migration detectando mudanças no schema.prisma
bun run prisma:push

# Ou usar migration nomeada
npx prisma migrate dev --name seu_nome_aqui
```

---

## 🎯 Próximos Passos (Roadmap)

### Fase 2: Dashboard Administrativo
- [ ] Interface para gerenciar administradores
- [ ] Visualização de todos os players
- [ ] Controle de acesso por papel
- [ ] Logs de atividades

### Fase 3: Gerenciamento de Partidas
- [ ] Criar/atualizar partidas
- [ ] Rastreamento de resultados
- [ ] Estatísticas de jogadores
- [ ] Histórico de partidas

### Fase 4: Features Avançadas
- [ ] Sistema de notificações
- [ ] Integração com payment (opcional)
- [ ] Relatórios e analytics
- [ ] Export de dados

### Fase 5: DevOps
- [ ] CI/CD Pipeline
- [ ] Docker containerization
- [ ] Deploy automatizado
- [ ] Monitoramento e logs

---

## 📝 Comandos Úteis

### Turbo (Monorepo)
```bash
bun turbo run dev              # Dev em todos os apps
bun turbo run build            # Build em todos os apps
bun turbo run lint             # Lint em todos os apps
bun turbo run check-types      # Type check em todos os apps
```

### Prisma
```bash
bun prisma studio             # Abre interface visual do banco
bun prisma generate           # Gera Prisma Client
bun prisma db push            # Push de schema (sem migration)
```

---

## 🤝 Padrões de Desenvolvimento

### TypeScript
- ✅ Strict mode ativado
- ✅ Tipos compartilhados via `@skillers/types`
- ✅ Non-null assertions reduzidas

### Código Clean
- Padrão NestJS para estrutura
- Componentes funcionais em React
- Separação de concerns

### Naming Conventions
- **API Routes**: kebab-case (`/players/get-admins`)
- **Interfaces**: PascalCase (`IPlayer`)
- **Variables**: camelCase (`playerName`)
- **Files**: kebab-case para componentes (`player-dashboard.tsx`)

---

## 📞 Contato & Suporte

Para dúvidas sobre:
- **Arquitetura**: Consulte este documento
- **API específica**: Veja [ADMIN_SYSTEM.md](../ADMIN_SYSTEM.md)
- **Setup inicial**: Veja os guias rápidos acima

---

**Última atualização**: Março 2026  
**Versão**: 1.0  
**Status**: Development 🚀
