'use strict'
const timeHelper = require('./time')

// Method that converts backup name format (export_2020-4-23-0-0.tar)
// to a JavaScript Date object.
function getBackupDate (name) {
  name = name.replace('export_', '')
  name = name.replace('.tar', '')
  name = name.substring(0, name.lastIndexOf('-')) + ':' + name.substring(name.lastIndexOf('-') + 1)
  name = name.substring(0, name.lastIndexOf('-')) + ' ' + name.substring(name.lastIndexOf('-') + 1)

  let [date, time] = name.split(' ')
  const first = date.indexOf('-')
  const last = date.lastIndexOf('-')
  date = date.substring(last + 1) + '-' + date.substring(first + 1, last) + '-' + date.substring(0, first)

  const dateInfo = timeHelper.getDateInfo(date)
  const timeInfo = timeHelper.getTimeInfo(time)
  return new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
}

module.exports = {
  getBackupDate
}
