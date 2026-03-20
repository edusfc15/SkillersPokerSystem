# Skillers Poker Club — Continuação do Desenvolvimento: Design Spec

**Data:** 2026-03-20
**Status:** Aprovado

---

## Contexto

O sistema novo (turbo monorepo: NestJS + React) já tem auth e games funcionando. Este spec cobre as features pendentes em ordem de prioridade, conforme o plano existente.

---

## Ordem de Implementação

| # | Feature | Impacto | Esforço |
|---|---------|---------|---------|
| 1 | Fix Players API — corrigir isadmin para usar tabela `users` | Desbloqueia admin checks | Baixo |
| 2 | Analytics Backend — endpoint de ranking com filtro dinâmico | Feature mais valiosa | Médio |
| 3 | Leaderboard com dados reais — substituir mock na Home | Visibilidade imediata | Baixo |
| 4 | RankingPage completa — tabela mensal Jan-Dez | Feature completa | Médio |
| 5 | Game status CONSOLIDATED | Completude do fluxo | Baixo |
| 6 | Admin features | Gestão do sistema | Médio |

---

## Item 1: Fix Players API

### Problema
O campo `isadmin` está na tabela `users` (já existe no schema Prisma), mas `app.controller.ts` consulta esse campo na tabela `players` (que não possui o campo).

### Fix
Refatorar `isPlayerAdmin()` e `getAdminPlayers()` em `apps/api/src/app.controller.ts` para consultar `users.isadmin`:

```typescript
private async isPlayerAdmin(userId: string): Promise<boolean> {
  const user = await this.prisma.users.findUnique({
    where: { id: userId },
    select: { isadmin: true },
  });
  return user?.isadmin ?? false;
}
```

**Nenhuma migration necessária** — o campo já existe na tabela `users`.

As stats de players (`gamesPlayed`, `totalBuyIn`, `totalCashout`, `totalProfit`) já estão calculadas corretamente e não precisam de alteração.

---

## Item 2: Analytics Backend

### Módulo novo
```
apps/api/src/analytics/
├── analytics.module.ts
├── analytics.controller.ts
└── analytics.service.ts
```

Registrar `AnalyticsModule` em `apps/api/src/app.module.ts`.

### Endpoints

```
GET /analytics/ranking?filter=LAST_GAME|CURRENT_MONTH|CURRENT_YEAR|ALL_TIME
GET /analytics/ranking/monthly?year=2026
GET /analytics/available-years
```

### Shape de retorno — ranking (leaderboard)

```typescript
interface RankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  gamesWithProfit: number;
  winRate: number;        // % jogos com lucro positivo (gamesWithProfit / gamesPlayed * 100)
  totalProfit: number;    // sum(chipstotal) - sum(value), excluindo playerid=0 (Capile)
}

interface RankingResponse {
  filter: string;
  entries: RankingEntry[];
}
```

### Shape de retorno — ranking mensal

```typescript
interface MonthlyRankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  monthly: Record<number, number>; // 1-12 => profit
  yearTotal: number;
  gamesPlayed: number;
}
```

### Lógica de ranking

1. Buscar `gamedetails` de jogos com `status = 'FINISHED'`, filtrando `playerid != 0` (exclui Capile/rake)
2. Aplicar filtro de período:
   - `LAST_GAME`: apenas o jogo FINISHED mais recente (`createddate` desc, limit 1)
   - `CURRENT_MONTH`: `game.createddate` no mês/ano atual
   - `CURRENT_YEAR`: `game.createddate` no ano atual
   - `ALL_TIME`: sem filtro de data
3. Agrupar por jogador: `profit = sum(chipstotal) - sum(value)` por jogo único
4. Calcular `winRate`: contagem de jogos onde profit > 0 / total jogos únicos * 100
5. Ordenar por `totalProfit` desc, atribuir rank

### Lógica mensal (RankingPage)

1. Filtrar jogos FINISHED do ano especificado
2. Agrupar por `(playerId, month)`: somar profit
3. Ordenar por `yearTotal` desc

---

