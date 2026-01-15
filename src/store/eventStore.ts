import type { Event } from '../types/event'
import { binaryInsert } from '../utils/binaryInsert'

const MAX_EVENTS = 5000

export class EventStore {
  // use for unique event
  private map = new Map<string, Event>()
  // use for keeps events in order
  private list: Event[] = []

  // get Only single - single event
  ingest(event: Event) {
    //Duplicate check
    if (this.map.has(event.id)) return

    binaryInsert(this.list, event, event => event.timestamp)
    // set the event for Duplicate check in future
    this.map.set(event.id, event)

    // remove oldest event
    if (this.list.length > MAX_EVENTS) {
      const removed = this.list.pop()
      if (removed) this.map.delete(removed.id)
    }
  }

  // need when merging buffered live multiple events
  ingestBatch(events: Event[]) {
    for (const e of events) this.ingest(e)
  }

  getAll(): readonly Event[] {
    return this.list
  }

  size() {
    return this.list.length
  }

  clear() {
    this.map.clear()
    this.list = []
  }
}
