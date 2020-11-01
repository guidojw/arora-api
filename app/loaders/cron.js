'use strict'
const cron = require('node-schedule')

const cronConfig = require('../../config/cron')

function init (container) {
  for (const jobConfig of Object.values(cronConfig)) {
    const job = container.get(jobConfig.job)

    if (jobConfig.args) {
      const [...args] = jobConfig.args
      cron.scheduleJob(jobConfig.expression, job.run.bind(job, ...args))
    } else {
      cron.scheduleJob(jobConfig.expression, job.run.bind(job))
    }
  }
}

module.exports = init
