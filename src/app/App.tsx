import { useEffect, useState } from 'react'
import { useEventStore } from '../hooks/useEventStore';
import { TimeWindow, useTimeWindow } from '../hooks/useTimeWindow';
import { useEventFilters } from '../hooks/useEventFilters';
import { useCursorPagination } from '../hooks/useCursorPagination';
import { EventTable } from '../components/EventTable/EventTable';

export default function App() {
  const { events, liveMode, toggleLiveMode, size } = useEventStore();

  const [timeWindow, setTimeWindow] = useState<TimeWindow>({
    type: 'LAST_15_MIN'
  })

  const windowedEvents = useTimeWindow(events, timeWindow)

  const {
    filteredEvents,
    filters,
    updateFilters,
    isPending,
    userIdInput,
    setUserIdInput
  } = useEventFilters(windowedEvents)

  /** pagination */
  const {
    page,
    loadMore,
    hasMore,
    reset
  } = useCursorPagination(filteredEvents)

  /**
   * Reset pagination when:
   * - time window changes
   * - filters change
   */
  useEffect(() => {
    reset()
  }, [timeWindow, filters, reset])

  return (
    <div style={{ padding: 16 }}>
      <h2>Event Stream Explorer</h2>

      {/* Live mode toggle */}
      <button onClick={toggleLiveMode}>
        Live Mode: {liveMode ? 'ON' : 'OFF'}
      </button>

      <span style={{ marginLeft: 12 }}>
        In Memory: {size}
      </span>

      <hr />

      {/* Time window controls */}
      <div>
        <strong>Time Window:</strong>{' '}
        <button onClick={() => setTimeWindow({ type: 'LAST_5_MIN' })}>
          5m
        </button>
        <button onClick={() => setTimeWindow({ type: 'LAST_15_MIN' })}>
          15m
        </button>
        <button onClick={() => setTimeWindow({ type: 'LAST_1_HOUR' })}>
          1h
        </button>
      </div>

      <hr />

      {/* Filters */}
      <div>
        <input
          placeholder="Search userId"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
        />

        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={filters.types.has('CLICK')}
            onChange={() =>
              updateFilters((prev) => {
                const next = new Set(prev.types)
                if (next.has('CLICK')) {
                  next.delete('CLICK')
                } else {
                  next.add('CLICK')
                }
                return { ...prev, types: next }
              })
            }
          />
          CLICK
        </label>

        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={filters.types.has('VIEW')}
            onChange={() =>
              updateFilters((prev) => {
                const next = new Set(prev.types)
                if (next.has('VIEW')) {
                  next.delete('VIEW')
                } else {
                  next.add('VIEW')
                }
                return { ...prev, types: next }
              })
            }
          />
          VIEW
        </label>

        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={filters.types.has('PURCHASE')}
            onChange={() =>
              updateFilters((prev) => {
                const next = new Set(prev.types)
                if (next.has('PURCHASE')) {
                  next.delete('PURCHASE')
                } else {
                  next.add('PURCHASE')
                }
                return { ...prev, types: next }
              })
            }
          />
          PURCHASE
        </label>

        {isPending && (
          <span style={{ marginLeft: 8 }}>
            (filtering…)
          </span>
        )}
      </div>

      <hr />

      {/* Event table */}
      <EventTable events={page} />

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isPending}
          style={{ marginTop: 12 }}
        >
          Load More
        </button>
      )}
    </div>
  )
}
