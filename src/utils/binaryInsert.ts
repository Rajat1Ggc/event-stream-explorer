export function binaryInsert<T>(
  array: T[],
  item: T,
  getTimestamp: (item: T) => number
) {
  let low = 0
  let high = array.length

  const targetTime = getTimestamp(item)

  while (low < high) {
    // find the middle one
    const mid = Math.floor((low + high) / 2)
    if (getTimestamp(array[mid]) < targetTime) {
      high = mid
    } else {
      low = mid + 1
    }
  }

  array.splice(low, 0, item)
}
