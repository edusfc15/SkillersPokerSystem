# 🔄 Port de ASP.NET Core + Angular → NestJS + React

## 📋 Contexto

**Skillers Poker System** é um **port/migração** de um projeto já existente que rodava em:

| Aspecto | Versão Original | Nova Versão |
|--------|-----------------|------------|
| **Backend** | ASP.NET Core 6+ | NestJS 11+ |
| **ORM** | Entity Framework Core | Prisma 6+ |
| **Frontend** | Angular | React 19 + Vite |
| **Banco** | PostgreSQL | PostgreSQL (mesmo BD) |
| **Package Manager** | npm/nuget | Bun 1.2.11 |
| **Arquitetura** | Monolítico | Monorepo |

---

## 🗄️ Banco de Dados - O que Muda?

### ✅ O que é Preservado
- ✅ Toda a estrutura PostgreSQL original (schema, tabelas, índices)
- ✅ Todos os dados históricos (players, games, results, etc)
- ✅ Relacionamentos e constraints
- ✅ Sequences e tipos customizados

### 🔄 O que Muda
- 🔄 ORM: Entity Framework Core → Prisma
- 🔄 Language: C# → TypeScript  
- 🔄 Framework: ASP.NET Core → NestJS
- 🔄 Frontend: Angular → React

### ⚠️ O que NÃO Muda
- 📊 Banco de dados PostgreSQL (mesma instância)
- 🔑 Dados (100% preservados)
- 🗃️ Schema da database (importado como-está)

---

## 📝 Schema Prisma - Modelos Legados

### Modelos Herdados do Entity Framework

O arquivo `prisma/schema.prisma` contém modelos que começam com `aspnet*` ou `ef*`:

```prisma
model aspnetusers { ... }
model aspnetroles { ... }
model aspnetuserclaims { ... }
model aspnetuserroles { ... }
model efmigrationshistory { ... }
// ... mais modelos legados
```

**Isso é PROPOSITAL e ESPERADO!**

#### Por que manter?
1. **Compatibilidade**: Permitem queries ao BD original durante transição
2. **Dados históricos**: Acesso aos dados em ambas as plataformas
3. **Migração gradual**: Não é tudo-ou-nada em um dia
4. **Validação**: Pode-se comparar dados entre sistemas

### Modelos Novos

Novos modelos para o NestJS (ex: Player, Game, etc) convivem com os legados:

```prisma
// Legado (do EF Core original)
model aspnetusers { ... }

// Novo (NestJS)
model users { 
  id String @id @default(cuid())
  email String @unique
  // ... campos específicos da nova versão
}

// Ambos coexistem!
```

---

## 🚨 Migrations - O Cuidado Necessário

### ❌ NUNCA FAÇA

```bash
# ❌ NUNCA!
bun run prisma migrate reset

# Isso vai:
# 1. Dropar TODAS as tabelas
# 2. Apagar TODOS os dados históricos
# 3. Deixar o sistema quebrado
```

### ✅ SEMPRE FAÇA

```bash
# ✅ CORRETO: Push seguro
bun run prisma:push

# Isso vai:
# 1. Fazer push das mudanças do schema.prisma
# 2. Criar novas tabelas/campos
# 3. NÃO deleta dados existentes
```

### 🔄 Fluxo Seguro de Migration

```bash
# Passo 1: Backup (CRÍTICO!)
pg_dump -U user -h localhost skillers_poker > backup_$(date +%Y%m%d_%H%M%S).sql

# Passo 2: Testar em dev
cd apps/api
bun run prisma:push

# Passo 3: Verificar dados
psql -U user skillers_poker -c "SELECT COUNT(*) FROM players;"

# Passo 4: Se tudo OK, aplicar em produção
# (mesmos passos com BD de produção)
```

---

## 📊 Dados - Estratégia de Preservação

### Durante o Port

