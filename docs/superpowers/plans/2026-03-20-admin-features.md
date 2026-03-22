# Admin Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin management features: list users, change password, grant/revoke admin role, and expose `isadmin` in the auth context so the frontend can show/hide admin UI conditionally.

**Architecture:** Add 3 new endpoints to `AuthController` (`GET /auth/users`, `POST /auth/change-password`, `PUT /auth/users/:id/role`). Admin check uses direct `users.isadmin` DB lookup — not `RolesGuard` (which uses JWT roles from ASP.NET Identity, not the `isadmin` boolean). Add `isadmin` to the login/register response so the frontend `AuthUser` context has it. New `AdminPage.tsx`, change-password form in `ProfilePage.tsx`, conditional nav link in `header.tsx`.

**Tech Stack:** NestJS 10, Prisma 6, bcryptjs, React 19, ky (HTTP client), ShadCN/UI, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-20-skillers-continuation-design.md`

**Depends on:** Plan `2026-03-20-analytics-and-players-fix.md` (for the `isPlayerAdmin` pattern in `app.controller.ts`)

---

## File Map

### Backend — Modified
- `apps/api/src/auth/auth.service.ts` — add `isadmin` to login/register response; add `changePassword`, `listUsers`, `setUserRole` methods
- `apps/api/src/auth/auth.controller.ts` — add 3 new endpoints
- `apps/api/src/auth/dto/auth-response.dto.ts` — add `isadmin` field
- `apps/api/src/auth/interfaces/auth.interface.ts` — add `isadmin` to `AuthenticatedUser`

### Frontend — Modified
- `apps/web/src/types/auth.ts` — add `isadmin` to `AuthUser`
- `apps/web/src/http/auth.service.ts` — add `listUsers`, `changePassword`, `setUserRole` methods
- `apps/web/src/components/header.tsx` — conditional "Admin" nav link
- `apps/web/src/pages/ProfilePage.tsx` — add change-password form
- `apps/web/src/router/index.tsx` — add `/app/admin` route

### Frontend — Created
- `apps/web/src/pages/AdminPage.tsx` — user list + role toggle

---

## Task 1: Add `isadmin` to auth response

**Context:** The login/register response currently returns `{ accessToken, user: { id, username, email, displayName, roles } }`. Need to add `isadmin: boolean` so the frontend knows whether the current user is admin without a separate API call.

**Files:**
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/src/auth/dto/auth-response.dto.ts`
- Modify: `apps/api/src/auth/interfaces/auth.interface.ts`

- [ ] **Step 1: Add `isadmin` to `AuthResponseDto`**

Open `apps/api/src/auth/dto/auth-response.dto.ts`. Add `isadmin: boolean` to the user object in the DTO. Follow the existing pattern in that file.

- [ ] **Step 2: Update `auth.service.ts` — `register()` response**

In `register()` (line ~91), the returned `user` object needs `isadmin`. Since a newly registered user is never admin, add:
```typescript
return {
  accessToken,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayname,
    roles,
    isadmin: false, // new users are never admin
  },
};
```

- [ ] **Step 3: Update `auth.service.ts` — `login()` response**

In `login()` (line ~158), include `isadmin` from the DB user:
```typescript
return {
  accessToken,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayname,
    roles,
    isadmin: user.isadmin,  // add this
  },
};
```

- [ ] **Step 4: Update `apps/web/src/types/auth.ts` — add `isadmin` to `AuthUser`**

```typescript
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  emailConfirmed?: boolean;
  isadmin: boolean;  // add this
}
```

- [ ] **Step 5: Test login returns `isadmin`**
```bash
# Start API: cd apps/api && bun run dev
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"your_email","password":"your_pass"}'
```
Expected: Response includes `user.isadmin: true/false`.

- [ ] **Step 6: Commit**
```bash
git add apps/api/src/auth/ apps/web/src/types/auth.ts
git commit -m "feat: include isadmin in auth login/register response"
```

---

## Task 2: Add backend admin endpoints

**Context:** Three new endpoints in `AuthController`. Admin check uses direct DB lookup (`user.isadmin`), not `RolesGuard`.

