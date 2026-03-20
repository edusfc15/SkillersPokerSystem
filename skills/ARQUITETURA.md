# 🏗️ Arquitetura - Padrões e Estrutura

## Visão Geral da Arquitetura

Skillers Poker System segue uma arquitetura **modular em camadas** com separação clara entre frontend, backend, e código compartilhado.

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)           │
│  (src/components, src/pages, src/hooks)    │
└────────────────┬────────────────────────────┘
                 │ HTTP/REST
                 ↓
┌─────────────────────────────────────────────┐
│         Backend (NestJS + Prisma)           │
│  (src/auth, src/players, src/games, etc)   │
└────────────────┬────────────────────────────┘
                 │ Prisma ORM
                 ↓
┌─────────────────────────────────────────────┐
│     Database (PostgreSQL + Prisma Client)   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│     Shared Code (packages/*/src)            │
│  (@skillers/types, @skillers/ui, etc)      │
└─────────────────────────────────────────────┘
```

---

## 🔙 Backend Architecture (NestJS)

### Estrutura Modular

```
apps/api/src/
├── auth/               # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── decorators/     # @CurrentUser, etc
│   ├── dto/            # LoginDto, RegisterDto
│   ├── guards/         # AuthGuard, AdminGuard
│   ├── interfaces/     # IAuthPayload
│   ├── schemas/        # Zod schemas para validação
│   └── strategies/     # Passport strategies (JWT, etc)
│
├── players/            # Módulo de jogadores
│   ├── players.controller.ts
│   ├── players.module.ts
│   ├── players.service.ts
│   ├── dto/
│   └── entities/
│
├── games/              # Módulo de partidas [em desenvolvimento]
│   ├── games.controller.ts
│   ├── games.module.ts
│   ├── games.service.ts
│   └── dto/
│
├── common/             # Código compartilhado da API
│   ├── exceptions/     # HttpException customizadas
│   ├── filters/        # Exception filters
│   ├── interceptors/   # Request/Response interceptors
│   └── pipes/          # Validation pipes (Zod)
│
├── app.controller.ts   # Controller raiz
├── app.module.ts       # Módulo raiz (imports)
├── app.service.ts      # Serviço raiz
├── main.ts             # Entry point
├── prisma.service.ts   # Serviço Prisma
└── app-config.ts       # Configurações
```

### Fluxo de uma Requisição

```
Request HTTP
    ↓
[Middleware] (CORS, logging, etc)
    ↓
[Rota] → Controller
    ↓
[Guards] (AuthGuard, AdminGuard)
    ↓
[Pipes] (Validação com Zod)
    ↓
[Service] (Lógica de negócio)
    ↓
[Prisma] (Acesso ao banco)
    ↓
Database
    ↓
Response HTTP
```

### Padrão Controller-Service-Repository

#### Controller
```typescript
// players.controller.ts
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Post(':id/make-admin')
  @UseGuards(AuthGuard, AdminGuard)  // Guards
  async makeAdmin(@Param('id') id: string) {
    return this.playersService.makeAdmin(BigInt(id));
  }
}
```

**Responsabilidades**:
- Receber e validar requests
- Aplicar Guards
- Chamar serviço
- Retornar resposta

#### Service
```typescript
// players.service.ts
@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.player.findMany();
  }

  async makeAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Atualizar user para ser admin (não player)
    return this.prisma.user.update({
      where: { id: userId },
      data: { isadmin: true },
    });
  }
}
```

**Responsabilidades**:
- Lógica de negócio
- Validações de regra de negócio
- Orquestração de banco de dados
- Tratamento de erros

#### Data Transfer Objects (DTOs)

```typescript
// dto/create-player.dto.ts
import { z } from 'zod';

export const CreatePlayerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  isactive: z.boolean().default(false),
});

export type CreatePlayerDto = z.infer<typeof CreatePlayerSchema>;
```

**Validação com Zod**:
```typescript
@Post()
@UsePipes(new ZodValidationPipe(CreatePlayerSchema))
create(@Body() dto: CreatePlayerDto) {
  return this.playersService.create(dto);
}
```

### Autenticação & Guards

#### JWT Strategy

```typescript
// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

#### Auth Guard

```typescript
// guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**Uso**:
```typescript
@Get('/profile')
@UseGuards(AuthGuard)
getProfile(@Request() req) {
  return req.user;
}
```

#### Admin Guard

```typescript
// guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    // Buscar user com o userId (agora isadmin está em User)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isadmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

**Uso**:
```typescript
@Post(':id/make-admin')
@UseGuards(AuthGuard, AdminGuard)
makeAdmin(@Param('id') id: string) {
  // Apenas admin (user.isadmin = true) pode chamar
}
```

---

## 🎨 Frontend Architecture (React)

### Estrutura de Componentes

```
apps/web/src/
├── components/         # Componentes reutilizáveis
│   ├── player-card.tsx
│   ├── admin-panel.tsx
│   ├── game-list.tsx
│   └── app-router.tsx  # Router wrapper
│
├── pages/              # Páginas da aplicação
│   ├── home.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   ├── admin.tsx
│   └── 404.tsx
│
├── hooks/              # Custom hooks
│   ├── use-api.ts      # Chamadas HTTP
│   ├── use-auth.ts     # Lógica de autenticação
│   └── use-players.ts  # Lógica de players
│
├── contexts/           # Context API
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── player-context.tsx
│
├── services/           # Serviços de integração
│   ├── api-client.ts
│   ├── auth-service.ts
│   └── players-service.ts
│
├── types/              # Types locais
│   └── index.ts
│
├── router/             # Configuração de rotas
│   └── routes.tsx
│
├── App.tsx             # Componente raiz
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

### Componente Funcional com Hooks

```typescript
// components/player-card.tsx
import { FC } from 'react';
import { Player } from '@skillers/types';

interface PlayerCardProps {
  player: Player;
  onMakeAdmin?: (playerId: string) => void;
}

export const PlayerCard: FC<PlayerCardProps> = ({
  player,
  onMakeAdmin,
}) => {
  const handleClick = () => {
    onMakeAdmin?.(player.id.toString());
  };

  return (
    <div className="card p-4">
      <h3 className="font-bold">{player.name}</h3>
      <p className="text-sm text-gray-600">{player.email}</p>
      
      {player.isadmin && (
        <span className="badge badge-primary">Admin</span>
      )}
      
      {onMakeAdmin && (
        <button
          onClick={handleClick}
          className="btn btn-sm btn-outline mt-2"
        >
          Make Admin
        </button>
      )}
    </div>
  );
};
```

### Custom Hooks

#### useAuth Hook

```typescript
// hooks/use-auth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
```

**Uso em componentes**:
```typescript
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Bem-vindo, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

#### useApi Hook

```typescript
// hooks/use-api.ts
import { useState, useCallback } from 'react';
import ky from 'ky';

interface UseApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export const useApi = (options?: UseApiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(
    async (url: string, options?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await ky(url, {
          prefixUrl: options?.baseUrl || import.meta.env.VITE_API_URL,
          headers: options?.headers,
          ...options,
        }).json();

        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { request, loading, error };
};
```

**Uso**:
```typescript
const PlayerList = () => {
  const { request, loading } = useApi();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    request('/players', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(setPlayers);
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <ul>
      {players.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
};
```

### Context API para Global State

```typescript
// contexts/auth-context.tsx
import { createContext, useState, FC, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Roteamento

```typescript
// router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/home';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';
import { AdminPage } from '../pages/admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute admin><AdminPage /></ProtectedRoute>,
  },
]);
```

---

## 📦 Código Compartilhado (Packages)

### @skillers/types

```typescript
// packages/types/src/index.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  isactive: boolean;
}

export interface Player {
  id: bigint;
  name: string;
  userid?: string;
  isactive: boolean;
  isadmin: boolean;
  createdAt: Date;
}

export interface Game {
  id: bigint;
  name: string;
  status: 'created' | 'in_progress' | 'finished';
  players: Player[];
}
```

**Uso no backend**:
```typescript
import { Player } from '@skillers/types';

// Tipos compartilhados com frontend
```

**Uso no frontend**:
```typescript
import { Player } from '@skillers/types';

const PlayerComponent: FC<{ player: Player }> = ({ player }) => {
  // Type-safe!
};
```

### @skillers/ui

Componentes reutilizáveis (shadcn/ui):
```typescript
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';
export { Select } from './select';
// ... mais componentes
```

### @skillers/utils

Funções utilitárias:
```typescript
// packages/utils/src/styles.ts
export const cn = (...classes: any[]) => {
  // Utility para concatenar classes Tailwind
};

// packages/utils/src/index.ts
export { cn } from './styles';
export { formatDate } from './date';
export { parseError } from './errors';
```

---

## 🔄 Fluxo de Dados

### Login Flow

```
1. Usuário clica "Login"
2. Frontend envia POST /auth/login
3. Backend valida credenciais
4. Backend gera JWT token
5. Frontend armazena token em localStorage
6. Frontend redireciona para dashboard
7. Requisições futuras incluem token no header

Logout:
1. Usuário clica "Logout"
2. Frontend remove token de localStorage
3. Frontend redireciona para login
```

### Make Admin Flow

```
1. Admin clica "Make Admin" em player
2. Frontend POST /players/:id/make-admin com token admin
3. PlayersController recebe requisição
4. AuthGuard valida token
5. AdminGuard verifica se é admin
6. PlayersService.makeAdmin() executa
7. Prisma.player.update() modifica BD
8. Resposta retorna ao frontend
9. Frontend atualiza UI
```

---

## 🧹 Boas Práticas

### Backend

✅ **Fazer**:
- Usar Guards para autenticação/autorização
- Validar com Zod nos DTOs
- Jogar exceções específicas (NotFoundException, etc)
- Usar injeção de dependências
- Manter controllers lean, lógica no service

❌ **Não Fazer**:
- Lógica complexa em controllers
- Queries SQL raw (usar Prisma sempre)
- Expor detalhes de erro ao cliente
- Senhas em logs

### Frontend

✅ **Fazer**:
- Usar TypeScript strict
- Components funcionais com hooks
- Context API para estado global
- Tratar erros gracefully
- Type-safe com types compartilhados

❌ **Não Fazer**:
- Armazenar tokens em localStorage sem cuidado
- Fazer requests sem error handling
- Componentes com lógica complexa (extrair para hooks)
- Any types

---

## 🧪 Testing Strategy

### Backend (Jest)

```typescript
// players.service.spec.ts
describe('PlayersService', () => {
  let service: PlayersService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      player: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new PlayersService(mockPrisma);
  });

  it('should find all players', async () => {
    const players = [{ id: 1, name: 'Player 1' }];
    mockPrisma.player.findMany.mockResolvedValue(players);

    expect(await service.findAll()).toEqual(players);
  });
});
```

### Frontend (Vitest/React Testing Library)

```typescript
// components/player-card.test.tsx
import { render, screen } from '@testing-library/react';
import { PlayerCard } from './player-card';

describe('PlayerCard', () => {
  it('should render player name', () => {
    const player = { id: 1, name: 'John', isadmin: false };
    render(<PlayerCard player={player} />);

    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

---

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pages (Home, Login, Dashboard, Admin)          │   │
│  │  ├─ Components (PlayerCard, GameList, etc)    │   │
│  │  ├─ Hooks (useAuth, useApi, usePlayers)       │   │
│  │  ├─ Contexts (AuthContext, ThemeContext)      │   │
│  │  └─ Router (React Router)                      │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST (ky)
┌────────────────────┴────────────────────────────────────┐
│                Backend (NestJS)                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Controllers (Auth, Players, Games)             │   │
│  │  ├─ Guards (AuthGuard, AdminGuard)            │   │
│  │  ├─ Pipes (ZodValidationPipe)                 │   │
│  │  ├─ Services (AuthService, PlayersService)   │   │
│  │  └─ Prisma (ORM)                              │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ SQL/Prisma
┌────────────────────┴────────────────────────────────────┐
│            Database (PostgreSQL)                        │
│  ├─ Users (autenticação)                              │
│  ├─ Players (jogadores)                               │
│  └─ Games (partidas) [em desenvolvimento]            │
└─────────────────────────────────────────────────────────┘
```

---

**Última atualização**: Março 2026  
**Arquitetura Version**: 1.0