```timeline
Fase 1: Setup Ambiente
  └─ Novo repo criado
  └─ PostgreSQL preparado
  └─ Schema importado do backup EF Core

Fase 2: Código Backend
  └─ NestJS implementado
  └─ Prisma conectado ao BD existente
  └─ Modelos criados baseado no schema
  └─ Queries testadas contra dados reais

Fase 3: Código Frontend  
  └─ React implementado
  └─ Chamadas HTTP para NestJS
  └─ Dados exibidos do BD original

Fase 4: Testes
  └─ Validar que dados não foram perdidos
  └─ Comparar resultados NestJS vs NET Core
  └─ Performance e integridade
```

### Verificação de Integridade

Após qualquer migration, verificar:

```bash
cd apps/api

# 1. Conectar ao BD
psql -U user skillers_poker

-- 2. Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Verificar dados em tabelas críticas
SELECT COUNT(*) as total_players FROM players;
SELECT COUNT(*) as total_games FROM games;
SELECT COUNT(*) as total_users FROM users;

-- 4. Checar constraints
\d+ players

-- 5. Sair
\q
```

---

## 🎯 Próximas Fases do Port

### Fase 1 (✅ Atual - v1.1)
- ✅ Setup base do monorepo
- ✅ BD PostgreSQL preparado
- ✅ Schema Prisma importado
- ✅ Sistema de administração implementado

### Fase 2 (🔄 Em Progresso)
- 🔄 Dashboard administrativo
- 🔄 API endpoints completos
- 🔄 Validação de dados
- 🔄 Tests automatizados

### Fase 3 (⏳ Planejado)
- ⏳ Gerenciamento de partidas
- ⏳ Reports e estatísticas
- ⏳ Migração completa de funcionalidades
- ⏳ Testes de performance com dados reais

### Fase 4 (⏳ Planejado)
- ⏳ UI/UX updates
- ⏳ Features novas
- ⏳ Documentação final
- ⏳ Deploy em produção

---

## 📋 Checklist de Segurança

Antes de qualquer mudança no BD:

- [ ] Li este documento
- [ ] Entendo o contexto de port/migration
- [ ] Não vou usar `prisma migrate reset` em produção
- [ ] Vou usar `prisma db push` para mudanças incrementais
- [ ] Tenho backup recente do BD
- [ ] Testei a mudança em dev primeiro
- [ ] Verifiquei dados não foram perdidos
- [ ] Documentei a mudança

---

## 🔗 Comandos Úteis Durante Port

```bash
# Backup do BD
pg_dump -U user skillers_poker > backup.sql

# Restaurar de backup
psql -U user skillers_poker < backup.sql

# Connect direto
psql -U user skillers_poker

# Verificar migrations aplicadas
cd apps/api && npx prisma migrate status

# Gerar Prisma Client
cd apps/api && bun run prisma:generate

# Ver dados em Prisma Studio
cd apps/api && bun prisma studio

# Comparar schema com BD
cd apps/api && npx prisma db pull
```

---

## ⚠️ Avisos e Notas

### Aviso 1: Não Delete Modelos Legados
```typescript
// ❌ NÃO DELETA
model aspnetusers { ... }

// Mantenha para compatibilidade durante transição
```

### Aviso 2: SetNull em Foreign Keys
```prisma
// ✅ Seguro: permite dados órfãos
players userid String? @relation(onDelete: SetNull)

// ❌ Perigoso: deleta dados
players userid String @relation(onDelete: Cascade)
```

### Aviso 3: Sempre Incremental
```bash
# ✅ OK
bun run prisma:push

# ❌ NUNCA
bun run prisma migrate reset
```

---

## 📚 Referências

- **Prisma Docs**: https://www.prisma.io/docs/
- **NestJS**: https://docs.nestjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **React**: https://react.dev/
- **Bun**: https://bun.sh/docs

---

## 🤝 Contato

Dúvidas sobre port/migration? Consulte:
- Este documento (PORT_MIGRATION.md)
- [BANCO_DADOS.md](./BANCO_DADOS.md) - Detalhes das migrations
- [SETUP_LOCAL.md](./SETUP_LOCAL.md) - Setup e troubleshooting
- [PROJETO.md](./PROJETO.md) - Visão geral do projeto

---

**Status**: Port em Progresso - v1.1 🚀  
**Data**: Março 2026  
**Dados**: ✅ Preservados e Seguros
