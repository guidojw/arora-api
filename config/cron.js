'use strict'
const acceptJoinRequestsJob = require('../app/jobs/accept-join-requests')
const acceptMtJoinRequestsJob = require('../app/jobs/accept-mt-join-requests')
const backupJob = require('../app/jobs/backup')
const checkSuspensionsJob = require('../app/jobs/check-suspensions')
const payoutTrainDevelopersJob = require('../app/jobs/payout-train-developers')
const announceTrainingsJob = require('../app/jobs/announce-trainings')

module.exports = {
    acceptJoinRequestsJob: {
        expression: '*/30 * * * *', // https://crontab.guru/#*/30_*_*_*_*
        job: acceptJoinRequestsJob,
        args: [1018818]
    },
    acceptMtJoinRequestsJob: {
        expression: '0 0 */1 * *', // https://crontab.guru/#0_0_*/1_*_*
        job: acceptMtJoinRequestsJob,
        args: [1018818, 2661380]
    },
    backupJob: {
        expression: '0 0 */1 * *', // https://crontab.guru/#0_0_*/1_*_*
        job: backupJob
    },
    checkSuspensionsJob: {
        expression: '0 */1 * * *', // https://crontab.guru/#0_*/1_*_*_*
        job: checkSuspensionsJob
    },
    payoutTrainDevelopersJob: {
        expression: '0 12 * * 6', // https://crontab.guru/#0_12_*_*_6
        job: payoutTrainDevelopersJob,
        args: [1018818]
    },
    announceTrainingsJob: {
        expression: '0 0 */1 * *', // https://crontab.guru/#0_0_*/1_*_*
        job: announceTrainingsJob,
        args: [1018818]
    }
}
