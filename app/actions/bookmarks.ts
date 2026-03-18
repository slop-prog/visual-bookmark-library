"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Bookmark, Group } from "@/lib/types"

// ─── Bookmarks ──────────────────────────────────────────────────────────────

export async function getBookmarks({
  page = 0,
  pageSize = 20,
  search = "",
  tags = [],
}: {
  page?: number
  pageSize?: number
  search?: string
  tags?: string[]
} = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { bookmarks: [], hasMore: false }

  let query = supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (search) {
    query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`)
  }

  if (tags.length > 0) {
    query = query.overlaps("tags", tags)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return {
    bookmarks: (data || []) as Bookmark[],
    hasMore: (data?.length || 0) === pageSize,
  }
}

export async function addBookmark(bookmark: {
  url: string
  title?: string
  image?: string
  tags?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      url: bookmark.url,
      title: bookmark.title || null,
      image: bookmark.image || null,
      tags: bookmark.tags || [],
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return data as Bookmark
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

// ─── Groups ─────────────────────────────────────────────────────────────────

export async function getGroups() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as Group[]
}

export async function createGroup(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("groups")
    .insert({ name, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return data as Group
}

export async function deleteGroup(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

// ─── Bookmark ↔ Group ──────────────────────────────────────────────────────

export async function addBookmarkToGroup(bookmarkId: string, groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if already exists
  const { data: existing } = await supabase
    .from("bookmark_groups")
    .select("id")
    .eq("bookmark_id", bookmarkId)
    .eq("group_id", groupId)
    .single()

  if (existing) return // Already in group

  const { error } = await supabase
    .from("bookmark_groups")
    .insert({ bookmark_id: bookmarkId, group_id: groupId })

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function removeBookmarkFromGroup(bookmarkId: string, groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("bookmark_groups")
    .delete()
    .eq("bookmark_id", bookmarkId)
    .eq("group_id", groupId)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function getBookmarksByGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("bookmark_groups")
    .select("bookmark_id, bookmarks(*)")
    .eq("group_id", groupId)

  if (error) throw new Error(error.message)
  return ((data || []).map((row: any) => row.bookmarks).filter(Boolean)) as Bookmark[]
}
