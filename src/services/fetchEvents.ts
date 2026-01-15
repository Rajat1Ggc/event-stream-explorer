import { Event } from '../types/event'

const EVENT_TYPES: Event['type'][] = ['CLICK', 'VIEW', 'PURCHASE']

function randomId() {
  return Math.random().toString(36).slice(2)
}

function randomTimestamp() {
  const now = Date.now()
  const last24h = 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * last24h)
}

export async function fetchEvents(
  count = 50000
): Promise<Event[]> {
  const events: Event[] = []

  for (let i = 0; i < count; i++) {
    const id =
      i % 50 === 0 && events.length > 0
        ? events[Math.floor(Math.random() * events.length)].id // for duplicate
        : randomId()

    events.push({
      id,
      timestamp: randomTimestamp(),
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      metadata: {
        source: 'historical'
      }
    })
  }

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500))

  return events
}
