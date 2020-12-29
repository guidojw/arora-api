'use strict'
module.exports = {
  acceptJoinRequestsJob: {
    expression: '*/30 * * * *', // https://crontab.guru/#*/30_*_*_*_*
    job: 'AcceptJoinRequestsJob',
    args: [1018818]
  },
  checkSuspensionsJob: {
    expression: '0 */1 * * *', // https://crontab.guru/#0_*/1_*_*_*
    job: 'CheckSuspensionsJob'
  },
  payoutTrainDevelopersJob: {
    expression: '0 12 * * 6', // https://crontab.guru/#0_12_*_*_6
    job: 'PayoutTrainDevelopersJob',
    args: [1018818]
  },
  announceTrainingsJob: {
    expression: '0 0 */1 * *', // https://crontab.guru/#0_0_*/1_*_*
    job: 'AnnounceTrainingsJob',
    args: [1018818]
  }
}
