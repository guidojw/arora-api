export function getDate (date: Date): string {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  return `${day}-${month + 1}-${year}`
}

export function getTime (date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours}:${'0'.repeat(2 - String(minutes).length)}${minutes}`
}

export function getTimeZoneAbbreviation (date: Date): string {
  return date.toLocaleTimeString('en-us', { hour12: false, hour: '2-digit', minute: '2-digit', timeZoneName: 'long' })
    .replace(/([a-z]+(\s[a-z]+)*)$/i, '')
    .split(' ')
    .filter(word => word !== 'Standard')
    .map(word => word.charAt(0))
    .join('')
}
