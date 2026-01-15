import { useEffect, useRef, useState, useCallback } from 'react'
import { EventStore } from '../store/eventStore'
import { fetchEvents } from '../services/fetchEvents'
import { subscribeToEvents } from '../services/liveStream'
import { processInChunks } from '../utils/chunkProcessor'
import { Event } from '../types/event'

type UseEventStoreResult = {
  events: readonly Event[]
  liveMode: boolean
  toggleLiveMode: () => void
  size: number
}

export function useEventStore(): UseEventStoreResult {
  /** Single store instance for lifetime of app */
  const storeRef = useRef<EventStore | null>(null)

  /** Buffered events when live mode OFF */
  const bufferedLiveEvents = useRef<Event[]>([])

  /** Render trigger (cheap) */
  const [, forceRender] = useState(0)

  /** Live mode state */
  const [liveMode, setLiveMode] = useState(true)

  // Init store once
  if (!storeRef.current) {
    storeRef.current = new EventStore()
  }

  const store = storeRef.current

  /**
   * Force UI update without passing large arrays through state
   */
  const notify = useCallback(() => {
    forceRender((v) => v + 1)
  }, [])

  /**
   * Load historical events (chunked, non-blocking)
   */
  useEffect(() => {
    let cancelled = false

    fetchEvents().then((events) => {
      if (cancelled) return

      processInChunks(events, {
        chunkSize: 500,
        onChunk(chunk) {
          store.ingestBatch(chunk)
          notify()
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [notify, store])

  /**
   * Subscribe to live stream
   */
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (liveMode) {
        store.ingest(event)
        notify()
      } else {
        bufferedLiveEvents.current.push(event)
      }
    })

    return unsubscribe
  }, [liveMode, notify, store])

  /**
   * Toggle live mode
   * When turning ON → merge buffered events
   */
  const toggleLiveMode = useCallback(() => {
    setLiveMode((prev) => {
      if (!prev) {
        // Merge buffered events when enabling live mode
        store.ingestBatch(bufferedLiveEvents.current)
        bufferedLiveEvents.current = []
        notify()
      }
      return !prev
    })
  }, [notify, store])

  return {
    events: store.getAll().slice(),
    liveMode,
    toggleLiveMode,
    size: store.size()
  }
}
