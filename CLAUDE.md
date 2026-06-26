# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Environment

Node.js is installed via **Laragon**, not in the system PATH. Prefix every `npm`/`npx` command with:

```powershell
$env:Path = "C:\laragon\bin\nodejs\node-v22;" + $env:Path
```

## Commands

```powershell
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run lint         # ESLint

npx prisma migrate dev --name <name>   # create and apply a migration
npx prisma generate                    # regenerate client after schema changes
npx prisma db seed                     # run prisma/seed.ts via tsx
```

**Critical:** after every `prisma migrate dev` or manual schema edit, run `npx prisma generate` AND restart the dev server. Turbopack caches the compiled client in `.next/` — a stale cache will cause "Unknown argument" runtime errors even though types look correct. Clear cache with `Remove-Item .next -Recurse -Force`.

## Architecture

Multi-tenant white-label delivery SaaS. Each **Empresa** (tenant) has its own slug, products, orders, and admin user. All business models include `empresaId` for isolation.

### App Router structure

```
src/app/
  admin/
    login/               # public login page (outside route group)
    (protected)/         # route group — shares admin layout + auth guard
      layout.tsx         # checks session, renders Sidebar
      pedidos/           # kanban order board
      produtos/          # product CRUD
      categorias/        # category CRUD
      configuracoes/     # store settings (data, images, hours)
  loja/[slug]/           # public customer storefront
  api/
    auth/[...nextauth]/  # NextAuth handler
    upload/              # image upload → public/uploads/
    pedidos/             # creates Pedido + ItemPedido records
```

### Auth (NextAuth v5 / Auth.js)

- Config in `src/auth.ts` — Credentials provider, JWT strategy
- `empresaId` and `empresaNome` are added to token/session via callbacks
- Types extended in `src/types/next-auth.d.ts`
- **Route protection lives in `src/proxy.ts`** (not `middleware.ts` — Next.js 16 renamed the file)
- All protected pages call `auth()` from `@/auth` to get the session

### Prisma 7 (breaking changes)

- `datasource db` block in `schema.prisma` has **no `url` field** — URL lives only in `prisma.config.ts` (for CLI) and `src/lib/prisma.ts` (for runtime via `pg` Pool)
- Runtime requires the driver adapter: `PrismaPg` from `@prisma/adapter-pg` wrapping a `pg.Pool`
- Singleton client is in `src/lib/prisma.ts`
- Generated client output: `src/generated/prisma` (imported as `@/generated/prisma`)
- Seed uses relative imports (`../src/generated/prisma`) not `@/` aliases — `tsx` doesn't resolve path aliases

### Tailwind CSS v4

No `tailwind.config.ts`. Styles are configured via:
```css
@import "tailwindcss";   /* in src/app/globals.css */
```

### Server Actions + Client Components pattern

Server Actions are defined in `actions.ts` files co-located with their route. A critical constraint: **`<input type="hidden">` values set via React state are not serialized correctly when a form uses `action={serverAction}` and contains Client Components**. The workaround used throughout this project:

- Create a Client Component wrapper (e.g. `ImagensForm.tsx`)
- Manage state internally
- Call the server action directly: `await salvarImagens(fd)` inside `useTransition`
- Do NOT use `<form action={serverAction}>` when child Client Components hold the data

### ImageUpload component

`src/app/admin/(protected)/_components/ImageUpload.tsx` — uploads to `/api/upload`, supports `variant: "square" | "banner"`. Accepts optional `onUrlChange` callback so parent Client Components can track the URL in their own state.

### Public storefront (`/loja/[slug]`)

`src/app/loja/[slug]/page.tsx` — Server Component that fetches empresa + categories + active products, serializes `Decimal` fields to `string`, passes to `Vitrine.tsx`.

`Vitrine.tsx` is a single Client Component handling:
- Cart state persisted in `localStorage` under key `carrinho_{slug}`
- Slide-over cart panel with quantity controls
- Checkout: nome, entrega/retirada toggle, structured address (CEP auto-fill via ViaCEP public API), payment method, notes
- On submit: POST to `/api/pedidos` (saves to DB) then opens `wa.me` link to empresa's WhatsApp

### WhatsApp order flow

Orders are finalized client-side: the `/api/pedidos` route saves the record, then the browser opens a `wa.me` deep link with the formatted order as URL-encoded text. No payment gateway.
