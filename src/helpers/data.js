'use strict'

function inRange (value, range) {
  return typeof range === 'number'
    ? range === value
    : (range[0] ?? 0) <= value && value <= (range[1] ?? 255)
}

module.exports = {
  inRange
}
