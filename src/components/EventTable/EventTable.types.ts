import type { Event } from '../../types/event'

export type EventTableProps = {
  events: readonly Event[]
  isPending?: boolean
  height?: number
  rowHeight?: number
}
