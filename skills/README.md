# 🛠️ Skills - Guias Técnicos

## 🔄 Port: ASP.NET Core + Angular → NestJS + React

**Skillers Poker System** é um **port de um projeto legado** que rodava em ASP.NET Core + Angular. O banco de dados PostgreSQL é **importado com todas as tabelas e dados originais**.

### ⚠️ Importante!
- O schema Prisma inclui modelos legados do Entity Framework (aspnetusers, aspnetroles, etc)
- **NUNCA use `prisma migrate reset`** - vai perder todos os dados!
- **Use `prisma db push`** - way mais seguro e incremental
- Todos os dados históricos são preservados durante o port

---

## Bem-vindo aos Skills do Skillers Poker System

Este diretório contém guias técnicos especializados para diferentes aspectos do projeto. Use-os como referência ao trabalhar em tarefas específicas.

## 📚 Guias Disponíveis

### 1. **PROJETO.md** - Visão Geral Completa
Comece aqui! Este é o documento principal que descreve:
- Contexto de port de ASP.NET Core → NestJS
- Arquitetura geral do projeto
- Tech stack completo
- Modelos de dados
- Tudo que foi implementado até agora
- Roadmap futuro
- Comandos úteis

**Use quando**: Novo no projeto, precisa entender a visão geral, quer ver o roadmap

### 2. **PORT_MIGRATION.md** - Guia de Port ⭐ LEIA PRIMEIRO
Informações críticas sobre a migração:
- Contexto: ASP.NET Core + Angular → NestJS + React
- Banco de dados: preservação de dados
- ⚠️ **Como fazer migrations SEM perder dados**
- Checklist de segurança
- Modelos legados que permanecem
- Estratégia de transição

**Use quando**: ⭐ LEIA ANTES de qualquer migração do BD!

### 3. **SETUP_LOCAL.md** - Guia de Setup Local
Instruções passo a passo para:
- Instalar dependências
- Configurar variáveis de ambiente
- Executar banco de dados
- ⚠️ **Iniciar o projeto em desenvolvimento (cuidado com dados!)**
- Solucionar problemas comuns

**Use quando**: Fazendo setup inicial, resetando o ambiente, troubleshooting

### 4. **API_ENDPOINTS.md** - Referência de Endpoints
Documentação completa de todos os endpoints:
- Autenticação
- Players
- Games (quando implementado)
- Admin endpoints
- Exemplos de requests/responses
- Códigos de erro

**Use quando**: Desenvolvendo frontend, testando API, integrando endpoints

### 5. **BANCO_DADOS.md** - Migrations e Schema
Guia sobre:
- Schema Prisma completo (inclui modelos legados EF Core)
- Descrição de cada modelo
- Migrations realizadas
- ⚠️ **Como fazer migrations SEM perder dados**
- Scripts de seed

**Use quando**: Modificando modelos, criando novas migrations, entendendo relacionamentos, **antes de executar qualquer migration**!

### 6. **ARQUITETURA.md** - Padrões e Estrutura
Deep dive técnico em:
- Arquitetura NestJS
- Estrutura de componentes React
- Padrões de código
- Como organizar novo código
- Boas práticas

**Use quando**: Implementando novos módulos, criando componentes, refatorando code

---

## 🎯 Como usar os Skills

### Cenário 1: Você é novo no projeto
```
1. Leia PROJETO.md - entenda visão geral
2. Leia SETUP_LOCAL.md - configure seu ambiente
3. Leia API_ENDPOINTS.md - conheça as APIs disponíveis
4. Comece a codificar!
```

### Cenário 2: Precisa adicionar um novo endpoint
```
1. Consulte ARQUITETURA.md - padrões NestJS
2. Consulte BANCO_DADOS.md - se precisar de novos modelos
3. Implemente seguindo os padrões
4. Documente em API_ENDPOINTS.md
```

### Cenário 3: Precisa modificar o banco de dados
```
1. Consulte BANCO_DADOS.md - entenda schema atual
2. Modifique schema.prisma
3. Crie migration: npx prisma migrate dev --name descricao
4. Atualize BANCO_DADOS.md
```

### Cenário 4: Resolvendo um problema
```
1. Procure em SETUP_LOCAL.md → Troubleshooting
2. Se for sobre arquitetura → ARQUITETURA.md
3. Se for sobre dados → BANCO_DADOS.md
4. Se for sobre endpoints → API_ENDPOINTS.md
```

---

## 📋 Checklist para Contribuidores

Antes de fazer commit, verifique:

- [ ] Li os guias relevantes para minha tarefa
- [ ] ⭐ **Se for mexer no BD, li PORT_MIGRATION.md**
- [ ] ⭐ **Não vou usar `prisma migrate reset` em dados existentes**
- [ ] Meu código segue os padrões em ARQUITETURA.md
- [ ] Executei `bun format` e `bun lint` com sucesso
- [ ] Testei funcionalidade localmente
- [ ] Se foi novo endpoint, documentei em API_ENDPOINTS.md
- [ ] Se foi mudança no banco, criei migration com `prisma db push` e atualizei BANCO_DADOS.md
- [ ] Meu código tem type-safety (sem `any`)
- [ ] Dados históricos não foram perdidos

---

## 🔧 Comandos Rápidos

```bash
# Setup inicial
bun install
cd apps/api && bun run prisma:push && cd ../..

# Development
bun dev                          # Ambos backend e frontend

# Verificação
bun check-types                  # TypeScript
bun format                       # Formatar código
cd apps/api && bun lint:fix      # Biome lint

# Database
cd apps/api
bun run prisma:studio           # UI visual do banco
bun run prisma:seed             # Popular dados
bun run prisma:generate         # Gerar cliente

# Testing
cd apps/api && bun test          # Unit tests
```

---

## 📞 Estrutura de Documentação

```
skills/
├── README.md (este arquivo)
├── PROJETO.md              # ⭐ Comece aqui!
├── PORT_MIGRATION.md       # ⭐ LEIA ANTES de migrations!
├── SETUP_LOCAL.md          # Setup e environment
├── API_ENDPOINTS.md        # Docs de endpoints
├── BANCO_DADOS.md          # Schema e migrations
└── ARQUITETURA.md          # Padrões e code structure
```

---

## 🚀 Status do Projeto

- **Versão**: 1.1 (Refatorada)
- **Status**: Development 🚀
- **Última atualização**: Março 2026

### Fases Completadas
✅ Fase 1: Setup base + Sistema de Administração (v1.0)  
✅ Fase 1.1: Refatoração de Privilégios (v1.1)

### Fases em Progresso
🔄 Fase 2: Dashboard Administrativo

### Próximas Fases
⏳ Fase 3: Gerenciamento de Partidas  
⏳ Fase 4: Features Avançadas  
⏳ Fase 5: DevOps

---

## 💡 Tips & Tricks

- **Trabalhar apenas backend?** → `cd apps/api && bun dev`
- **Trabalhar apenas frontend?** → `cd apps/web && bun dev`
- **Visualizar banco?** → `cd apps/api && bun prisma studio`
- **Resetar tudo?** → Delete `node_modules` e `.env`, execute `bun install` novamente
- **Problema com tipos?** → Execute `bun check-types` para ver erros

---

**Bom trabalho! 🎰🚀**
