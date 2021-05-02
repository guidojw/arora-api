'use strict'

function getDate (date) {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  return `${day}-${month + 1}-${year}`
}

function getTime (date) {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours}:${'0'.repeat(2 - String(minutes).length)}${minutes}`
}

function getTimeZoneAbbreviation (date) {
  return date.toLocaleTimeString('en-us', { hour12: false, hour: '2-digit', minute: '2-digit', timeZoneName: 'long' })
    .replace(/^(2[0-4]|[0-1][1-9]):[0-5]\d\s/, '')
    .split(' ')
    .filter(word => word !== 'Standard')
    .map(word => word.charAt(0))
    .join('')
}

module.exports = {
  getDate,
  getTime,
  getTimeZoneAbbreviation
}
