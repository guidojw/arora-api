'use strict'
const acceptJoinRequestsJob = require('./accept-join-requests')
const acceptMtJoinRequestsJob = require('./accept-mt-join-requests')
const backupJob = require('./backup')
const checkSuspensionsJob = require('./check-suspensions')
const discordMessageJob = require('./discord-message')
const finishSuspensionJob = require('./finish-suspension')
const payoutTrainDevelopersJob = require('./payout-train-developers')

module.exports = {
    acceptJoinRequestsJob,
    acceptMtJoinRequestsJob,
    backupJob,
    checkSuspensionsJob,
    discordMessageJob,
    finishSuspensionJob,
    payoutTrainDevelopersJob
}
