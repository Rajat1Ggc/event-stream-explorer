import { Event } from '../types/event'

const EVENT_TYPES: Event['type'][] = ['CLICK', 'VIEW', 'PURCHASE']

type Callback = (event: Event) => void

let running = false
let timeoutId: number | undefined

function randomDelay() {
  return 500 + Math.random() * 1000
}

function createEvent(): Event {
  const now = Date.now()

  return {
    id:
      Math.random() < 0.05
        ? 'duplicate-id' // intentional duplicate
        : Math.random().toString(36).slice(2),
    timestamp:
      Math.random() < 0.2
        ? now - Math.floor(Math.random() * 5000) // out-of-order
        : now,
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
    metadata: {
      source: 'live'
    }
  }
}

export function subscribeToEvents(cb: Callback) {
  running = true

  function emit() {
    if (!running) return

    // Burst simulation
    const burst = Math.random() < 0.1 ? 5 : 1

    for (let i = 0; i < burst; i++) {
      cb(createEvent())
    }

    timeoutId = window.setTimeout(emit, randomDelay())
  }

  emit()

  // unsubscribe function
  return () => {
    running = false
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
