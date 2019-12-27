'use strict'
exports.getUnix = date => {
    if (!date) {
        date = new Date()
    }
    return Math.round(date.getTime() / 1000)
}
