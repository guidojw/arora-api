'use strict'
module.exports = {
    AcceptJoinRequestsJob: require('./accept-join-requests'),
    AcceptMtJoinRequestsJob: require('./accept-mt-join-requests'),
    AnnounceTrainingsJob: require('./announce-trainings'),
    BackupJob: require('./backup'),
    CheckSuspensionsJob: require('./check-suspensions'),
    DiscordMessageJob: require('./discord-message'),
    FinishSuspensionJob: require('./finish-suspension'),
    PayoutTrainDevelopersJob: require('./payout-train-developers')
}
