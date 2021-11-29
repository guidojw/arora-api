import type { BaseJob } from '../jobs'
import type { Container } from 'inversify'
import cron from 'node-schedule'
import cronConfig from '../configs/cron'

export default function init (container: Container): void {
  if ((process.env.NODE_ENV ?? 'development') === 'development') {
    return
  }

  for (const jobConfig of Object.values(cronConfig)) {
    const job = container.get<BaseJob>(jobConfig.job)

    if (typeof jobConfig.args !== 'undefined') {
      const [...args] = jobConfig.args
      cron.scheduleJob(jobConfig.expression, job.run.bind(job, ...args))
    } else {
      cron.scheduleJob(jobConfig.expression, job.run.bind(job))
    }
  }
}
