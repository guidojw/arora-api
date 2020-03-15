'use strict'
const acceptJoinRequestsJob = require('../app/jobs/accept-join-requests')
const checkSuspensionsJob = require('../app/jobs/check-suspensions')
const acceptMtJoinRequestsJob = require('../app/jobs/accept-mt-join-requests')

module.exports = {
  'acceptJoinRequestsJob': {
    'expression': '*/30 * * * *',
    'job': acceptJoinRequestsJob,
    'args': [1018818]
  },
  'checkSuspensionsJob': {
    'expression': '0 */1 * * *',
    'job': checkSuspensionsJob,
    'args': [1018818]
  },
  'acceptMtJoinRequestsJob': {
    'expression': '0 0 */1 * *',
    'job': acceptMtJoinRequestsJob,
    'args': [1018818, 2661380]
  }
}
