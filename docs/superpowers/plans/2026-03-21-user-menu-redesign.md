# User Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the logged-in user menu — desktop gets a pill trigger + rich profile dropdown, mobile gets an avatar-only header + fixed bottom tab bar for navigation.

**Architecture:** Three isolated changes: (1) new `BottomTabBar` component, (2) rewrite `header.tsx` desktop and mobile sections, (3) update `ProtectedLayout` to integrate the tab bar. Each task produces a working, committable state.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, ShadCN/UI (`@skillers/ui`), lucide-react, react-router-dom, Bun

**Spec:** `docs/superpowers/specs/2026-03-21-user-menu-redesign.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/components/BottomTabBar.tsx` | **Create** | Fixed bottom navigation bar for mobile — 4 tabs with active-state detection |
| `apps/web/src/components/header.tsx` | **Modify** | Desktop: pill trigger + profile card dropdown. Mobile: avatar-only + compact dropdown without nav links |
| `apps/web/src/pages/ProtectedLayout.tsx` | **Modify** | Integrate `BottomTabBar`, adjust `<main>` padding, hide `<footer>` on mobile |

---

## Task 1: Create BottomTabBar component

**Files:**
- Create: `apps/web/src/components/BottomTabBar.tsx`

- [ ] **Step 1: Create the file with complete implementation**

Write `apps/web/src/components/BottomTabBar.tsx` with this exact content:

```tsx
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Home, Trophy, Users } from "lucide-react";

const TABS = [
	{
		label: "Home",
		icon: Home,
		href: "/app",
		isActive: (pathname: string) => pathname === "/app",
	},
	{
		label: "Jogadores",
		icon: Users,
		href: "/app/players",
		isActive: (pathname: string) => pathname.startsWith("/app/players"),
	},
	{
		label: "Jogos",
		icon: Gamepad2,
		href: "/app/games",
		isActive: (pathname: string) => pathname.startsWith("/app/games"),
	},
	{
		label: "Ranking",
		icon: Trophy,
		href: "/app/ranking",
		isActive: (pathname: string) => pathname.startsWith("/app/ranking"),
	},
] as const;

export function BottomTabBar() {
	const { pathname } = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-card border-t flex md:hidden">
			{TABS.map(({ label, icon: Icon, href, isActive }) => {
				const active = isActive(pathname);
				return (
					<Link
						key={href}
						to={href}
						className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
							active ? "text-primary" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Icon className="w-5 h-5" />
						<span className="text-[10px] font-medium">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
```

> **Note on active-state logic:** Home uses `pathname === '/app'` (strict equality) — NOT `startsWith` — to prevent it from lighting up on every `/app/*` subroute. All other tabs use `startsWith`.

- [ ] **Step 2: Verify the file builds without errors**

```bash
cd apps/web
bun run tsc --noEmit 2>&1 | head -30
```

Expected: no errors referencing `BottomTabBar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/BottomTabBar.tsx
git commit -m "feat: add BottomTabBar component for mobile navigation"
```

---

## Task 2: Update ProtectedLayout

**Files:**
- Modify: `apps/web/src/pages/ProtectedLayout.tsx`

This task has a hard dependency on Task 1 — `BottomTabBar.tsx` must exist before `ProtectedLayout.tsx` can compile. Do this before the header rewrite so manual testing is also possible once you start the dev server.

- [ ] **Step 1: Read the current file**

Read `apps/web/src/pages/ProtectedLayout.tsx`. Current content:

```tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Header } from "../components/header";
import { PageTransition } from "../components/page-transition";

export function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  // ... loading + redirect guards ...
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PageTransition><Outlet /></PageTransition>
      </main>
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Skillers Poker Club</p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Apply four changes to the file**

1. Add `import { BottomTabBar } from "../components/BottomTabBar";` at the top.
2. Change `<main className="container mx-auto px-4 py-8">` → `<main className="container mx-auto px-4 py-8 pb-14 md:pb-0">` (`pb-14` intentionally overrides the bottom half of `py-8`; keep `py-8`).
3. Change `<footer className="border-t bg-card mt-auto">` → `<footer className="hidden md:block border-t bg-card mt-auto">`.
4. Add `<BottomTabBar />` as the last child inside the outer `div`, after `</footer>`.

Result:

```tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Header } from "../components/header";
import { PageTransition } from "../components/page-transition";
import { BottomTabBar } from "../components/BottomTabBar";

