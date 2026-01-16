import { useCallback, useMemo, useState } from 'react'
import { Event } from '../types/event'

export function useCursorPagination(
  events: readonly Event[],
  pageSize = 50
) {
  const [cursor, setCursor] = useState<string | null>(null)

  //  Current page slice
  const page = useMemo(() => {
    // it show first 50 when cursor null
    if (!cursor) {
      return events.slice(0, pageSize)
    }

    const index = events.findIndex((e) => e.id === cursor)

    // Cursor invalidated (evicted or filtered out)
    if (index === -1) {
      return events.slice(0, pageSize)
    }

    return events.slice(0, index + pageSize + 1)
  }, [events, cursor, pageSize])

  // Load next page
  const loadMore = useCallback(() => {
    if (page.length === 0) return;

    const last = page[page.length - 1]

    setCursor(last.id)
  }, [page])

  const hasMore = page.length < events.length

  const reset = useCallback(() => {
    setCursor(null)
  }, [])

  return {
    page,
    loadMore,
    hasMore,
    reset
  }
}
