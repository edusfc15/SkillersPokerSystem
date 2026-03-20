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
| 1 | Fix Players API — corrigir todos os call sites de isadmin para usar tabela `users` | Desbloqueia admin checks | Baixo |
| 2 | Analytics Backend — endpoint de ranking com filtro dinâmico | Feature mais valiosa | Médio |
| 3 | Leaderboard com dados reais — substituir mock na Home | Visibilidade imediata | Baixo |
| 4 | RankingPage completa — tabela mensal Jan-Dez | Feature completa | Médio |
| 5 | Game status Consolidado | Completude do fluxo | Baixo |
| 6 | Admin features | Gestão do sistema | Médio |

---

## Item 1: Fix Players API

### Problema
O campo `isadmin` está na tabela `users` (já existe no schema Prisma como `isadmin Boolean`), mas `apps/api/src/app.controller.ts` consulta e escreve esse campo na tabela `players` (que não possui o campo). Isso causa erros Prisma em runtime.

### Call sites quebrados — todos precisam ser corrigidos

| Método | Linha aprox. | Problema |
|--------|-------------|---------|
| `isPlayerAdmin()` | ~35 | Lê `players.isadmin` — deve ler `users.isadmin` |
| `getActivePlayers()` | ~69 | Seleciona `isadmin` do model `players` — remover do select ou buscar de `users` |
| `getPlayerDetails()` | ~125 | Seleciona `isadmin` do model `players` — remover do select ou buscar de `users` |
| `getAdminPlayers()` | ~259 | Filtra `players where isadmin=true` — deve filtrar `users where isadmin=true` |
| `associateUserToPlayer()` | ~329 | Seleciona `isadmin` do model `players` no update — remover ou buscar de `users` |
| `makePlayerAdmin()` | ~365 | Escreve `players.isadmin = true` — deve escrever `users.isadmin = true` |
| `removePlayerAdmin()` | ~415 | Escreve `players.isadmin = false` — deve escrever `users.isadmin = false` |

### Fix — `isPlayerAdmin()`
```typescript
private async isPlayerAdmin(userId: string): Promise<boolean> {
  const user = await this.prisma.users.findUnique({
    where: { id: userId },
    select: { isadmin: true },
  });
  return user?.isadmin ?? false;
}
```

### Fix — `getAdminPlayers()`
Deve consultar `users where isadmin = true`, incluindo o `player` associado via `players` relation. **Nota:** a relação `users.players[]` pode retornar múltiplos registros — usar `players[0] ?? null` para o campo `player` no response. Response shape:
```typescript
{
  success: true,
  data: Array<{
    userId: string;
    username: string | null;
    displayname: string | null;
    isadmin: boolean;
    player: { id: string; name: string; imageurl: string | null } | null;
  }>
}
```

### Fix — `makePlayerAdmin()` / `removePlayerAdmin()`
Recebem `playerId` como parâmetro. Precisam:
1. Buscar o `player` pelo `playerId` para obter o `userid` associado
2. Atualizar `users.isadmin` usando esse `userid`
3. Retornar erro 400 se o player não tiver `userid` associado (não está vinculado a nenhum usuário)

**Nenhuma migration necessária** — o campo já existe na tabela `users`.

As stats de players (`gamesPlayed`, `totalBuyIn`, `totalCashout`, `totalProfit`) já estão calculadas corretamente e não precisam de alteração.

---

## Item 2: Analytics Backend

### Padronização de status

O status canônico para jogo finalizado é **`'Encerrado'`** — tanto dados históricos quanto novos jogos usam esse valor.

Mudanças no código necessárias:
- `games.service.ts` — `finishGame()`: alterar `status: 'FINISHED'` → `status: 'Encerrado'`
- `games.service.ts` — `normalizeGameStatus()`: pode ser simplificado ou removido após essa mudança
- `games.service.ts` — `finishGame()` query de busca: remover o filtro `NOT: { status: { in: ['FINISHED', 'Encerrado'] } }` e usar apenas `NOT: { status: 'Encerrado' }`
- Todas as queries analytics filtram: `status: 'Encerrado'`

