import { memo, type CSSProperties } from 'react'
import type { Event } from '../../types/event'

type Props = {
  event: Event
  style: CSSProperties
}

function EventRow({ event, style }: Props) {
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #eee',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ flex: 2 }}>{event.userId}</div>
      <div style={{ flex: 1 }}>{event.type}</div>
      <div style={{ flex: 2 }}>
        {new Date(event.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default memo(EventRow)
