// src/hooks/useTimeWindow.ts

import { useMemo } from 'react'
import { Event } from '../types/event'

export type TimeWindow =
  | { type: 'LAST_5_MIN' }
  | { type: 'LAST_15_MIN' }
  | { type: 'LAST_1_HOUR' }

function getWindowStart(window: TimeWindow): number {
  const now = Date.now()

  switch (window.type) {
    case 'LAST_5_MIN':
      return now - 5 * 60 * 1000
    case 'LAST_15_MIN':
      return now - 15 * 60 * 1000
    case 'LAST_1_HOUR':
      return now - 60 * 60 * 1000
  }
}

/**
 * Find the index where events fall OUT of the time window
 * Events are sorted DESC by timestamp
 */
function findCutoffIndex(
  events: readonly Event[],
  windowStart: number
): number {
  let low = 0
  let high = events.length

  while (low < high) {
    const mid = (low + high) >>> 1
    if (events[mid].timestamp >= windowStart) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

export function useTimeWindow(
  events: readonly Event[],
  window: TimeWindow
): readonly Event[] {
  return useMemo(() => {
    if (events.length === 0) return events

    // Convert time window to timestamp
    const windowStart = getWindowStart(window)

    // Binary search → O(log n)
    const cutoffIndex = findCutoffIndex(events, windowStart)

    // Slice is cheap
    return events.slice(0, cutoffIndex)
  }, [events, window])
}
