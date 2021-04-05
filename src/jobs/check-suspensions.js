'use strict'

const cron = require('node-schedule')

const { Suspension } = require('../models')

class CheckSuspensionsJob {
  constructor (finishSuspensionJob) {
    this._finishSuspensionJob = finishSuspensionJob
  }

  async run () {
    const suspensions = await Suspension.findAll()
    for (const suspension of suspensions) {

      if (suspension.endsAt <= Date.now()) {
        this._finishSuspensionJob.run(suspension)
      } else {
        const jobName = `suspension_${suspension.id}`
        const job = cron.scheduledJobs[jobName]
        if (!job) {
          cron.scheduleJob(
            jobName,
            suspension.endsAt,
            this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
          )
        }
      }
    }
  }
}

module.exports = CheckSuspensionsJob
