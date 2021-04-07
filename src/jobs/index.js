'use strict'

module.exports = {
  AcceptJoinRequestsJob: require('./accept-join-requests'),
  AnnounceTrainingsJob: require('./announce-trainings'),
  CheckSuspensionsJob: require('./check-suspensions'),
  DiscordMessageJob: require('./discord-message'),
  FinishSuspensionJob: require('./finish-suspension'),
  HealthCheckJob: require('./health-check'),
  PayoutTrainDevelopersJob: require('./payout-train-developers')
}