export function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-14 md:pb-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="hidden md:block border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Skillers Poker Club</p>
        </div>
      </footer>
      <BottomTabBar />
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd apps/web
bun run tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/ProtectedLayout.tsx
git commit -m "feat: integrate BottomTabBar into ProtectedLayout"
```

---

## Task 3: Rewrite header.tsx

**Files:**
- Modify: `apps/web/src/components/header.tsx`

This is the largest change. The desktop `NavigationMenu` (centered flyout nav) is **unchanged** — only the trigger area and the user dropdown change. The mobile section is fully rewritten: avatar-only trigger, compact profile dropdown with no nav links.

- [ ] **Step 1: Read the current header.tsx**

Read `apps/web/src/components/header.tsx` in full so you know exactly what to preserve (desktop NavigationMenu) vs. replace (triggers, dropdowns).

- [ ] **Step 2: Update imports**

Change the lucide-react import line to add `ChevronDown` and remove `Menu` (no longer needed — the logged-out mobile hamburger can keep it, so check if it's used in the logged-out branch; if so, keep it):

```tsx
import { ChevronDown, Home, Info, LogOut, Menu, Settings, ShieldCheck, User } from "lucide-react";
```

> `ChevronDown` is new (pill trigger). `Menu` stays (logged-out mobile hamburger). `Home` and `Info` stay (logged-out mobile hamburger — Home link and About link). `Gamepad2` and `Trophy` are **removed** — they were only used in the mobile nav links that are being deleted in this task.

> **Preserve logged-out branch:** The desktop `user === null` branch that renders Entrar/Cadastrar links is **untouched**. Do not modify it — it is unreachable inside `ProtectedLayout` at runtime but must stay for type-safety.
>
> The outer structure of the desktop section is: `{user ? ( <DropdownMenu>…pill trigger…dropdown content…</DropdownMenu> ) : ( <div>…Entrar…Cadastrar…</div> )}`. Steps 3 and 4 only replace the contents of the `user ? (…)` branch. The `: (…)` branch stays exactly as you found it in Step 1.

- [ ] **Step 3: Replace the desktop DropdownMenuTrigger (pill)**

Find the existing desktop trigger section. It currently looks like:
```tsx
<DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors">
  <Avatar className="h-8 w-8">
    ...
  </Avatar>
  <div className="hidden lg:flex flex-col items-start">
    ...
  </div>
</DropdownMenuTrigger>
```

Replace with the pill trigger:

```tsx
<DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors cursor-pointer">
  <Avatar className="h-6 w-6">
    <AvatarImage
      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
      alt={user.displayName || user.username}
    />
    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
      {getUserInitials(user.displayName, user.username)}
    </AvatarFallback>
  </Avatar>
  <span className="text-sm font-medium">
    {user.displayName?.split(" ")[0] || user.username}
  </span>
  <ChevronDown className="w-3 h-3 text-muted-foreground" />
</DropdownMenuTrigger>
```

- [ ] **Step 4: Replace the desktop DropdownMenuContent (profile card + items)**

Find the existing `<DropdownMenuContent align="end" className="w-56">` block. Replace the entire content (keeping the outer `DropdownMenuContent` tag but replacing everything inside) with:

```tsx
<DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
  {/* Profile card */}
  <div className="bg-gradient-to-br from-orange-500/15 to-blue-500/10 p-3 border-b">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
          alt={user.displayName || user.username}
        />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getUserInitials(user.displayName, user.username)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold truncate">
          {user.displayName || user.username}
        </span>
        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        {user.isadmin && (
          <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 w-fit">
            <ShieldCheck className="w-2.5 h-2.5" />
            ADMIN
          </span>
        )}
      </div>
    </div>
  </div>
  {/* Action items */}
  <div className="p-1">
    <DropdownMenuItem asChild>
      <Link to="/app/profile" className="flex items-center gap-2">
        <User className="w-4 h-4" />
        Perfil
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link to="/app/settings" className="flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Configurações
      </Link>
    </DropdownMenuItem>
    {user.isadmin && (
      <DropdownMenuItem asChild>
        <Link to="/app/admin" className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Admin
        </Link>
      </DropdownMenuItem>
    )}
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={handleLogout}
      className="text-destructive focus:text-destructive flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </DropdownMenuItem>
  </div>
