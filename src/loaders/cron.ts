import cron, { JobCallback } from 'node-schedule'
import { BaseJob } from '../jobs'
import { Container } from 'inversify'
import cronConfig from '../configs/cron'

export default function init (container: Container): void {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  for (const jobConfig of Object.values(cronConfig)) {
    const job = container.get<BaseJob>(jobConfig.job)

    if (typeof jobConfig.args !== 'undefined') {
      const [...args] = jobConfig.args
      cron.scheduleJob(jobConfig.expression, job.run.bind(job, ...args) as unknown as JobCallback)
    } else {
      cron.scheduleJob(jobConfig.expression, job.run.bind(job) as JobCallback)
    }
  }
}
