export type EventType = 'CLICK' | 'VIEW' | 'PURCHASE'

export type Event = {
  id: string
  timestamp: number
  userId: string
  type: EventType
  metadata: Record<string, any>
}
