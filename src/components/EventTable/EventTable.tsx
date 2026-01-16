import { FixedSizeList, ListChildComponentProps } from 'react-window'
import EventRow from './EventRow'
import type { EventTableProps } from './EventTable.types'
import type { Event } from '../../types/event'

export function EventTable({
  events,
  height = 540,
  rowHeight = 40
}: EventTableProps) {
  return (
    <div style={{ position: 'relative', border: '1px solid #ddd' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          padding: '8px 12px',
          fontWeight: 'bold',
          borderBottom: '1px solid #ddd',
          background: '#fafafa'
        }}
      >
        <div style={{ flex: 2 }}>User Id</div>
        <div style={{ flex: 1 }}>Event</div>
        <div style={{ flex: 2 }}>Time</div>
      </div>

      {/* Virtualized list */}
      <FixedSizeList<Event[]>
        height={height}
        itemCount={events.length}
        itemSize={rowHeight}
        width="100%"
        itemData={events}
      >
        {({ index, style, data }: ListChildComponentProps<Event[]>) => (
          <EventRow
            event={data[index]}
            style={style}
          />
        )}
      </FixedSizeList>
    </div>
  )
}
