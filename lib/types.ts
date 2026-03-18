export interface Bookmark {
  id: string
  title: string | null
  url: string
  image: string | null
  tags: string[]
  user_id: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface BookmarkGroup {
  id: string
  bookmark_id: string
  group_id: string
}