</DropdownMenuContent>
```

- [ ] **Step 5: Rewrite the mobile logged-in section**

Find the mobile `{user ? ( <DropdownMenu>...</DropdownMenu> ) : (...)}` block. The trigger stays as just an avatar (28px). Replace the entire content of the mobile `DropdownMenuContent` with the compact profile card + action items (no nav links).

> **Trigger class change is intentional:** The mobile trigger changes from `p-1 flex items-center gap-2` to `p-0.5 rounded-full hover:bg-accent transition-colors`. The flex row is removed because there is no name text or chevron on mobile — just the avatar.

> **Logged-out mobile hamburger is untouched:** The `user === null` branch that renders the hamburger `<Menu />` trigger with Entrar/Cadastrar items must stay exactly as-is. Only the `user ? (...)` branch is rewritten.

```tsx
{/* Mobile layout */}
<div className="md:hidden flex items-center justify-between">
  {/* Logo */}
  <Link to="/app" className="flex items-center">
    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-poker-orange to-poker-blue">
      Skillers Poker System
    </h1>
  </Link>

  <div className="flex items-center gap-2">
    <ThemeSwitcher />

    {user ? (
      <DropdownMenu>
        <DropdownMenuTrigger className="p-0.5 rounded-full hover:bg-accent transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
              alt={user.displayName || user.username}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
              {getUserInitials(user.displayName, user.username)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-0 overflow-hidden">
          {/* Profile card (compact — no email on mobile) */}
          <div className="bg-gradient-to-br from-orange-500/15 to-blue-500/10 p-3 border-b">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
                  alt={user.displayName || user.username}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials(user.displayName, user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {user.displayName?.split(" ")[0] || user.username}
                </span>
                {user.isadmin && (
                  <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 w-fit">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Action items */}
          <div className="p-1">
            <DropdownMenuItem asChild>
              <Link to="/app/profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            {user.isadmin && (
              <DropdownMenuItem asChild>
                <Link to="/app/admin" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      /* Logged-out mobile: keep existing hamburger EXACTLY as-is — do not modify */
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 hover:bg-accent rounded-md transition-colors">
          <Menu className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/" className="flex items-center">
              <Info className="w-4 h-4 mr-2" />
              About
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/login" className="flex items-center">
              Entrar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/register" className="flex items-center text-primary">
              Cadastrar
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
</div>
```

- [ ] **Step 6: TypeScript check**

```bash
cd apps/web
bun run tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `header.tsx`.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/header.tsx
git commit -m "feat: redesign user menu — pill trigger, profile card, mobile cleanup"
```

---

## Task 4: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
# In one terminal (API):
cd apps/api
PATH="/c/Program Files/nodejs:$PATH" /c/Users/edusf/.bun/bin/bun run start:dev

# In another terminal (Web):
cd apps/web
/c/Users/edusf/.bun/bin/bun run dev
```

- [ ] **Step 2: Verify desktop (window > 768px)**

Open `http://localhost:5173` and log in.

Check:
- [ ] Header shows pill trigger: avatar + first name + chevron
- [ ] Clicking pill opens dropdown with gradient profile card at top
- [ ] Profile card shows full name, email, admin badge (if admin)
- [ ] Items in order: Perfil, Configurações, Admin (if admin), separator, Sair
- [ ] Admin item only visible when user.isadmin is true
- [ ] NavigationMenu (centered nav) is unchanged
- [ ] Bottom tab bar is NOT visible on desktop

- [ ] **Step 3: Verify mobile (resize to < 768px or DevTools)**

- [ ] Header shows logo + avatar (no pill, no name text)
- [ ] Tapping avatar opens compact dropdown: profile card (first name + badge, no email) + action items
- [ ] No navigation links in the mobile dropdown
- [ ] Bottom tab bar visible with 4 tabs: Home, Jogadores, Jogos, Ranking
- [ ] Active tab highlighted in orange based on current route
- [ ] Home tab is only active on `/app`, not on `/app/players` etc.
- [ ] Page content is not hidden behind the bottom bar
- [ ] Footer is hidden on mobile

- [ ] **Step 4: Final commit (if any adjustments were made)**

```bash
git add -A
git commit -m "fix: adjust user menu styling after visual verification"
```
