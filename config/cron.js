'use strict'
const acceptJoinRequestsJob = require('../app/jobs/accept-join-requests')
const acceptMtJoinRequestsJob = require('../app/jobs/accept-mt-join-requests')
const backupJob = require('../app/jobs/backup')
const checkSuspensionsJob = require('../app/jobs/check-suspensions')

module.exports = {
  'acceptJoinRequestsJob': {
    'expression': '*/30 * * * *',
    'job': acceptJoinRequestsJob,
    'args': [1018818]
  },
  'acceptMtJoinRequestsJob': {
    'expression': '0 0 */1 * *',
    'job': acceptMtJoinRequestsJob,
    'args': [1018818, 2661380]
  },
  'backupJob': {
    'expression': '0 0 */1 * *',
    'job': backupJob
  },
  'checkSuspensionsJob': {
    'expression': '0 */1 * * *',
    'job': checkSuspensionsJob
  }
}