**Files:**
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/src/auth/auth.controller.ts`

- [ ] **Step 1: Add `listUsers()` to `auth.service.ts`**

Add method to `AuthService`:
```typescript
async listUsers(requestingUserId: string) {
  const requester = await this.prisma.user.findUnique({
    where: { id: requestingUserId },
    select: { isadmin: true },
  });
  if (!requester?.isadmin) {
    throw new ForbiddenException('Admin access required');
  }

  const users = await this.prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      displayname: true,
      isadmin: true,
      createddate: true,
      players: {
        select: { id: true, name: true },
        take: 1,
      },
    },
    orderBy: { createddate: 'desc' },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    displayName: u.displayname,
    isadmin: u.isadmin,
    createddate: u.createddate,
    player: u.players[0] ?? null,
  }));
}
```

Add the `ForbiddenException` import from `@nestjs/common` at the top.

- [ ] **Step 2: Add `changePassword()` to `auth.service.ts`**

```typescript
async changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { passwordhash: true },
  });

  if (!user?.passwordhash) {
    throw new BadRequestException('User not found');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordhash);
  if (!isValid) {
    throw new BadRequestException('Senha atual incorreta');
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      passwordhash: newHash,
      securitystamp: this.generateSecurityStamp(),
      lastmodifieddate: new Date(),
    },
  });

  return { success: true };
}
```

- [ ] **Step 3: Add `setUserRole()` to `auth.service.ts`**

```typescript
async setUserRole(requestingUserId: string, targetUserId: string, isadmin: boolean) {
  const requester = await this.prisma.user.findUnique({
    where: { id: requestingUserId },
    select: { isadmin: true },
  });
  if (!requester?.isadmin) {
    throw new ForbiddenException('Admin access required');
  }

  // Prevent removing admin from self
  if (requestingUserId === targetUserId && !isadmin) {
    throw new BadRequestException('Cannot remove your own admin status');
  }

  const updated = await this.prisma.user.update({
    where: { id: targetUserId },
    data: { isadmin, lastmodifieddate: new Date() },
    select: { id: true, username: true, isadmin: true },
  });

  return { success: true, data: updated };
}
```

- [ ] **Step 4: Add endpoints to `auth.controller.ts`**

Add imports: `Delete, Param, Body, ForbiddenException` from `@nestjs/common`.

Add after existing endpoints:
```typescript
@Get('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'List all users (admin only)' })
async listUsers(@CurrentUser() user: AuthenticatedUser) {
  return this.authService.listUsers(user.id);
}

@Post('change-password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Change current user password' })
async changePassword(
  @CurrentUser() user: AuthenticatedUser,
  @Body() body: { currentPassword: string; newPassword: string },
) {
  return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
}

@Put('users/:id/role')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Set admin role for a user (admin only)' })
async setUserRole(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id') targetId: string,
  @Body() body: { isadmin: boolean },
) {
  return this.authService.setUserRole(user.id, targetId, body.isadmin);
}
```

- [ ] **Step 5: Test endpoints manually**
```bash
# Get token first via login, then:
TOKEN="your_jwt_token"
curl http://localhost:3000/auth/users -H "Authorization: Bearer $TOKEN"
```
Expected: List of users if requester is admin, 403 otherwise.

- [ ] **Step 6: Commit**
```bash
git add apps/api/src/auth/auth.service.ts apps/api/src/auth/auth.controller.ts
git commit -m "feat: add listUsers, changePassword, setUserRole admin endpoints"
```

---

## Task 3: Frontend — auth HTTP service + admin HTTP client

**Files:**
- Modify: `apps/web/src/http/auth.service.ts`
- Modify: `apps/web/src/http/index.ts`

- [ ] **Step 1: Check `apps/web/src/http/auth.service.ts`**

Open the file and review existing methods. Add the following methods to the existing `AuthHttpService` class:

```typescript
async listUsers(): Promise<UserAdminEntry[]> {
  try {
    return await apiClient.get('auth/users').json<UserAdminEntry[]>();
  } catch (error) {
    const message = await extractApiError(error);
    throw new Error(message);
  }
}

async changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await apiClient.post('auth/change-password', {
      json: { currentPassword, newPassword },
    }).json();
  } catch (error) {
    const message = await extractApiError(error);
    throw new Error(message);
  }
}

async setUserRole(userId: string, isadmin: boolean): Promise<void> {
  try {
    await apiClient.put(`auth/users/${userId}/role`, { json: { isadmin } }).json();
  } catch (error) {
    const message = await extractApiError(error);
    throw new Error(message);
  }
}
```

Add the `UserAdminEntry` interface at the top of the file:
```typescript
export interface UserAdminEntry {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string | null;
  isadmin: boolean;
  createddate: string;
  player: { id: string; name: string } | null;
}
```

- [ ] **Step 2: Export new types from `http/index.ts`**

Add `export type { UserAdminEntry } from './auth.service';`

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/http/auth.service.ts apps/web/src/http/index.ts
git commit -m "feat: add admin HTTP methods to auth service client"
```

---

## Task 4: Admin link in header (conditional)

**Context:** `user.isadmin` is now available from `useAuth()`. Add a "Admin" nav link only visible to admins.

**Files:**
- Modify: `apps/web/src/components/header.tsx`

- [ ] **Step 1: Add conditional admin link in `header.tsx`**

Open the file. Import `useAuth` if not already imported. Find the nav links section. Add:
```typescript
const { user } = useAuth();

// In the nav links JSX, add:
{user?.isadmin && (
  <Link to="/app/admin">Admin</Link>
)}
```
Follow the exact same component/style pattern used for other nav links in that file.

- [ ] **Step 2: Commit**
```bash
git add apps/web/src/components/header.tsx
git commit -m "feat: show Admin nav link conditionally for admin users"
```

---

## Task 5: AdminPage

**Files:**
- Create: `apps/web/src/pages/AdminPage.tsx`
- Modify: `apps/web/src/router/index.tsx`

