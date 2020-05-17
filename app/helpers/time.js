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

function getDateInfo (dateString) {
    const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
    const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-')))
    const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
    return { day, month: month - 1, year }
}

function getTimeInfo (timeString) {
    const hours = parseInt(timeString.substring(0, timeString.indexOf(':')))
    const minutes = parseInt(timeString.substring(timeString.indexOf(':') + 1, timeString.length))
    return { hours, minutes }
}

module.exports = {
    getDate,
    getTime,
    isDst,
    getDateInfo,
    getTimeInfo
}
