const AcceptJoinRequestsJob = require('../app/jobs/accept-join-requests-job')

module.exports = {
  'acceptJoinRequestsJob': {
    'cron': '*/1 * * * *',
    'class': AcceptJoinRequestsJob,
    'args': [1018818]
  }
}
