-- Visual Bookmark Library — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── bookmarks ────────────────────────────────────────────────────────
create table if not exists bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  title       text,
  url         text not null,
  image       text,
  tags        text[] default '{}',
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

-- Index for fast user queries
create index if not exists bookmarks_user_id_idx on bookmarks(user_id);
create index if not exists bookmarks_created_at_idx on bookmarks(created_at desc);

-- Full-text search index
create index if not exists bookmarks_search_idx on bookmarks using gin(to_tsvector('english', coalesce(title,'') || ' ' || url));

-- ── groups ────────────────────────────────────────────────────────────
create table if not exists groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

create index if not exists groups_user_id_idx on groups(user_id);

-- ── bookmark_groups ───────────────────────────────────────────────────
create table if not exists bookmark_groups (
  id            uuid primary key default uuid_generate_v4(),
  bookmark_id   uuid not null references bookmarks(id) on delete cascade,
  group_id      uuid not null references groups(id) on delete cascade,
  unique(bookmark_id, group_id)
);

create index if not exists bg_bookmark_id_idx on bookmark_groups(bookmark_id);
create index if not exists bg_group_id_idx on bookmark_groups(group_id);

-- ── Row Level Security ────────────────────────────────────────────────
alter table bookmarks enable row level security;
alter table groups enable row level security;
alter table bookmark_groups enable row level security;

-- Bookmarks: users own their own data
create policy "Users can read own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookmarks"
  on bookmarks for update
  using (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Groups
create policy "Users can read own groups"
  on groups for select
  using (auth.uid() = user_id);

create policy "Users can insert own groups"
  on groups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own groups"
  on groups for update
  using (auth.uid() = user_id);

create policy "Users can delete own groups"
  on groups for delete
  using (auth.uid() = user_id);

-- Bookmark groups (join table) — users can manage if they own the bookmark
create policy "Users can read own bookmark_groups"
  on bookmark_groups for select
  using (
    exists (
      select 1 from bookmarks
      where bookmarks.id = bookmark_groups.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
  );

create policy "Users can insert own bookmark_groups"
  on bookmark_groups for insert
  with check (
    exists (
      select 1 from bookmarks
      where bookmarks.id = bookmark_groups.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
  );

create policy "Users can delete own bookmark_groups"
  on bookmark_groups for delete
  using (
    exists (
      select 1 from bookmarks
      where bookmarks.id = bookmark_groups.bookmark_id
        and bookmarks.user_id = auth.uid()
    )
  );
