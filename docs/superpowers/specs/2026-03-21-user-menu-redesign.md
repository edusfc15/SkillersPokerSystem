# User Menu Redesign — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** `apps/web/src/components/header.tsx` + new `BottomTabBar` component + `apps/web/src/pages/ProtectedLayout.tsx`

---

## Overview

Redesign the logged-in user menu on both desktop and mobile. Desktop gets a pill trigger and rich profile dropdown. Mobile gets a clean header with avatar-only trigger and a fixed bottom tab bar for navigation.

The navigation links currently embedded in the mobile dropdown (Home, Jogadores, Jogos, Ranking, About) are all removed from the dropdown. Home, Jogadores, Jogos, and Ranking move to the new `BottomTabBar`. The `About` link is removed from mobile entirely (it is accessible on desktop via the navigation menu; no tab slot is allocated for it on mobile).

The desktop `NavigationMenu` (centered nav bar with flyout panels for Jogadores and Jogos) is **unchanged** by this spec.

---

## Desktop

### Trigger

Replace the bare `Avatar` trigger with a pill-shaped button:

- **Layout:** `[Avatar] [First name] [ChevronDown]` — all in a flex row
- **Classes:** `flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors cursor-pointer`
- **Avatar:** `h-6 w-6` (24px), gradient `from-orange-500 to-blue-500`, initials fallback
- **Name:** `text-sm font-medium` — first name only: `user.displayName?.split(' ')[0] || user.username`
- **ChevronDown:** `w-3 h-3 text-muted-foreground`
- **New lucide-react import required:** `ChevronDown` (not currently in `header.tsx`)

### Dropdown card

The `DropdownMenuContent` opens with a profile card at the top, then action items. The order of items is: Perfil → Configurações → Admin (conditional) → separator → Sair.

**Profile card (top section):**
- Wrap in a plain `div` (not `DropdownMenuLabel`) with classes: `bg-gradient-to-br from-orange-500/15 to-blue-500/10 p-3 border-b`
- Content: avatar `h-10 w-10` (40px) + full display name (`text-sm font-semibold`) + email (`text-xs text-muted-foreground`) + admin badge (conditional)
- Admin badge: `inline-flex items-center gap-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mt-1` with a `ShieldCheck` icon at `w-2.5 h-2.5` + "ADMIN" text — only rendered when `user.isadmin === true`

**Action items (below card) — in this order:**

| # | Item | Icon (lucide-react) | Route | Condition |
|---|---|---|---|---|
| 1 | Perfil | `User` | `/app/profile` | always |
| 2 | Configurações | `Settings` | `/app/settings` | always |
| 3 | Admin | `ShieldCheck` | `/app/admin` | `user.isadmin === true` only |
| 4 | _(separator)_ | — | — | always |
| 5 | Sair | `LogOut` | `logout()` + `navigate('/login')` | always (destructive color) |

Admin appears between Configurações and the separator — above Sair. Items 1–3 use `DropdownMenuItem asChild` with `Link`. Item 5 uses `onClick`. Icon size: `w-4 h-4`. Gap between icon and label: `gap-2`.

**Logged-out state:** Keep existing `user === null` branches in the JSX unchanged (Entrar / Cadastrar links on desktop, hamburger menu on mobile). These are unreachable inside `ProtectedLayout` at runtime but should remain for type-safety.

---

## Mobile

### Header

- **Left:** Logo text only (`Skillers Poker System` gradient)
- **Right:** Avatar only — `h-7 w-7` (28px), gradient, initials. No pill, no name text.
- No hamburger button. No navigation links in the header.

### Avatar dropdown (mobile)

Same structure as desktop dropdown but more compact:

**Profile card:**
- Avatar: `h-8 w-8` (32px)
- First name only (no email shown on mobile — space is limited)
- Admin badge: same styling as desktop, conditional on `user.isadmin`

**Action items:** Same 4 items as desktop in the same order (Perfil, Configurações, Admin condicional, separator, Sair). No navigation links in this dropdown.

### Bottom tab bar — new component `BottomTabBar`

New file: `apps/web/src/components/BottomTabBar.tsx`

Fixed bar at the bottom of the viewport. Only rendered on mobile — the component itself carries `md:hidden` so it is invisible on desktop even if placed in the layout.

**Imports:** `useLocation`, `Link` from `react-router-dom`; icons from `lucide-react`.

> Active-state detection uses `useLocation()` + manual comparison instead of `NavLink`, to allow different matching strategies per tab (strict equality for Home, prefix for others).

**Tabs — in order:**

| Tab | Icon | Route | Active condition |
|---|---|---|---|
| Home | `Home` | `/app` | `pathname === '/app'` **(strict equality)** |
| Jogadores | `Users` | `/app/players` | `pathname.startsWith('/app/players')` |
| Jogos | `Gamepad2` | `/app/games` | `pathname.startsWith('/app/games')` |
| Ranking | `Trophy` | `/app/ranking` | `pathname.startsWith('/app/ranking')` |

> **Home uses strict equality**, not `startsWith`, to prevent it from being permanently active on all `/app/*` subroutes.

> **`Users`** (group silhouette icon) is distinct from `User` (single person). It is only needed in `BottomTabBar.tsx` — it does not need to be added to `header.tsx`.

**Active tab:** `text-primary` (orange) for both icon and label
**Inactive tab:** `text-muted-foreground`

**Component className:**
```
fixed bottom-0 left-0 right-0 z-50 h-14 bg-card border-t flex md:hidden
```

**Each tab (rendered as `Link`):**
```
flex-1 flex flex-col items-center justify-center gap-1
```

**Icon:** `w-5 h-5`
**Label:** `text-[10px] font-medium`

---

## ProtectedLayout changes

File: `apps/web/src/pages/ProtectedLayout.tsx`

Three changes:

1. **`<main>` padding:** Add `pb-14 md:pb-0` to prevent content being hidden behind the bottom bar on mobile. Note: `pb-14` intentionally overrides the bottom half of the existing `py-8`; do not remove `py-8`.

2. **`<footer>` visibility:** Add `hidden md:block` to the existing `<footer>` element to prevent it from overlapping the `BottomTabBar` on mobile.

3. **`BottomTabBar` placement:** Render `<BottomTabBar />` after `<footer>`, as the last child of the outer wrapper `div`:

```tsx
<div className="min-h-screen bg-background text-foreground">
  <Header />
  <main className="container mx-auto px-4 py-8 pb-14 md:pb-0">
    <PageTransition><Outlet /></PageTransition>
  </main>
  <footer className="hidden md:block border-t bg-card mt-auto">
    <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
      <p>Skillers Poker Club</p>
    </div>
  </footer>
  <BottomTabBar />
</div>
```

---

## File changes summary

| File | Change |
|---|---|
| `apps/web/src/components/header.tsx` | Desktop: pill trigger + rich dropdown card. Mobile: avatar-only + compact dropdown (nav links removed). New import: `ChevronDown`. |
| `apps/web/src/components/BottomTabBar.tsx` | **New file** — fixed bottom navigation for mobile with `Home`, `Users`, `Gamepad2`, `Trophy` icons |
| `apps/web/src/pages/ProtectedLayout.tsx` | `pb-14 md:pb-0` on `<main>`, `hidden md:block` on `<footer>`, add `<BottomTabBar />` as last child |

---

## Out of scope

- Notification badge on avatar
- User stats in the profile card
- Animation/transition on the bottom bar
- Admin tab in the bottom bar (Admin stays in the avatar dropdown only)
- About page link on mobile (removed; accessible on desktop only)
