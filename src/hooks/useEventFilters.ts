import { useEffect, useMemo, useState, useTransition } from 'react'
import { Event } from '../types/event'

export type EventType = Event['type']

export type Filters = {
  types: Set<EventType>
  userId: string
}

export function useEventFilters(events: readonly Event[]) {
  /** Immediate input state (urgent) */
  const [userIdInput, setUserIdInput] = useState('')

  /** Actual filter state (low priority) */
  const [filters, setFilters] = useState<Filters>({
    types: new Set(),
    userId: ''
  })

  const [isPending, startTransition] = useTransition()

  /**
   * Debounce + transition ONLY the filtering,
   * NOT the input typing
   */
  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => {
        setFilters((prev) => ({
          ...prev,
          userId: userIdInput.trim()
        }))
      })
    }, 300)

    return () => clearTimeout(id)
  }, [userIdInput])

  const filteredEvents = useMemo(() => {
    let result = events

    if (filters.types.size > 0) {
      result = result.filter((e) => filters.types.has(e.type))
    }

    if (filters.userId) {
      result = result.filter((e) =>
        e.userId.includes(filters.userId)
      )
    }

    return result
  }, [events, filters])

  return {
    filteredEvents,
    filters,
    isPending,
    /** expose this for input */
    userIdInput,
    setUserIdInput,
    updateFilters: (updater: (prev: Filters) => Filters) =>
      startTransition(() => setFilters(updater))
  }
}
