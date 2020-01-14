'use strict'
const AcceptJoinRequestsJob = require('../app/jobs/accept-join-requests-job')
const CheckSuspensionsJob = require('../app/jobs/check-suspensions-job')
const AcceptMtJoinRequestsJob = require('../app/jobs/accept-mt-join-requests')

module.exports = {
  'acceptJoinRequestsJob': {
    'cron': '*/30 * * * *',
    'class': AcceptJoinRequestsJob,
    'args': [1018818]
  },
  'checkSuspensionsJob': {
    'cron': '0 */1 * * *',
    'class': CheckSuspensionsJob,
    'args': [1018818]
  },
  'acceptMtJoinRequestsJob': {
    'cron': '0 0 */1 * *',
    'class': AcceptMtJoinRequestsJob,
    'args': [1018818, 2661380]
  }
}