## Item 3: Leaderboard com dados reais

### Arquivo: `apps/web/src/components/leaderboard.tsx`

- Remover todos os `mockData` e `currentUserData`
- Remover card "Your Position" (requer lógica extra não planejada)
- Filtros: `"Último Jogo" | "Mês Atual" | "Ano Atual" | "Sempre"` → mapeiam para `LAST_GAME | CURRENT_MONTH | CURRENT_YEAR | ALL_TIME`
- Ao trocar filtro, faz nova requisição
- Campos exibidos: rank, nome, jogos, lucro total, win rate

### Novo cliente HTTP

`apps/web/src/http/analytics.service.ts` — funções para chamar os endpoints de analytics.

---

## Item 4: RankingPage completa

### Arquivo novo: `apps/web/src/pages/RankingPage.tsx`

- Seletor de ano (carregado via `GET /analytics/available-years`)
- Tabela: `Jogador | Jan | Fev | Mar | Abr | Mai | Jun | Jul | Ago | Set | Out | Nov | Dez | Total`
- Célula colorida: verde se profit > 0, vermelho se < 0, vazio/cinza se não jogou
- Ordenada por total anual desc

### Router: `apps/web/src/router/index.tsx`

Adicionar rota `/app/ranking` apontando para `RankingPage`.

### Header: `apps/web/src/components/header.tsx`

Adicionar link "Ranking" no menu de navegação.

---

## Item 5: Game Status CONSOLIDATED

### Backend

Novo método em `apps/api/src/games/games.service.ts`:
```typescript
async consolidateGame(gameId: string, userId: string): Promise<Game>
```
- Verifica que o jogo existe e tem status `FINISHED`
- Atualiza para `CONSOLIDATED`

Novos endpoints em `apps/api/src/games/games.controller.ts`:
```
PUT /games/:id/consolidate
PUT /games/:id/hands        // atualiza numberOfHands
```

Regra em `createGame`: verificar se já existe jogo `ACTIVE` antes de criar novo (retornar 409 se sim).

**Sem migration** — `status` já é `String` no schema, aceita qualquer valor.

### Frontend

- `apps/web/src/components/games-management.tsx`: badge/tab para status `CONSOLIDATED`
- `apps/web/src/pages/GameDetailPage.tsx`: botão "Consolidar" (visível para admin, só quando `status = FINISHED`) + campo `numberOfHands`

---

## Item 6: Admin Features

### Backend — novos endpoints em `apps/api/src/auth/auth.controller.ts`

```
GET  /auth/users              // lista usuários (admin only)
POST /auth/change-password     // troca própria senha
PUT  /auth/users/:id/role      // atribui/revoga isadmin (admin only)
```

Guards já existem: `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator.

**Nota:** `isadmin` em `users` é o campo de referência. Não usar `players.isadmin`.

### Frontend

- Nova página `apps/web/src/pages/AdminPage.tsx` com rota `/app/admin`
  - Lista de usuários com toggle de role admin
- `apps/web/src/pages/ProfilePage.tsx`: formulário de troca de senha
- `apps/web/src/components/header.tsx`: link "Admin" condicional (só visível se `user.isadmin`)
- Rota `/app/admin` no router

---

## Arquivos Críticos de Referência

- `apps/api/src/games/games.service.ts` — padrão para novos services
- `apps/api/src/games/games.controller.ts` — padrão para novos controllers
- `apps/api/src/app.module.ts` — registrar todos os novos módulos
- `apps/api/prisma/schema.prisma` — nomes de campos, tipos (BigInt), relações
- `apps/web/src/components/leaderboard.tsx` — maior impacto visual imediato
- `apps/web/src/router/index.tsx` — adicionar rotas novas

---

## Constraints Críticas

- **Nunca executar `prisma migrate reset`** — banco populado com dados reais
- **Filtrar `playerid != 0`** em todas as queries de ranking (Capile = rake)
- **`isadmin` está em `users`**, não em `players`
- Novas colunas devem ser nullable ou ter default para não quebrar dados existentes