- [ ] **Step 1: Create `AdminPage.tsx`**

```typescript
// apps/web/src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { authHttpService, type UserAdminEntry } from "../http/auth.service";
import { useAuth } from "../contexts/auth-context";

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isadmin) {
      navigate("/app");
      return;
    }
    authHttpService
      .listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const toggleAdmin = async (targetUser: UserAdminEntry) => {
    try {
      await authHttpService.setUserRole(targetUser.id, !targetUser.isadmin);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isadmin: !u.isadmin } : u))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Administração</h1>
        <p className="text-muted-foreground">Gestão de usuários e permissões</p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuários ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
              <div>Usuário</div>
              <div>Email</div>
              <div>Jogador</div>
              <div>Admin</div>
            </div>
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
                <div className="font-medium">{u.displayName || u.username || "—"}</div>
                <div className="text-sm text-muted-foreground">{u.email || "—"}</div>
                <div className="text-sm">{u.player?.name || "—"}</div>
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAdmin(u)}
                    disabled={u.id === user?.id}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      u.isadmin
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {u.isadmin ? "Admin" : "Usuário"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4 p-4">
            {users.map((u) => (
              <div key={u.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.displayName || u.username}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAdmin(u)}
                    disabled={u.id === user?.id}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      u.isadmin ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
                    } disabled:opacity-40`}
                  >
                    {u.isadmin ? "Admin" : "Usuário"}
                  </button>
                </div>
                {u.player && <div className="text-sm text-muted-foreground">Jogador: {u.player.name}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Add route in `router/index.tsx`**

```typescript
import { AdminPage } from "../pages/AdminPage";

// Inside /app children:
{
  path: "admin",
  element: <AdminPage />,
},
```

- [ ] **Step 3: Verify AdminPage in browser**

Login as admin user, navigate to `/app/admin`. Expected: user list with toggle buttons. Non-admin → redirects to `/app`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/src/pages/AdminPage.tsx apps/web/src/router/index.tsx
git commit -m "feat: add AdminPage with user list and role toggle"
```

---

## Task 6: Change password in ProfilePage

**Files:**
- Modify: `apps/web/src/pages/ProfilePage.tsx`

- [ ] **Step 1: Add change-password form to `ProfilePage.tsx`**

Open `apps/web/src/pages/ProfilePage.tsx`. After the existing profile content, add a password change section. Use the existing Card/form pattern in that file:

```typescript
// Add state:
const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
const [pwLoading, setPwLoading] = useState(false);
const [pwError, setPwError] = useState<string | null>(null);
const [pwSuccess, setPwSuccess] = useState(false);

const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  if (pwForm.newPw !== pwForm.confirm) {
    setPwError("As senhas não coincidem");
    return;
  }
  if (pwForm.newPw.length < 6) {
    setPwError("Nova senha deve ter pelo menos 6 caracteres");
    return;
  }
  try {
    setPwLoading(true);
    setPwError(null);
    await authHttpService.changePassword(pwForm.current, pwForm.newPw);
    setPwSuccess(true);
    setPwForm({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSuccess(false), 3000);
  } catch (e) {
    setPwError(e instanceof Error ? e.message : "Erro ao alterar senha");
  } finally {
    setPwLoading(false);
  }
};
```

Add the form JSX in a Card below existing content:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Alterar Senha</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleChangePassword} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Senha Atual</label>
        <input
          type="password"
          value={pwForm.current}
          onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nova Senha</label>
        <input
          type="password"
          value={pwForm.newPw}
          onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirmar Nova Senha</label>
        <input
          type="password"
          value={pwForm.confirm}
          onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
      </div>
      {pwError && <p className="text-sm text-red-500">{pwError}</p>}
      {pwSuccess && <p className="text-sm text-green-500">Senha alterada com sucesso!</p>}
      <button
        type="submit"
        disabled={pwLoading}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {pwLoading ? "Salvando..." : "Alterar Senha"}
      </button>
    </form>
  </CardContent>
</Card>
```

Import `authHttpService` from `../http/auth.service` at the top of the file.

- [ ] **Step 2: Test change password in browser**

Navigate to `/app/profile`. Fill out current password + new password. Expected: success message or error if current password is wrong.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/pages/ProfilePage.tsx
git commit -m "feat: add change-password form to ProfilePage"
```

---

## Verification Checklist

Before calling this complete, verify:

- [ ] `POST /auth/login` — response includes `user.isadmin: boolean`
- [ ] `GET /auth/users` — returns user list for admin, 403 for non-admin
- [ ] `POST /auth/change-password` — updates password, fails with wrong current password
- [ ] `PUT /auth/users/:id/role` — toggles admin, prevents removing own admin
- [ ] `/app/admin` — visible only to admins, redirects non-admins
- [ ] Admin link in header — only visible when logged in as admin
- [ ] Change password form in `/app/profile` — works end-to-end
- [ ] `user.isadmin` persists in localStorage after login (via `auth-context.tsx`)
