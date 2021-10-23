import { constants } from '../util'

const { TYPES } = constants

export interface CronConfig { expression: string, job: symbol, args?: any[] }

const cronConfig: { [key: string]: CronConfig } = {
  acceptJoinRequestsJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/30_*_*_*_*
    job: TYPES.AcceptJoinRequestsJob,
    args: [1018818]
  },
  announceTrainingsJob: {
    expression: '0 0 */1 * *', // https://crontab.guru/#0_0_*/1_*_*
    job: TYPES.AnnounceTrainingsJob,
    args: [1018818]
  },
  healthCheckJob: {
    expression: '*/5 * * * *', // https://crontab.guru/#*/5_*_*_*_*
    job: TYPES.HealthCheckJob,
    args: ['main']
  }
  // payoutTrainDevelopersJob: {
  //   expression: '0 12 * * 6', // https://crontab.guru/#0_12_*_*_6
  //   job: TYPES.PayoutTrainDevelopersJob,
  //   args: [1018818]
  // }
}

export default cronConfig
