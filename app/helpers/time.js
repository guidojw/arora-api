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

function isDst (date) {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== date.getTimezoneOffset()
}

module.exports = {
  getDate,
  getTime,
  isDst
}
