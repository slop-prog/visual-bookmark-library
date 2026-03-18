# Visual Bookmark Library

A minimal, visual bookmark manager. Browse saved websites as screenshot cards in an infinite-scroll gallery.

## Stack
- Next.js 15 (App Router) · Tailwind CSS · shadcn/ui
- Supabase (auth + database) · Microlink API · Vercel

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Supabase
1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Enable Email auth (magic link works by default)

### 3. Environment
```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Run
```bash
npm run dev
```

---

## Deploy to Vercel
```bash
npx vercel
```
Add env vars in Vercel → Project Settings → Environment Variables.
Update Supabase → Authentication → URL Configuration with your Vercel domain.

---

## Features
- **Explore tab** — infinite scroll grid, search, tag filtering
- **Bookmark cards** — browser chrome header + Microlink screenshot
- **FAB** — floating "Add bookmark" button with URL + tags form
- **Bookmarklet** — drag "📎 Save to Library" from the header to your bookmarks bar
- **Library tab** — create groups, filter bookmarks by group
- **RLS** — all data is private per user

## Structure
```
app/page.tsx          Main app (Explore + Library tabs)
app/login/page.tsx    Magic link sign-in
app/add/page.tsx      Bookmarklet landing (/add?url=...)
components/
  bookmark-card.tsx   Visual card with screenshot
  bookmark-grid.tsx   Infinite scroll grid
  add-bookmark-modal.tsx
  fab.tsx
  navbar.tsx
supabase/schema.sql   Full schema + RLS policies
```
