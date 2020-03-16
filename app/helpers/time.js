'use strict'
function getReadableDate(opts) {
    return opts.day + '-' + opts.month + '-' + opts.year
}

function getReadableTime(opts) {
    if (opts.minutes.length === 1) {
        opts.minutes = '0' + opts.minutes
    }
    return opts.hours + ':' + opts.minutes
}

exports.getDate = unix => {
    const dateObject = new Date(unix)
    const day = String(dateObject.getDate())
    const month = String(dateObject.getMonth() + 1)
    const year = String(dateObject.getFullYear())
    return getReadableDate({
        day: day,
        month: month,
        year: year})
}

exports.getTime = unix => {
    const dateObject = new Date(unix)
    const hours = String(dateObject.getHours())
    const minutes = String(dateObject.getMinutes())
    return getReadableTime({hours: hours, minutes: minutes})
}

exports.isDst = unix => {
    const date = new Date(unix)
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
    return Math.max(jan, jul) !== date.getTimezoneOffset()
}
