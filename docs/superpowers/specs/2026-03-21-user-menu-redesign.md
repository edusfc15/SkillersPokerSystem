# User Menu Redesign — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** `apps/web/src/components/header.tsx` + new `BottomTabBar` component

---

## Overview

Redesign the logged-in user menu on both desktop and mobile. Desktop gets a pill trigger and rich profile dropdown. Mobile gets a clean header with avatar-only trigger and a fixed bottom tab bar for navigation.

---

## Desktop

### Trigger

Replace the bare `Avatar` trigger with a pill-shaped button:

- **Layout:** `[Avatar 24px] [First name] [ChevronDown icon]`
- **Styling:** `border`, subtle `bg-card` background, `rounded-full`, hover state (`hover:bg-accent`)
- **Avatar:** 24px, gradient `from-orange-500 to-blue-500`, initials fallback
- First name only (not display name if it's long) — use `user.displayName?.split(' ')[0] || user.username`

### Dropdown card

The `DropdownMenuContent` opens with a profile card at the top, then action items:

**Profile card (top section):**
- Background: `bg-gradient-to-br from-orange-500/15 to-blue-500/10`
- `border-b` separating it from the items below
- Content: avatar 42px + full display name + email + admin badge (conditional)
- Admin badge: small `bg-orange-500 text-white rounded` pill with `ShieldCheck` icon (8px) + "ADMIN" text — only rendered when `user.isadmin === true`

**Action items (below card):**

| Item | Icon (lucide-react) | Condition |
|---|---|---|
| Perfil | `User` | always |
| Configurações | `Settings` | always |
| Admin | `ShieldCheck` | `user.isadmin` only |
| _(separator)_ | — | always |
| Sair | `LogOut` | always (destructive color) |

Items use `DropdownMenuItem asChild` with `Link` for navigation items, `onClick` for logout. Spacing: `gap-2` between icon and label, icons at 14px stroke.

---

## Mobile

### Header

- **Left:** Logo text only (`Skillers Poker System` gradient, or abbreviated `Skillers`)
- **Right:** Avatar only — 28px circle, gradient, initials. No pill, no name text.
- No hamburger. No navigation links in the header.

### Avatar dropdown (mobile)

Same structure as desktop dropdown but more compact:
- Profile card: avatar 30px, first name only, admin badge if applicable
- Same 4 action items (Perfil, Configurações, Admin condicional, Sair)
- No navigation links in this dropdown

### Bottom tab bar — new component `BottomTabBar`

Fixed bar at the bottom of the viewport, only rendered on mobile (`md:hidden`).

**Structure:**
```
[Home] [Jogadores] [Jogos] [Ranking]
```

**Each tab:**
- Icon (Lucide) + label text below
- Active tab: icon and label in `text-primary` (orange)
- Inactive tab: `text-muted-foreground`
- Active detection: `useLocation()` comparing `pathname` prefix

**Icons:**

| Tab | Icon | Route |
|---|---|---|
| Home | `Home` | `/app` (exact) |
| Jogadores | `Users` | `/app/players` |
| Jogos | `Gamepad2` | `/app/games` |
| Ranking | `Trophy` | `/app/ranking` |

**Styling:**
- `fixed bottom-0 left-0 right-0 z-50`
- `bg-card border-t`
- Height: `56px` (`h-14`)
- Each tab: `flex-1 flex flex-col items-center justify-center gap-1`
- Icon size: `w-5 h-5`
- Label: `text-[10px] font-medium`

**Body padding:** `ProtectedLayout` adds `pb-14 md:pb-0` to the `<main>` element so content is never hidden behind the bar.

---

## File changes

| File | Change |
|---|---|
| `apps/web/src/components/header.tsx` | Rewrite desktop trigger to pill; rewrite mobile section to avatar-only + compact dropdown; remove all navigation links from mobile dropdown |
| `apps/web/src/components/BottomTabBar.tsx` | New component — fixed bottom navigation for mobile |
| `apps/web/src/pages/ProtectedLayout.tsx` | Add `pb-14 md:pb-0` to `<main>` |

---

## Out of scope

- Notification badge on avatar
- User stats in the profile card
- Animation/transition on the bottom bar
- Admin tab in the bottom bar (Admin link stays in the avatar dropdown only)
