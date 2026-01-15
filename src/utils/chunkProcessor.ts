type ChunkProcessorOptions<T> = {
  chunkSize?: number
  onChunk: (chunk: T[]) => void
  onComplete?: () => void
}

export function processInChunks<T>(
  items: T[],
  {
    chunkSize = 500,
    onChunk,
    onComplete
  }: ChunkProcessorOptions<T>
) {
  let index = 0

  function processNext() {
    if (index >= items.length) {
      onComplete?.()
      return
    }

    const chunk = items.slice(index, index + chunkSize)
    index += chunkSize

    onChunk(chunk)

    // Defer next chunk to keep frame under 16ms
    setTimeout(processNext, 0)
  }

  processNext()
}
