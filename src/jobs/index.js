'use strict'

module.exports = {
  AcceptJoinRequestsJob: require('./accept-join-requests'),
  AnnounceTrainingsJob: require('./announce-trainings'),
  DiscordMessageJob: require('./discord-message'),
  HealthCheckJob: require('./health-check'),
  PayoutTrainDevelopersJob: require('./payout-train-developers')
}
