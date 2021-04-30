import { ContainerBuilder } from 'node-dependency-injection'
import cron from 'node-schedule'
import cronConfig from '../configs/cron'

export default function init (container: ContainerBuilder): void {
  for (const jobConfig of Object.values(cronConfig)) {
    const job = container.get(jobConfig.job)

    if (typeof jobConfig.args !== 'undefined') {
      const [...args] = jobConfig.args
      cron.scheduleJob(jobConfig.expression, job.run.bind(job, ...args))
    } else {
      cron.scheduleJob(jobConfig.expression, job.run.bind(job))
    }
  }
}