O status `CONSOLIDATED` (Item 5) seguirá o mesmo padrão: valor em português → **`'Consolidado'`**.

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
  gamesPlayed: number;       // jogos únicos com pelo menos 1 transação
  gamesWithProfit: number;   // jogos onde profit per-game > 0
  winRate: number;           // gamesWithProfit / gamesPlayed * 100
  totalProfit: number;       // sum de profit por jogo (veja fórmula abaixo)
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
  monthly: Record<number, number>; // 1-12 => profit (ausente se não jogou)
  yearTotal: number;
  gamesPlayed: number;
}

// GET /analytics/available-years
interface AvailableYearsResponse {
  years: number[]; // ex: [2026, 2025, 2024] — ordem desc
}
```

### Fórmula de profit

Estrutura de dados em `gamedetails` (filtrado `playerid != 0`):
- Buy-in row: `value = amount + tip`, `chipstotal = 0`
- Cashout row: `value = 0`, `chipstotal = cashout_amount`

**Por jogo, por jogador:**
```
profit_per_game = sum(chipstotal) - sum(value)
```
O `tip` incluído no `value` do buy-in é contabilizado como custo do jogador (correto — é parte do que ele colocou no pote). Isso é intencional.

**Um jogo é "lucrativo" (`gamesWithProfit`) se `profit_per_game > 0`.**

`totalProfit = sum(profit_per_game)` para todos os jogos do jogador no período.

### Lógica de ranking

1. Buscar `gamedetails` de jogos com `status = 'Encerrado'`, filtrando `playerid != 0`
2. Aplicar filtro de período conforme `filter`:
   - `LAST_GAME`: apenas o jogo Encerrado mais recente (por `game.createddate` desc, limit 1)
   - `CURRENT_MONTH`: `game.createddate` no mês/ano atual
   - `CURRENT_YEAR`: `game.createddate` no ano atual
   - `ALL_TIME`: sem filtro de data
3. Agrupar por `(playerId, gameId)`: calcular `profit_per_game`
4. Agrupar por `playerId`: somar totalProfit, contar gamesPlayed e gamesWithProfit
5. Calcular `winRate = gamesWithProfit / gamesPlayed * 100`
6. Ordenar por `totalProfit` desc, atribuir rank sequencial

### Lógica mensal (RankingPage)

1. Filtrar jogos `Encerrado` do ano especificado
2. Agrupar por `(playerId, month)`: somar profit
3. Calcular `yearTotal` e `gamesPlayed` por jogador
4. Ordenar por `yearTotal` desc

---

## Item 3: Leaderboard com dados reais

### Arquivo: `apps/web/src/components/leaderboard.tsx`

**Substituição completa** — remover todo o mock data (`mockData`, `currentUserData`).

Filtros existentes **são substituídos** (não estendidos) pelos novos:
| Label UI | Query param |
|----------|-------------|
| "Último Jogo" | `LAST_GAME` |
| "Mês Atual" | `CURRENT_MONTH` |
| "Ano Atual" | `CURRENT_YEAR` |
| "Sempre" | `ALL_TIME` |

- Ao trocar filtro, faz nova requisição ao `GET /analytics/ranking?filter=...`
- Loading state durante fetch
- Campos exibidos na tabela: rank, nome, jogos, lucro total, win rate
- Remover card "Your Position" (requer lógica extra fora do escopo)

### Novo cliente HTTP

`apps/web/src/http/analytics.service.ts`:
```typescript
getRanking(filter: 'LAST_GAME' | 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'ALL_TIME'): Promise<RankingResponse>
getMonthlyRanking(year: number): Promise<MonthlyRankingEntry[]>
getAvailableYears(): Promise<AvailableYearsResponse>
```

---

## Item 4: RankingPage completa

### Arquivo novo: `apps/web/src/pages/RankingPage.tsx`

- Seletor de ano (carregado via `GET /analytics/available-years`, default = ano mais recente)
- Tabela: `Rank | Jogador | Jan | Fev | Mar | Abr | Mai | Jun | Jul | Ago | Set | Out | Nov | Dez | Total`
- Célula colorida: verde se profit > 0, vermelho se < 0, vazio/cinza se não jogou no mês
- Ordenada por `yearTotal` desc

### Arquivos a alterar

`apps/web/src/router/index.tsx`: adicionar rota `/app/ranking` → `RankingPage`.

`apps/web/src/components/header.tsx`: adicionar link "Ranking" no menu de navegação.

---

## Item 5: Game Status Consolidado

### Backend

**Sem migration de schema** — `status` já é `String`, aceita `'Consolidado'`.

Novo método em `apps/api/src/games/games.service.ts`:
```typescript
async consolidateGame(gameId: string, userId: string): Promise<Game>
// Verifica: jogo existe, status = 'Encerrado'
// Atualiza: status → 'Consolidado'
```

Novos endpoints em `apps/api/src/games/games.controller.ts`:
```
PUT /games/:id/consolidate
PUT /games/:id/hands        // atualiza numberOfHands
```

**Verificação de admin em `consolidateGame`:** usar o mesmo padrão de DB lookup do `app.controller.ts` (não `RolesGuard` — o `RolesGuard` usa `user.roles` do JWT que reflete ASP.NET Identity roles, não `users.isadmin`). Chamar `prisma.users.findUnique({ where: { id: userId }, select: { isadmin: true } })` no service ou controller.

Regra em `createGame`: verificar se já existe jogo com `status = 'ACTIVE'` antes de criar novo. Se sim, retornar 409 Conflict.

### Frontend

- `apps/web/src/components/games-management.tsx`: badge distinto para status `Consolidado` (além de `ACTIVE` e `Encerrado` já existentes)
- `apps/web/src/pages/GameDetailPage.tsx`: botão "Consolidar" visível apenas quando `status = 'Encerrado'` E usuário tem `isadmin = true` + campo `numberOfHands` editável

---

## Item 6: Admin Features

### Backend — novos endpoints em `apps/api/src/auth/auth.controller.ts`

```
GET  /auth/users                // lista usuários (requer isadmin=true via DB lookup)
POST /auth/change-password      // troca própria senha (requer JwtAuthGuard)
PUT  /auth/users/:id/role       // atribui/revoga isadmin (requer isadmin=true via DB lookup)
```

**Admin check:** usar DB lookup (`users.isadmin`) — não `RolesGuard`, pelo mesmo motivo do Item 5.

**DTO para troca de senha:**
```typescript
interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
```
O endpoint verifica a senha atual antes de atualizar (`passwordhash` na tabela `users`). Requer apenas `JwtAuthGuard` (o usuário troca a própria senha).

### Frontend

- Nova página `apps/web/src/pages/AdminPage.tsx` com rota `/app/admin`
  - Lista de usuários (nome, email, isadmin) com toggle para conceder/revogar admin
- `apps/web/src/pages/ProfilePage.tsx`: formulário de troca de senha (campos: senha atual, nova senha, confirmar)
- `apps/web/src/components/header.tsx`: link "Admin" condicional — visível só se `user.isadmin = true` (vem do contexto de auth)
- Rota `/app/admin` no router (protegida — redirecionar para `/app` se não for admin)

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
- **`isadmin` está em `users`**, não em `players` — usar DB lookup, não `RolesGuard`
- Novas colunas devem ser nullable ou ter default para não quebrar dados existentes
- **Admin check pattern**: `prisma.users.findUnique({ where: { id: userId }, select: { isadmin: true } })` — usado em todos os endpoints que exigem admin
